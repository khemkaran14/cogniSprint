import type { Migration } from "./types.js";

export const createAdminPermissions: Migration = {
  id: "202608190019-create-admin-permissions",
  checksum: "sha256:541abfa90f07d667fbf35a4be018734753a7cc78a59cd74f43270879d1565ae5",
  async up({ connection, log }) {
    await connection.collection("users").updateMany({ role: "admin", adminPermissions: { $exists: false } }, { $set: { adminPermissions: ["*"] } });
    await connection.collection("users").createIndex({ role: 1, status: 1 }, { name: "administrator_directory" });
    log("administrator permissions initialized");
  },
};
