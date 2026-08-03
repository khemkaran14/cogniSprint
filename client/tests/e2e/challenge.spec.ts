import { test, expect } from "@playwright/test";
import { mockApi } from "./mockApi";

test("visitor can complete the free brain skills challenge and see a results screen", async ({ page }) => {
  await mockApi(page);
  await page.goto("/sample-challenge");
  await page.getByRole("button", { name: /start the challenge/i }).click();

  for (const answer of ["23", "72", "12"]) {
    await page.getByPlaceholder("Your answer").fill(answer);
    await page.getByRole("button", { name: /next question|continue/i }).click();
  }

  await expect(page.getByText(/memorising time/i)).toBeVisible();
  await page.getByRole("button", { name: "Lantern", exact: true }).waitFor({ state: "visible", timeout: 15_000 });
  await page.getByRole("button", { name: "River", exact: true }).click();
  await page.getByRole("button", { name: /submit recall/i }).click();

  for (const option of ["10", "48", "25"]) {
    await page.getByRole("button", { name: option, exact: true }).click();
    await page.waitForTimeout(600);
  }

  await page.getByRole("button", { name: "3", exact: true }).waitFor({ state: "visible", timeout: 10_000 });
  await page.getByRole("button", { name: "3", exact: true }).click();
  await page.waitForTimeout(600);
  await page.getByRole("button", { name: "Cyan", exact: true }).click();
  await page.waitForTimeout(600);
  await page.getByRole("button", { name: "2", exact: true }).click();
  await page.waitForTimeout(600);

  await page.getByRole("button", { name: "12 minutes", exact: true }).click();
  await page.waitForTimeout(400);
  await page.getByRole("button", { name: /next question/i }).click();
  await page.getByRole("button", { name: "Predictability of arrival time", exact: true }).click();
  await page.waitForTimeout(400);
  await page.getByRole("button", { name: /see my results/i }).click();

  await expect(page.getByRole("heading", { name: "Brain Skills Snapshot" })).toBeVisible();
  await expect(page.getByText(/this is a practice snapshot, not an intelligence test/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /see the full program/i })).toHaveAttribute("href", "/pricing");
});
