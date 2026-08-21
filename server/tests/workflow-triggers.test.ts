import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("GitHub Actions workflow triggers", () => {
  it("runs CI and the container security scan against the repository's actual default branch", () => {
    for (const file of ["../../.github/workflows/ci.yml", "../../.github/workflows/container-security.yml"]) {
      const workflow = readFileSync(new URL(file, import.meta.url), "utf8");
      expect(workflow).toContain("branches: [main, work]");
      expect(workflow).toContain("branches: [main]");
      expect(workflow).not.toMatch(/branches:\s*\[[^\]]*\bmaster\b/);
    }
  });
});
