import {
  getAnswersByQuestionIdService,
  createAnswerService,
  updateAnswerService,
  deleteAnswerService,
  upvoteAnswerService,
  downvoteAnswerService
} from "../services/answerService.js";

export const getAnswersByQuestionId = async (req, res) => {
  const { questionId } = req.params;
  const answers = await getAnswersByQuestionIdService(questionId);

  res.status(200).json({
    success: true,
    message: "Answers fetched successfully",
    data: answers,
  });
};

export const createAnswer = async (req, res) => {
  const { questionId } = req.params;
  const { answerText } = req.body;
  const author = req.user.id;

  const populatedAnswer = await createAnswerService({ questionId, answerText, author });

  res.status(201).json({
    success: true,
    message: 'Answer created successfully',
    data: populatedAnswer,
  });
};

export const updateAnswer = async (req, res) => {
  const { answerId } = req.params;
  const { answerText } = req.body;

  const updatedAnswer = await updateAnswerService(answerId, answerText, req.user);

  res.status(200).json({
    success: true,
    message: 'Answer updated successfully',
    data: updatedAnswer,
  });
};

export const deleteAnswer = async (req, res) => {
  const { answerId } = req.params;

  await deleteAnswerService(answerId, req.user);

  res.status(200).json({
    success: true,
    message: "Answer deleted successfully",
  });
};

export const upvoteAnswer = async (req, res) => {
  const { answerId } = req.params;
  const userId = req.user.id;

  const document = await upvoteAnswerService(answerId, userId);

  res.status(200).json({
    success: true,
    message: "Answer upvoted successfully",
    data: {
      _id: document._id,
      upvotes: document.upvotes,
      downvotes: document.downvotes,
      voteCount: document.voteCount,
    }
  });
};

export const downvoteAnswer = async (req, res) => {
  const { answerId } = req.params;
  const userId = req.user.id;

  const document = await downvoteAnswerService(answerId, userId);

  res.status(200).json({
    success: true,
    message: "Answer downvoted successfully",
    data: {
      _id: document._id,
      upvotes: document.upvotes,
      downvotes: document.downvotes,
      voteCount: document.voteCount,
    }
  });
};