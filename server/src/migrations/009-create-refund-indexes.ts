import type { Migration } from "./types.js";

export const createRefundIndexes: Migration = {
  id: "202608130009-create-refund-indexes",
  checksum: "sha256:50b67f5b46e72ba7306759a858801cf6c97be11302b3390881259f5f9cae179d",
  async up({ connection, log }) {
    await connection.collection("refunds").createIndex({ providerRefundId: 1 }, { unique: true, sparse: true, name: "provider_refund_id" });
    await connection.collection("refunds").createIndex({ orderId: 1, createdAt: -1 }, { name: "order_refund_history" });
    await connection.collection("refunds").createIndex({ userId: 1 }, { name: "owner_refunds" });
    log("refund indexes ready");
  },
};
