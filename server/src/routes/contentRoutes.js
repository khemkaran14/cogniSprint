import { Router } from "express";
import { listTools, getTool, getCategoryQuestions, searchQuestions } from "../controllers/contentController.js";
import { attachUserIfPresent } from "../middleware/auth.js";

const router = Router();

router.get("/tools", listTools);
router.get("/search", attachUserIfPresent, searchQuestions);
router.get("/tools/:slug", getTool);
router.get("/tools/:slug/categories/:categorySlug/questions", attachUserIfPresent, getCategoryQuestions);

export default router;
