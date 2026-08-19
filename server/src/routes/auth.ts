import { Router, type Response } from "express";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../lib/validation.js";
import {
  hashPassword,
  verifyPassword,
  signAuthToken,
  generateVerificationToken,
  hashToken,
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_MAX_AGE_MS,
} from "../lib/auth.js";
import { sendEmail } from "../lib/email.js";
import { User } from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

const isProduction = process.env.NODE_ENV === "production";

function setSessionCookie(res: Response, token: string) {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: AUTH_COOKIE_MAX_AGE_MS,
    path: "/",
  });
}

function publicUser(user: { _id: unknown; name: string; email: string; role: string; emailVerifiedAt?: Date | null }) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    emailVerified: Boolean(user.emailVerifiedAt),
  };
}

authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: "Invalid input.", issues: parsed.error.flatten().fieldErrors });
  }
  const { name, email, password } = parsed.data;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    // Don't reveal whether the account has a password already (checkout
    // auto-provisions accounts) — a generic message avoids account
    // enumeration either way.
    return res.status(409).json({ error: "An account with this email already exists. Try logging in instead." });
  }

  const passwordHash = await hashPassword(password);
  const { rawToken, tokenHash } = generateVerificationToken();

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    emailVerificationTokenHash: tokenHash,
    emailVerificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  const clientUrl = process.env.CLIENT_URL ?? "https://cognisprint.divyrs.com";
  await sendEmail({
    to: user.email,
    subject: "Verify your CogniSprint account",
    text: `Welcome to CogniSprint! Verify your email to get started:\n${clientUrl}/verify-email?token=${rawToken}\n\nThis link expires in 24 hours.`,
  });

  const token = signAuthToken({ sub: String(user._id), role: user.role });
  setSessionCookie(res, token);
  res.status(201).json({ user: publicUser(user) });
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: "Invalid input.", issues: parsed.error.flatten().fieldErrors });
  }
  const { email, password } = parsed.data;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: "Incorrect email or password." });
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: "Incorrect email or password." });
  }

  const token = signAuthToken({ sub: String(user._id), role: user.role });
  setSessionCookie(res, token);
  res.json({ user: publicUser(user) });
});

authRouter.post("/logout", (_req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, { path: "/" });
  res.json({ success: true });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.userId).lean();
  if (!user) return res.status(401).json({ error: "Please log in to continue." });
  res.json({ user: publicUser(user) });
});

authRouter.post("/verify-email", async (req, res) => {
  const parsed = verifyEmailSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: "Invalid input." });
  }

  const tokenHash = hashToken(parsed.data.token);
  const user = await User.findOne({
    emailVerificationTokenHash: tokenHash,
    emailVerificationExpiresAt: { $gt: new Date() },
  });

  if (!user) {
    return res.status(400).json({ error: "This verification link is invalid or has expired." });
  }

  user.emailVerifiedAt = new Date();
  user.emailVerificationTokenHash = undefined;
  user.emailVerificationExpiresAt = undefined;
  await user.save();

  res.json({ success: true });
});

authRouter.post("/forgot-password", async (req, res) => {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: "Invalid input." });
  }

  const user = await User.findOne({ email: parsed.data.email.toLowerCase() });
  // Always return success — never reveal whether an email is registered.
  if (!user) return res.json({ success: true });

  const { rawToken, tokenHash } = generateVerificationToken();
  user.passwordResetTokenHash = tokenHash;
  user.passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  const clientUrl = process.env.CLIENT_URL ?? "https://cognisprint.divyrs.com";
  await sendEmail({
    to: user.email,
    subject: "Reset your CogniSprint password",
    text: `Reset your password:\n${clientUrl}/reset-password?token=${rawToken}\n\nThis link expires in 1 hour. If you didn't request this, you can ignore this email.`,
  });

  res.json({ success: true });
});

authRouter.post("/reset-password", async (req, res) => {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: "Invalid input.", issues: parsed.error.flatten().fieldErrors });
  }

  const tokenHash = hashToken(parsed.data.token);
  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: { $gt: new Date() },
  });

  if (!user) {
    return res.status(400).json({ error: "This reset link is invalid or has expired." });
  }

  user.passwordHash = await hashPassword(parsed.data.password);
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpiresAt = undefined;
  await user.save();

  const token = signAuthToken({ sub: String(user._id), role: user.role });
  setSessionCookie(res, token);
  res.json({ user: publicUser(user) });
});
