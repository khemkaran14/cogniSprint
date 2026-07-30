import { Router } from "express";
import { createOrder, verifyPayment, myPayments } from "../controllers/paymentController.js";
import { razorpayWebhook } from "../controllers/webhookController.js";
import { requireAuth } from "../middleware/auth.js";
import { paymentLimiter } from "../middleware/rateLimiters.js";

const router = Router();

router.post("/order", requireAuth, paymentLimiter, createOrder);
router.post("/verify", requireAuth, paymentLimiter, verifyPayment);
router.get("/me", requireAuth, myPayments);
// Mounted separately in index.js without JSON body parsing (needs rawBody for signature check).
router.post("/webhook", razorpayWebhook);

export default router;
