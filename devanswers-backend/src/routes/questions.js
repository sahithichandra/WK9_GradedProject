import express from "express";

import {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  upvoteQuestion,
  downvoteQuestion,
} from "../controllers/questionController.js";
import {
  getAnswersByQuestionId,
  createAnswer,
} from "../controllers/answerController.js";
import authenticate from "../middleware/authHandler.js";

const router = express.Router();

// Public routes - no authentication required
router.get("/", getAllQuestions);
router.get("/:id", getQuestionById);
router.get("/:questionId/answers", getAnswersByQuestionId);

// Protected routes - authentication required
router.post("/", authenticate, createQuestion);
router.put("/:id", authenticate, updateQuestion);
router.delete("/:id", authenticate, deleteQuestion);
router.post("/:id/upvote", authenticate, upvoteQuestion);
router.post("/:id/downvote", authenticate, downvoteQuestion);
router.post("/:questionId/answers", authenticate, createAnswer);

export default router;
