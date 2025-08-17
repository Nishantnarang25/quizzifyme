import express from "express";
import { createQuiz, finalizeQuiz,getQuizzesByUsername, getQuizById, updateQuiz } from "../Controllers/quizController.js";
const router = express.Router();

router.post("/create", createQuiz);
router.post("/finalQuiz", finalizeQuiz)
router.post('/my-quizzes', getQuizzesByUsername);
router.get('/:quizId', getQuizById);
router.put('/:quizId/update', updateQuiz);



export default router;
