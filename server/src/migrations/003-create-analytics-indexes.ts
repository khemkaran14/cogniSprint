import type { Migration } from "./types.js";

export const createAnalyticsIndexes: Migration = {
  id: "202608120003-create-analytics-indexes",
  checksum: "sha256:d0969f680ab533e8114e97690233829916122302324333c227b0978cc46a078f",
  async up({ connection, log }) {
    await connection.collection("lessonsubmissions").createIndex(
      { userId: 1, createdAt: 1 },
      { name: "userId_1_createdAt_1" }
    );
    await connection.collection("lessonprogresses").createIndex(
      { userId: 1, completedAt: 1 },
      { name: "userId_1_completedAt_1" }
    );
    log("learning analytics indexes ready");
  },
};
