import Question from "../models/Question.js";
import { createAppError } from "../utils/createAppError.js";
import Answer from "../models/Answer.js";
import Tag from "../models/Tag.js";
import { handleVote } from "./voteService.js";

export const getAllQuestionsService = async () => {
  const questions = await Question.find({})
    .populate({ path: "author", select: "name" })
    .populate("tags")
    .sort({ createdAt: -1 });

  if (!questions || questions.length === 0) {
    throw createAppError("No questions found", 404);
  }

  // Attach answerCount to each question so the frontend can display and sort by it
  const questionsWithCount = await Promise.all(
    questions.map(async (q) => {
      const answerCount = await Answer.countDocuments({ questionId: q._id });
      return { ...(q.toObject?.() ?? q), answerCount };
    }),
  );

  return questionsWithCount;
};

export const getQuestionByIdService = async (id) => {
  // Increment views and fetch populated question in one query
  let question = await Question.findByIdAndUpdate(
    id,
    { $inc: { views: 1 } },
    { new: true }, // return updated document
  )
    .populate({ path: "author", select: "name" })
    .populate("tags");

  if (!question) {
    throw createAppError("Question not found", 404);
  }

  // Fetch answers for the question.
  const answers = await Answer.find({ questionId: id }).populate({
    path: "author",
    select: "name",
  });

  question = question.toObject(); // convert Mongoose document to plain object
  question.answers = answers;

  return question;
};

export const createQuestionService = async ({
  title,
  description,
  tags,
  author,
}) => {
  const tagArray = tags
    .trim()
    .split(",")
    .map((tag) => tag.trim());

  const tagIds = await Promise.all(
    tagArray.map(async (tag) => {
      const existingTag = await Tag.findOne({ name: tag });
      if (existingTag) return existingTag._id;

      const newTag = new Tag({ name: tag });
      await newTag.save();
      return newTag._id;
    }),
  );

  const newQuestion = new Question({
    title,
    description,
    tags: tagIds,
    author,
  });

  await newQuestion.save();

  return newQuestion;
};

export const updateQuestionService = async (
  id,
  title,
  description,
  tags,
  loggedInUser,
) => {
  const question = await Question.findById(id);

  if (!question) {
    throw createAppError("Question not found", 404);
  }

  if (
    question.author.toString() !== loggedInUser.id.toString() &&
    !loggedInUser.isAdmin
  ) {
    throw createAppError("Not authorized to update this question", 403);
  }

  const tagArray = tags
    .trim()
    .split(",")
    .map((tag) => tag.trim());

  const tagIds = await Promise.all(
    tagArray.map(async (tag) => {
      const existingTag = await Tag.findOne({ name: tag });
      if (existingTag) {
        return existingTag._id;
      }
      const newTag = new Tag({ name: tag });
      await newTag.save();
      return newTag._id;
    }),
  );

  const updatedQuestion = await Question.findByIdAndUpdate(
    id,
    { title, description, tags: tagIds },
    { new: true },
  );

  if (!updatedQuestion) {
    throw createAppError("Question not found", 404);
  }

  return updatedQuestion;
};

export const deleteQuestionService = async (id, loggedInUser) => {
  const question = await Question.findById(id);

  if (!question) {
    throw createAppError("Question not found", 404);
  }

  // Check if the logged-in user is the owner or an admin
  if (
    question.author.toString() !== loggedInUser.id.toString() &&
    !loggedInUser.isAdmin
  ) {
    throw createAppError("Not authorized to delete this question", 403);
  }

  await Question.findByIdAndDelete(id);
  await Answer.deleteMany({ questionId: id }); // optional: delete related answers

  return question;
};

export const upvoteQuestionService = async (questionId, userId) => {
  const document = await handleVote(Question, questionId, userId, "upvote");

  if (!document) {
    throw createAppError("Failed to upvote question", 400);
  }

  return document;
};

export const downvoteQuestionService = async (questionId, userId) => {
  const document = await handleVote(Question, questionId, userId, "downvote");

  if (!document) {
    throw createAppError("Failed to downvote question", 400);
  }

  return document;
};
