import { createAppError } from '../utils/createAppError.js';
import Answer from '../models/Answer.js';
import { handleVote } from './voteService.js';

export const getAnswersByQuestionIdService = async (questionId) => {
  const answers = await Answer.find({ questionId }).populate('author', 'name');

  if (!answers || answers.length === 0) {
    throw createAppError("No answers found for this question", 404);
  }

  return answers;
};


export const createAnswerService = async ({ questionId, answerText, author }) => {
  const newAnswer = new Answer({
    questionId,
    answerText,
    author,
  });

  await newAnswer.save();

  const populatedAnswer = await Answer.findById(newAnswer._id).populate('author', 'name');

  if (!populatedAnswer) {
    throw createAppError('Failed to populate answer after saving', 500);
  }

  return populatedAnswer;
};

export const updateAnswerService = async (answerId, answerText, loggedInUser) => {
  const answer = await Answer.findById(answerId);

  if (!answer) {
    throw createAppError('Answer not found', 404);
  }

  if (
    answer.author.toString() !== loggedInUser.id.toString() &&
    !loggedInUser.isAdmin
  ) {
    throw createAppError('Not authorized to update this answer', 403);
  }

  answer.answerText = answerText;
  await answer.save();

  return Answer.findById(answerId).populate('author', 'name');
};

export const deleteAnswerService = async (answerId, loggedInUser) => {
  const answer = await Answer.findById(answerId);

  if (!answer) {
    throw createAppError("Answer not found", 404);
  }

  if (
    answer.author.toString() !== loggedInUser.id.toString() &&
    !loggedInUser.isAdmin
  ) {
    throw createAppError('Not authorized to delete this answer', 403);
  }

  await Answer.findByIdAndDelete(answerId);
};

export const upvoteAnswerService = async (answerId, userId) => {
  const document = await handleVote(Answer, answerId, userId, "upvote");

  if (!document) {
    throw createAppError("Failed to upvote answer", 400);
  }

  return document;
};


export const downvoteAnswerService = async (answerId, userId) => {
  const document = await handleVote(Answer, answerId, userId, "downvote");

  if (!document) {
    throw createAppError("Failed to downvote answer", 400);
  }

  return document;
};