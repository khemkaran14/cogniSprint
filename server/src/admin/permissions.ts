import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../lib/db.js";
import { adminPermissions, type AdminPermission } from "../middleware/admin.js";
import { User } from "../models/User.js";

const email = process.argv[2]?.trim().toLowerCase();
const requested = process.argv.slice(3).flatMap((value) => value.split(",")).map((value) => value.trim()).filter(Boolean);
if (!email || !requested.length) {
  console.error(`Usage: npm run admin:permissions -- admin@example.com <*|${adminPermissions.join(",")}>`);
  process.exit(1);
}
const invalid = requested.filter((permission) => permission !== "*" && !adminPermissions.includes(permission as AdminPermission));
if (invalid.length || (requested.includes("*") && requested.length > 1)) {
  console.error(`Invalid permission set: ${invalid.join(", ") || "wildcard must be used alone"}.`);
  process.exit(1);
}
await connectDB();
const user = await User.findOneAndUpdate({ email, role: "admin", status: "active" }, { adminPermissions: requested }, { new: true }).select("email +adminPermissions");
if (!user) { console.error("No active administrator found."); await mongoose.disconnect(); process.exit(1); }
console.info(`[admin] permissions for ${user.email}: ${user.adminPermissions.join(", ")}`);
await mongoose.disconnect();
