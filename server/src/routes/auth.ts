import { Router, type Response } from "express";
import { AccountToken } from "../models/AccountToken.js";
import { Session } from "../models/Session.js";
import { User } from "../models/User.js";
import { createOpaqueToken, hashPassword, hashToken, verifyPassword } from "../lib/auth.js";
import { sendEmail } from "../lib/email.js";
import { emailSchema, loginSchema, registerSchema, resetPasswordSchema, tokenSchema } from "../lib/validation.js";
import { currentUser, requireAuth, SESSION_COOKIE } from "../middleware/auth.js";

export const authRouter = Router();
const SESSION_DAYS = 30;

function publicUser(user: { _id: unknown; name: string; email: string; role: string; emailVerifiedAt?: Date | null }) {
  return { id: String(user._id), name: user.name, email: user.email, role: user.role, emailVerified: Boolean(user.emailVerifiedAt) };
}

function setSessionCookie(res: Response, token: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}${secure}`);
}

async function createSession(res: Response, userId: unknown) {
  const token = createOpaqueToken();
  await Session.create({ userId, tokenHash: token.hash, expiresAt: new Date(Date.now() + SESSION_DAYS * 86400_000) });
  setSessionCookie(res, token.raw);
}

async function issueAccountToken(user: { _id: unknown; email: string; name: string }, purpose: "verify-email" | "reset-password") {
  await AccountToken.deleteMany({ userId: user._id, purpose });
  const token = createOpaqueToken();
  await AccountToken.create({ userId: user._id, tokenHash: token.hash, purpose, expiresAt: new Date(Date.now() + (purpose === "verify-email" ? 24 : 1) * 3600_000) });
  const path = purpose === "verify-email" ? "verify-email" : "reset-password";
  const url = `${process.env.CLIENT_URL ?? "http://localhost:5173"}/${path}?token=${encodeURIComponent(token.raw)}`;
  await sendEmail({ to: user.email, subject: purpose === "verify-email" ? "Verify your CogniSprint email" : "Reset your CogniSprint password", text: `Hello ${user.name},\n\nOpen this secure link to continue:\n${url}\n\nIf you did not request this, you can ignore this email.` });
}

authRouter.post("/register", async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Check the highlighted fields.", issues: parsed.error.flatten().fieldErrors });
    if (await User.exists({ email: parsed.data.email })) return res.status(409).json({ error: "An account with this email already exists." });
    const user = await User.create({ name: parsed.data.name, email: parsed.data.email, passwordHash: await hashPassword(parsed.data.password) });
    await Promise.all([createSession(res, user._id), issueAccountToken(user, "verify-email")]);
    res.status(201).json({ user: publicUser(user) });
  } catch (error) { next(error); }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Enter a valid email and password.", issues: parsed.error.flatten().fieldErrors });
    const user = await User.findOne({ email: parsed.data.email }).select("+passwordHash");
    if (!user || user.status !== "active" || !(await verifyPassword(parsed.data.password, user.passwordHash))) return res.status(401).json({ error: "Email or password is incorrect." });
    user.lastLoginAt = new Date();
    await Promise.all([user.save(), createSession(res, user._id)]);
    res.json({ user: publicUser(user) });
  } catch (error) { next(error); }
});

authRouter.post("/logout", async (req, res, next) => {
  try {
    const raw = req.headers.cookie?.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`))?.[1];
    if (raw) await Session.deleteOne({ tokenHash: hashToken(decodeURIComponent(raw)) });
    res.setHeader("Set-Cookie", `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`);
    res.status(204).end();
  } catch (error) { next(error); }
});

authRouter.get("/me", async (req, res, next) => {
  try { const user = await currentUser(req); res.json({ user: user ? publicUser(user) : null }); } catch (error) { next(error); }
});

authRouter.post("/verify-email", async (req, res, next) => {
  try {
    const parsed = tokenSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "This verification link is invalid." });
    const token = await AccountToken.findOneAndDelete({ tokenHash: hashToken(parsed.data.token), purpose: "verify-email", expiresAt: { $gt: new Date() } });
    if (!token) return res.status(400).json({ error: "This verification link is invalid or expired." });
    await User.updateOne({ _id: token.userId }, { emailVerifiedAt: new Date() });
    res.json({ message: "Your email has been verified." });
  } catch (error) { next(error); }
});

authRouter.post("/resend-verification", requireAuth, async (_req, res, next) => {
  try { const user = res.locals.user; if (!user.emailVerifiedAt) await issueAccountToken(user, "verify-email"); res.json({ message: "If verification is needed, a new email has been sent." }); } catch (error) { next(error); }
});

authRouter.post("/forgot-password", async (req, res, next) => {
  try { const parsed = emailSchema.safeParse(req.body); if (parsed.success) { const user = await User.findOne({ email: parsed.data.email, status: "active" }); if (user) await issueAccountToken(user, "reset-password"); } res.json({ message: "If an account exists, a reset link has been sent." }); } catch (error) { next(error); }
});

authRouter.post("/reset-password", async (req, res, next) => {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Check the new password.", issues: parsed.error.flatten().fieldErrors });
    const token = await AccountToken.findOneAndDelete({ tokenHash: hashToken(parsed.data.token), purpose: "reset-password", expiresAt: { $gt: new Date() } });
    if (!token) return res.status(400).json({ error: "This reset link is invalid or expired." });
    await Promise.all([User.updateOne({ _id: token.userId }, { passwordHash: await hashPassword(parsed.data.password) }), Session.deleteMany({ userId: token.userId })]);
    res.json({ message: "Your password has been reset. Please sign in." });
  } catch (error) { next(error); }
});
