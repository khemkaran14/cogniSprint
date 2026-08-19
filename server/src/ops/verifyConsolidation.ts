import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { migrations } from "../migrations/index.js";
import { validateMigrationPlan } from "../migrations/runner.js";

const sourceExtensions = new Set([".css", ".html", ".js", ".json", ".md", ".ts", ".tsx", ".yml", ".yaml"]);
const ignoredDirectories = new Set([".git", "coverage", "dist", "node_modules", "playwright-report", "test-results"]);
const conflictMarker = /^(<<<<<<<|=======|>>>>>>>)(?: .*)?$/m;

async function findConflictMarkers(directory: string): Promise<string[]> {
  const matches: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      matches.push(...await findConflictMarkers(entryPath));
    } else if (entry.isFile() && sourceExtensions.has(path.extname(entry.name))) {
      const contents = await readFile(entryPath, "utf8");
      if (conflictMarker.test(contents)) matches.push(entryPath);
    }
  }
  return matches;
}

const thisFile = fileURLToPath(import.meta.url);
const repositoryRoot = path.resolve(path.dirname(thisFile), "../../..");
const unresolvedFiles = await findConflictMarkers(repositoryRoot);

if (unresolvedFiles.length > 0) {
  const relativeFiles = unresolvedFiles.map((file) => path.relative(repositoryRoot, file));
  throw new Error(`Unresolved merge markers found:\n${relativeFiles.join("\n")}`);
}

validateMigrationPlan(migrations);
console.log(JSON.stringify({
  event: "consolidation_verified",
  migrations: migrations.length,
  repositoryRoot,
}));
