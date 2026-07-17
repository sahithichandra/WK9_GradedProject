import {
  improveQuestionService,
  summarizeAnswersService,
} from "../services/aiService.js";

export const improveQuestion = async (req, res) => {
  const { title, description, tags } = req.body;

  const suggestion = await improveQuestionService({ title, description, tags });

  res.status(200).json({
    success: true,
    message: "Question improvements generated successfully",
    data: suggestion,
  });
};

export const summarizeAnswers = async (req, res) => {
  const { questionId } = req.params;

  const summary = await summarizeAnswersService(questionId);

  res.status(200).json({
    success: true,
    message: "Answers summarized successfully",
    data: summary,
  });
};
