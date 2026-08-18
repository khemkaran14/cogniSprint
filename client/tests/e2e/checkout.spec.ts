import { test, expect } from "@playwright/test";
import { mockApi } from "./mockApi";

test("a stale checkout link cannot load a product while enrollment is closed", async ({ page }) => {
  await mockApi(page);
  await page.goto("/checkout?product=cognisprint-complete");
  await expect(page.getByText(/couldn't find that product/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /pay .* securely/i })).toHaveCount(0);
});

test("server enrollment closure stops payment even if a stale product response is cached", async ({ page }) => {
  await mockApi(page, { enrollmentOpen: true });
  await page.goto("/checkout?product=cognisprint-complete");

  const form = page.locator("form").filter({ hasText: "Your details" });
  await form.getByLabel("Full name").fill("Test Customer");
  await form.getByLabel("Email").fill("test@example.com");
  await form.getByLabel("Phone number").fill("9876543210");
  await form.getByRole("checkbox").check();

  await form.getByRole("button", { name: /pay .* securely/i }).click();

  await expect(page.getByText(/enrollment is currently closed/i)).toBeVisible({ timeout: 10_000 });
});
