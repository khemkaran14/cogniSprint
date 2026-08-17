import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { AccountToken } from "../models/AccountToken.js";
import { Session } from "../models/Session.js";
import { User } from "../models/User.js";
import { createOpaqueToken, hashPassword, hashToken, verifyPassword } from "../lib/auth.js";
import { sendEmail } from "../lib/email.js";
import { emailSchema, loginSchema, registerSchema, resetPasswordSchema, tokenSchema } from "../lib/validation.js";
import { currentUser, requireAuth, SESSION_COOKIE } from "../middleware/auth.js";
import { sessionCookieAttributes } from "../lib/security.js";

export const authRouter = Router();
const SESSION_DAYS = 30;

function publicUser(user: { _id: unknown; name: string; email: string; role: string; timezone?: string; emailVerifiedAt?: Date | null }) {
  return { id: String(user._id), name: user.name, email: user.email, role: user.role, timezone: user.timezone ?? "UTC", emailVerified: Boolean(user.emailVerifiedAt) };
}

function setSessionCookie(res: Response, token: string) {
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=${encodeURIComponent(token)}; ${sessionCookieAttributes()}; Max-Age=${SESSION_DAYS * 86400}`);
}

async function createSession(req: Request, res: Response, userId: unknown) {
  const token = createOpaqueToken();
  await Session.create({ userId, tokenHash: token.hash, expiresAt: new Date(Date.now() + SESSION_DAYS * 86400_000), userAgent: req.get("user-agent")?.slice(0, 500) || "Unknown device", ipAddress: req.ip || "Unknown", lastSeenAt: new Date() });
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
    await Promise.all([createSession(req, res, user._id), issueAccountToken(user, "verify-email")]);
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
    await Promise.all([user.save(), createSession(req, res, user._id)]);
    res.json({ user: publicUser(user) });
  } catch (error) { next(error); }
});

authRouter.post("/logout", async (req, res, next) => {
  try {
    const raw = req.headers.cookie?.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`))?.[1];
    if (raw) await Session.deleteOne({ tokenHash: hashToken(decodeURIComponent(raw)) });
    res.setHeader("Set-Cookie", `${SESSION_COOKIE}=; ${sessionCookieAttributes()}; Max-Age=0`);
    res.status(204).end();
  } catch (error) { next(error); }
});

authRouter.get("/me", async (req, res, next) => {
  try { const user = await currentUser(req); res.json({ user: user ? publicUser(user) : null }); } catch (error) { next(error); }
});

const profileSchema = z.object({ name: z.string().trim().min(2).max(100), timezone: z.string().trim().min(1).max(100) });
authRouter.patch("/profile", requireAuth, async (req, res, next) => {
  try {
    const parsed = profileSchema.safeParse(req.body);
    if (!parsed.success) return res.status(422).json({ error: "Check your profile details.", issues: parsed.error.flatten().fieldErrors });
    try { new Intl.DateTimeFormat("en", { timeZone: parsed.data.timezone }); } catch { return res.status(422).json({ error: "Choose a valid IANA timezone." }); }
    res.locals.user.name = parsed.data.name;
    res.locals.user.timezone = parsed.data.timezone;
    await res.locals.user.save();
    res.json({ user: publicUser(res.locals.user) });
  } catch (error) { next(error); }
});

authRouter.get("/sessions", requireAuth, async (req, res, next) => {
  try {
    const sessions = await Session.find({ userId: res.locals.user._id, expiresAt: { $gt: new Date() } }).sort({ lastSeenAt: -1 }).lean();
    res.json({ sessions: sessions.map((session) => ({ id: String(session._id), userAgent: session.userAgent, ipAddress: session.ipAddress, lastSeenAt: session.lastSeenAt, createdAt: session.createdAt, expiresAt: session.expiresAt, current: String(session._id) === (req as Request & { sessionId?: string }).sessionId })) });
  } catch (error) { next(error); }
});

authRouter.delete("/sessions/:id", requireAuth, async (req, res, next) => {
  try {
    if (!z.string().regex(/^[a-f\d]{24}$/i).safeParse(req.params.id).success) return res.status(404).json({ error: "Session not found." });
    const deleted = await Session.deleteOne({ _id: req.params.id, userId: res.locals.user._id });
    if (!deleted.deletedCount) return res.status(404).json({ error: "Session not found." });
    res.status(204).end();
  } catch (error) { next(error); }
});

authRouter.delete("/sessions", requireAuth, async (req, res, next) => {
  try {
    const currentId = (req as Request & { sessionId?: string }).sessionId;
    await Session.deleteMany({ userId: res.locals.user._id, ...(currentId ? { _id: { $ne: currentId } } : {}) });
    res.status(204).end();
  } catch (error) { next(error); }
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
