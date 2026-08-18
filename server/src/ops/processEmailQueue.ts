import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../lib/db.js";
import { deliverEmail } from "../lib/email.js";
import { nextEmailAttempt } from "../lib/emailQueue.js";
import { EmailDelivery } from "../models/EmailDelivery.js";

await connectDB();
let sent = 0; let failed = 0;
try {
  for (let index = 0; index < 100; index += 1) {
    const now = new Date();
    const delivery = await EmailDelivery.findOneAndUpdate({ attempts: { $lt: 8 }, $or: [{ status: { $in: ["queued", "failed"] }, nextAttemptAt: { $lte: now } }, { status: "sending", updatedAt: { $lt: new Date(now.getTime() - 10 * 60_000) } }] }, { status: "sending", $inc: { attempts: 1 } }, { sort: { nextAttemptAt: 1 }, new: true });
    if (!delivery) break;
    try {
      const result = await deliverEmail(delivery);
      if (result.sent) { delivery.status = "sent"; delivery.sentAt = new Date(); delivery.providerMessageId = result.providerMessageId; delivery.lastError = undefined; sent += 1; }
      else { delivery.status = "failed"; delivery.lastError = result.error?.slice(0, 500); delivery.nextAttemptAt = nextEmailAttempt(delivery.attempts); failed += 1; }
    } catch (error) { delivery.status = "failed"; delivery.lastError = error instanceof Error ? error.message.slice(0, 500) : "Unknown delivery error"; delivery.nextAttemptAt = nextEmailAttempt(delivery.attempts); failed += 1; }
    await delivery.save();
  }
  console.info(JSON.stringify({ type: "email_queue_run", sent, failed }));
} finally { await mongoose.disconnect(); }
