import { z } from "zod";

export const newsletterSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  topic: z.enum(["general", "payment", "access", "technical"]),
  message: z.string().trim().min(10, "Please add a few more details (10+ characters)"),
  /** Honeypot field — must stay empty. */
  website: z.string().max(0).optional(),
});

export const challengeReportSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  overallScore: z.number().min(0).max(100),
  durationSeconds: z.number().min(0),
});

export const checkoutCustomerSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .min(10, "Enter a valid phone number")
    .max(15, "Enter a valid phone number")
    .regex(/^[0-9+\s-]+$/, "Enter a valid phone number"),
  acceptedTerms: z.literal(true),
});

export const createOrderSchema = z.object({
  productSlug: z.string().min(1),
  couponCode: z.string().trim().optional(),
  customer: checkoutCustomerSchema,
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export const refundSchema = z.object({
  orderId: z.string().min(1),
  reason: z.string().trim().min(3, "Add a short reason for the refund"),
});

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password is too long") // bcrypt silently truncates beyond 72 bytes
  .regex(/[a-zA-Z]/, "Password must include a letter")
  .regex(/[0-9]/, "Password must include a number");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});
