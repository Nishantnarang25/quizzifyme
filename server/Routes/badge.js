import express from 'express';
import { getAllBadges } from '../Controllers/badgeController.js';

const router = express.Router();

router.get('/', getAllBadges);

export default router;