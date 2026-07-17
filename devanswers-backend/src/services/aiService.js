import { GoogleGenAI } from "@google/genai";

import Question from "../models/Question.js";
import Answer from "../models/Answer.js";
import { createAppError } from "../utils/createAppError.js";

// Override with GEMINI_MODEL in .env. The default is a generally-available
// model that honours response_format JSON schemas and has free-tier headroom;
// larger models such as gemini-3.5-flash allow only ~20 free requests.
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

// A question needs at least this many answers before a summary is worth generating.
export const MIN_ANSWERS_FOR_SUMMARY = 3;

let client;

const getClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw createAppError("AI service is unavailable: GEMINI_API_KEY is not set", 500);
  }

  client ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
};

// Wraps every Gemini call so upstream failures surface as 502s rather than generic 500s.
const callGemini = async (params) => {
  // Resolved outside the try so a configuration error (missing key) is not
  // mislabelled as an upstream failure.
  const ai = getClient();

  let interaction;
  try {
    interaction = await ai.interactions.create({
      model: GEMINI_MODEL,
      ...params,
    });
  } catch (error) {
    // Surface quota/rate-limit errors as a 429 with a short, actionable message
    // rather than leaking the provider's full billing blurb into the UI.
    const status = error.status ?? Number(/^(\d{3})/.exec(error.message)?.[1]);
    if (status === 429) {
      const retrySeconds = /retry in ([\d.]+)s/.exec(error.message)?.[1];
      throw createAppError(
        retrySeconds
          ? `The AI service is busy right now. Please try again in about ${Math.ceil(Number(retrySeconds))} seconds.`
          : "The AI service is busy right now. Please try again in a moment.",
        429,
      );
    }

    throw createAppError(`AI request failed: ${error.message}`, 502);
  }

  const text = interaction.output_text?.trim();
  if (!text) {
    throw createAppError("AI returned an empty response", 502);
  }

  return text;
};

const IMPROVE_SYSTEM_INSTRUCTION = `You are an editor for a developer Q&A site, similar to Stack Overflow.
You rewrite draft questions so they are clear, specific and easy for other developers to answer.

Rules:
- Keep the author's original intent, technologies and meaning. Never invent details, code, versions or error messages that the author did not provide.
- title: one specific, searchable question describing the actual problem. Always phrase it as a direct question ending with a question mark, even when the draft is worded as a statement.
- description: expand into clear prose that states what the author is trying to do, what happens instead, and what they have already tried. Preserve any code exactly as given. Use Markdown where it helps readability. Always close with the specific question the author needs answered, phrased as a direct question ending with a question mark.
- tags: 2 to 5 lowercase, hyphenated technology tags relevant to the question (for example "javascript", "react", "node-js").
- If a field is empty or unusable, infer a sensible value from the other fields.`;

const IMPROVE_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    tags: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
      maxItems: 5,
    },
  },
  required: ["title", "description", "tags"],
};

/**
 * Sends the draft title, description and tags to Gemini in a single call and
 * returns improved versions of all three fields.
 */
export const improveQuestionService = async ({ title, description, tags }) => {
  const draftTitle = title?.trim();
  const draftDescription = description?.trim();

  if (!draftTitle && !draftDescription) {
    throw createAppError("A title or description is required to improve a question", 400);
  }

  const text = await callGemini({
    system_instruction: IMPROVE_SYSTEM_INSTRUCTION,
    input: [
      "Improve this draft question.",
      "",
      `Title: ${draftTitle || "(not provided)"}`,
      `Description: ${draftDescription || "(not provided)"}`,
      `Tags: ${tags?.trim() || "(not provided)"}`,
    ].join("\n"),
    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: IMPROVE_RESPONSE_SCHEMA,
    },
  });

  let suggestion;
  try {
    suggestion = JSON.parse(text);
  } catch {
    throw createAppError("AI returned a malformed suggestion", 502);
  }

  return {
    title: suggestion.title?.trim() ?? "",
    description: suggestion.description?.trim() ?? "",
    // Normalised to an array so the client controls how tags are rendered and applied.
    tags: Array.isArray(suggestion.tags)
      ? suggestion.tags.map((tag) => String(tag).trim()).filter(Boolean)
      : [],
  };
};

const SUMMARISE_SYSTEM_INSTRUCTION = `You summarise the answers on a developer Q&A page.

Write 3 to 5 sentences of plain text that tell a reader what the answers collectively say:
the approach they agree on, any notable alternatives, and any caveats worth knowing.

Rules:
- Plain text only. No Markdown, headings, bullet points or code blocks.
- Summarise only what the answers actually say. Never add outside information.
- Address the reader directly about the answers; do not mention that you are an AI.`;

/**
 * Loads a question and its answers, then sends both to Gemini in a single call
 * and returns a short plain-text summary of the answers.
 */
export const summarizeAnswersService = async (questionId) => {
  const question = await Question.findById(questionId);

  if (!question) {
    throw createAppError("Question not found", 404);
  }

  const answers = await Answer.find({ questionId }).sort({ createdAt: 1 });

  if (answers.length < MIN_ANSWERS_FOR_SUMMARY) {
    throw createAppError(
      `A question needs at least ${MIN_ANSWERS_FOR_SUMMARY} answers to be summarized`,
      400,
    );
  }

  const summary = await callGemini({
    system_instruction: SUMMARISE_SYSTEM_INSTRUCTION,
    input: [
      `Question: ${question.title}`,
      "",
      question.description,
      "",
      "Answers:",
      ...answers.map((answer, index) => `Answer ${index + 1}: ${answer.answerText}`),
    ].join("\n"),
  });

  return { summary, answerCount: answers.length };
};
