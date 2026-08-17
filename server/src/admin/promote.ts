import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../lib/db.js";
import { User } from "../models/User.js";

const email = process.argv[2]?.trim().toLowerCase();
if (!email) { console.error("Usage: npm run admin:promote -- owner@example.com"); process.exit(1); }
await connectDB();
const user = await User.findOneAndUpdate({ email, status: "active", emailVerifiedAt: { $ne: null } }, { role: "admin" }, { new: true });
if (!user) { console.error("No active, verified account found. Register and verify the owner account first."); await mongoose.disconnect(); process.exit(1); }
console.info(`[admin] promoted ${user.email}. Use the normal /login page, then open /admin.`);
await mongoose.disconnect();
