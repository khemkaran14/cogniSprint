import { Achievement } from "../models/Achievement.js";
import { earnedAchievements } from "./gamification.js";
import type { Types } from "mongoose";

type Progress = { status: string; bestScore: number; completedAt?: Date | null };

export async function syncAchievements(userId: Types.ObjectId, progress: Progress[], now = new Date()) {
  const earned = earnedAchievements(progress, now);
  if (earned.length) {
    try {
      await Achievement.collection.bulkWrite(earned.map((achievement) => ({
        updateOne: {
          filter: { userId, key: achievement.key },
          update: { $setOnInsert: { userId, ...achievement, earnedAt: now, source: "lesson_progress" } },
          upsert: true,
        },
      })), { ordered: false });
    } catch (error) {
      // Concurrent dashboard/completion requests may race on the unique user/key index.
      // The other request has already persisted the same immutable achievement.
      if ((error as { code?: number }).code !== 11000) throw error;
    }
  }
  return Achievement.find({ userId }).select("key label earnedAt source").sort({ earnedAt: 1, key: 1 }).lean();
}
