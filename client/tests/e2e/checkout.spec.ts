import { test, expect } from "@playwright/test";
import { mockApi } from "./mockApi";

test("checkout page shows order summary and validates required fields", async ({ page }) => {
  await mockApi(page);
  await page.goto("/checkout?product=cognisprint-complete");

  await expect(page.getByText("CogniSprint Complete Brain Training Program")).toBeVisible();
  await expect(page.getByText("Total due today")).toBeVisible();

  await page.getByRole("button", { name: /pay .* securely/i }).click();

  await expect(page.getByText(/enter your full name/i)).toBeVisible();
  await expect(page.getByText(/you must accept the terms/i)).toBeVisible();
});

test("submitting a valid checkout without a configured payment provider fails safely, without a fake success state", async ({ page }) => {
  await mockApi(page);
  await page.goto("/checkout?product=cognisprint-complete");

  const form = page.locator("form").filter({ hasText: "Your details" });
  await form.getByLabel("Full name").fill("Test Customer");
  await form.getByLabel("Email").fill("test@example.com");
  await form.getByLabel("Phone number").fill("9876543210");
  await form.getByRole("checkbox").check();

  await form.getByRole("button", { name: /pay .* securely/i }).click();

  await expect(page.getByText(/payment isn.t connected yet/i)).toBeVisible({ timeout: 10_000 });
});
