import type { Migration } from "./types.js";

export const createAchievementIndexes: Migration = {
  id: "202608180018-create-achievement-indexes",
  checksum: "sha256:5e3552c15d7c485dd03b015f9556a35d94a460597d018125b7152f20d5d0b976",
  async up({ connection, log }) {
    await connection.collection("achievements").createIndex({ userId: 1, key: 1 }, { unique: true, name: "user_achievement" });
    await connection.collection("achievements").createIndex({ userId: 1, earnedAt: -1 }, { name: "achievement_history" });
    log("achievement indexes ready");
  },
};
