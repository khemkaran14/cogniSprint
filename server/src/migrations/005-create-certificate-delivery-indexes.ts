import type { Migration } from "./types.js";

export const createCertificateDeliveryIndexes: Migration = {
  id: "202608120005-create-certificate-delivery-indexes",
  checksum: "sha256:2417f76e5e50bebcbcab86ed9b27175a26f38c4800d694bd04f87e235279c505",
  async up({ connection, log }) {
    await connection.collection("certificates").createIndex(
      { emailDeliveryStatus: 1, issuedAt: 1 },
      { name: "certificate_delivery_status" }
    );
    log("certificate delivery index ready");
  },
};
