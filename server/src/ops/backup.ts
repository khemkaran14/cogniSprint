import "dotenv/config";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
const args = process.argv.slice(2); const restore = args.includes("--restore"); const value = (flag: string) => args[args.indexOf(flag) + 1]; const archive = value("--archive");
if (!archive) { console.error("Usage: npm run backup -- --archive FILE [--restore --target-uri URI --sha256 HASH]"); process.exit(1); }
if (restore) { const target = value("--target-uri"); const expected = value("--sha256"); if (!target || !expected || target === process.env.MONGODB_URI) { console.error("Restore requires a checksum and an isolated target URI different from MONGODB_URI."); process.exit(1); } const actual = createHash("sha256").update(await readFile(archive)).digest("hex"); if (actual !== expected) { console.error("Backup checksum mismatch."); process.exit(1); } const result = spawnSync("mongorestore", [`--uri=${target}`, `--archive=${archive}`, "--gzip", "--drop"], { stdio: "inherit" }); process.exit(result.status ?? 1); }
if (!process.env.MONGODB_URI) { console.error("MONGODB_URI is required."); process.exit(1); } const result = spawnSync("mongodump", [`--uri=${process.env.MONGODB_URI}`, `--archive=${archive}`, "--gzip"], { stdio: "inherit" }); if (result.status) process.exit(result.status); console.info(JSON.stringify({ archive, sha256: createHash("sha256").update(await readFile(archive)).digest("hex"), createdAt: new Date().toISOString() }));
