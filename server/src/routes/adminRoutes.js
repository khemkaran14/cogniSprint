import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import {
  getOverview,
  listUsers,
  updateUser,
  listSubscriptions,
  listPayments,
  createTool,
  updateTool,
  deleteTool,
  createCategory,
  updateCategory,
  deleteCategory,
  listQuestionsAdmin,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "../controllers/adminController.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/overview", getOverview);

router.get("/users", listUsers);
router.patch("/users/:id", updateUser);

router.get("/subscriptions", listSubscriptions);
router.get("/payments", listPayments);

router.post("/tools", createTool);
router.patch("/tools/:id", updateTool);
router.delete("/tools/:id", deleteTool);

router.post("/categories", createCategory);
router.patch("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

router.get("/questions", listQuestionsAdmin);
router.post("/questions", createQuestion);
router.patch("/questions/:id", updateQuestion);
router.delete("/questions/:id", deleteQuestion);

export default router;
