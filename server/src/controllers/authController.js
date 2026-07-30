import User from "../models/User.js";
import { signToken, AUTH_COOKIE_NAME, authCookieOptions } from "../utils/token.js";

export async function register(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters" });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ message: "An account with this email already exists" });

  const user = new User({ name, email });
  await user.setPassword(password);
  await user.save();

  const token = signToken(user);
  res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions);
  res.status(201).json({ user: user.toSafeJSON() });
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  if (user.status === "banned") {
    return res.status(403).json({ message: "This account has been suspended" });
  }

  const token = signToken(user);
  res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions);
  res.json({ user: user.toSafeJSON() });
}

export function logout(_req, res) {
  res.clearCookie(AUTH_COOKIE_NAME, authCookieOptions);
  res.json({ message: "Logged out" });
}

export function me(req, res) {
  res.json({ user: req.user.toSafeJSON() });
}
