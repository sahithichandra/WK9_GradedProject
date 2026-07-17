import express from "express";

import { improveQuestion, summarizeAnswers } from "../controllers/aiController.js";
import authenticate from "../middleware/authHandler.js";

const router = express.Router();

// Protected routes - all AI features require authentication
router.post("/improve-question", authenticate, improveQuestion);
router.post("/questions/:questionId/summary", authenticate, summarizeAnswers);

export default router;
