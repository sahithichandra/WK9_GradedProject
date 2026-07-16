import express from 'express';
import { getAllTags, getQuestionsByTag } from '../controllers/tagController.js';

const router = express.Router();

// Public routes - no authentication required
router.get('/', getAllTags);
router.get('/:tagId/questions', getQuestionsByTag);

export default router;
