import {createUser, updateUser, getUserProfile  } from "../Controllers/userController.js"
import { getUserQuizStats } from "../Controllers/statsController.js";

import express from "express"

const router = express.Router();

router.post("/create", createUser);
router.post("/update", updateUser);
router.get('/:id', getUserProfile);
router.get('/:id/stats', getUserQuizStats);

export default router;