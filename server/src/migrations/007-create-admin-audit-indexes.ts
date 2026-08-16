import type { Migration } from "./types.js";

export const createAdminAuditIndexes: Migration = {
  id: "202608120007-create-admin-audit-indexes",
  checksum: "sha256:5c98838d49117d50ce336ec8604066c094d28ca0bcb36b8e5b3c70e0507a3eed",
  async up({ connection, log }) {
    await connection.collection("auditevents").createIndex({ createdAt: -1 }, { name: "audit_recent" });
    await connection.collection("auditevents").createIndex({ targetType: 1, targetId: 1, createdAt: -1 }, { name: "audit_target_history" });
    await connection.collection("auditevents").createIndex({ actorUserId: 1 }, { name: "audit_actor" });
    log("admin audit indexes ready");
  },
};
