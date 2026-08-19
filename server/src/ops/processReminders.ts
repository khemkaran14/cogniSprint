import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../lib/db.js";
import { enqueueEmail } from "../lib/emailQueue.js";
import { nextReminderAt } from "../lib/reminders.js";
import { ReminderPreference } from "../models/ReminderPreference.js";
import { User } from "../models/User.js";
await connectDB(); const now = new Date(); const due = await ReminderPreference.find({ enabled: true, nextReminderAt: { $lte: now } }).limit(500);
let queued = 0; for (const preference of due) { const user = await User.findOne({ _id: preference.userId, status: "active" }).select("name email timezone"); if (user) { await enqueueEmail({ idempotencyKey: `reminder:${preference._id}:${preference.nextReminderAt?.toISOString()}`, category: "reminder", userId: user._id, to: user.email, subject: "Your CogniSprint practice reminder", text: `Hello ${user.name},\n\nYour next learning session is ready when you are. Sign in to continue your progress.\n\nYou can disable reminders from your learning dashboard.` }); queued += 1; } preference.nextReminderAt = nextReminderAt(user?.timezone || "UTC", preference.localTime, preference.weekdays, now); await preference.save(); }
console.info(JSON.stringify({ event: "reminders_processed", due: due.length, queued })); await mongoose.disconnect();
