import type { Migration } from "./types.js";

export const createOrderHistoryIndexes: Migration = {
  id: "202608130008-create-order-history-indexes",
  checksum: "sha256:6fe30d79719776720d8f78e45fe84cdf812aed9980119815459254798eca5692",
  async up({ connection, log }) {
    await connection.collection("orders").createIndex({ userId: 1, createdAt: -1 }, { name: "owner_order_history" });
    log("owner order history index ready");
  },
};
