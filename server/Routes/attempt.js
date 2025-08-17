import express from 'express';
import { createAttempt } from '../Controllers/attemptController.js'

const router = express.Router();

router.post('/', createAttempt); // POST /api/attempts

export default router;
