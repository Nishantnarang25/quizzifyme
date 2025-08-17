import express from 'express';
import { getDashboardData } from '../Controllers/dashboardController.js';

const router = express.Router();

router.get('/:username', getDashboardData);

export default router;
