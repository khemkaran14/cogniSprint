import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getStateForQuestions,
  toggleBookmark,
  togglePracticed,
  myBookmarks,
  myProgress,
} from "../controllers/bookmarkController.js";

const router = Router();

router.use(requireAuth);

router.get("/state", getStateForQuestions);
router.get("/me", myBookmarks);
router.get("/progress", myProgress);
router.post("/:questionId/toggle-bookmark", toggleBookmark);
router.post("/:questionId/toggle-practiced", togglePracticed);

export default router;
