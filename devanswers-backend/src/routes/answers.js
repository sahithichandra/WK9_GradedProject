import express from "express";
import {
  getAnswersByQuestionId,
  createAnswer,
  updateAnswer,
  deleteAnswer,
  upvoteAnswer,
  downvoteAnswer,
} from "../controllers/answerController.js";
import authenticate from "../middleware/authHandler.js";

const router = express.Router();

// Public routes - no authentication required
router.get("/question/:questionId", getAnswersByQuestionId);

// Protected routes - authentication required
router.post("/question/:questionId", authenticate, createAnswer);
router.put("/:answerId", authenticate, updateAnswer);
router.delete("/:answerId", authenticate, deleteAnswer);
router.post("/:answerId/upvote", authenticate, upvoteAnswer);
router.post("/:answerId/downvote", authenticate, downvoteAnswer);

export default router;
