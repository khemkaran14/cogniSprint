import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// Some sandboxed environments pre-install a single Chromium binary at a
// fixed path instead of the version-matched pair @playwright/test normally
// downloads. Use it only when present; otherwise fall back to Playwright's
// standard browser resolution (e.g. after `npx playwright install`).
const preinstalledChromium = "/opt/pw-browsers/chromium";
const chromiumExecutablePath = existsSync(preinstalledChromium) ? preinstalledChromium : undefined;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  retries: process.env.CI ? 2 : 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:5174",
    trace: "on-first-retry",
    navigationTimeout: 20_000,
  },
  webServer: {
    command: "npm run dev -- --port 5174",
    url: "http://localhost:5174",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], launchOptions: { executablePath: chromiumExecutablePath } },
    },
  ],
});
