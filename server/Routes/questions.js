import express from 'express';
import { getQuizById } from '../Controllers/questionsController.js';

const router = express.Router();

// GET quiz by ID
router.get('/:quizId', getQuizById);

export default router;
