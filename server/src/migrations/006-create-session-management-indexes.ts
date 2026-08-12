import type { Migration } from "./types.js";

export const createSessionManagementIndexes: Migration = {
  id: "202608120006-create-session-management-indexes",
  checksum: "sha256:f61976c22d41de225bb67de099594c73f82f3dbdc08698c8818e8ad3cae59e91",
  async up({ connection, log }) {
    await connection.collection("sessions").createIndex(
      { userId: 1, lastSeenAt: -1 },
      { name: "user_session_activity" }
    );
    log("session management index ready");
  },
};
