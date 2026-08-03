import { test, expect } from "@playwright/test";
import { mockApi } from "./mockApi";

test("homepage loads and links to the free challenge and pricing", async ({ page }) => {
  await mockApi(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /train your brain in 15 minutes a day/i })).toBeVisible();

  await expect(page.getByRole("link", { name: /try a free challenge/i }).first()).toHaveAttribute("href", "/sample-challenge");
  await expect(page.getByRole("link", { name: /start your training/i }).first()).toHaveAttribute("href", "/pricing");
});

test("educational disclaimer is present on the homepage", async ({ page }) => {
  await mockApi(page);
  await page.goto("/");
  await expect(page.getByText(/does not guarantee an increase in iq/i)).toBeVisible();
});

const staticRoutes = ["/about", "/contact", "/legal/terms", "/legal/privacy", "/legal/refund-policy", "/legal/disclaimer", "/legal/cookie-policy"];

for (const route of staticRoutes) {
  test(`${route} needs no API data and returns 200`, async ({ page }) => {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
  });
}

test("pricing page shows the loaded product when the API responds", async ({ page }) => {
  await mockApi(page);
  await page.goto("/pricing");
  await expect(page.getByText("CogniSprint Complete")).toBeVisible();
  await expect(page.getByText("₹999")).toBeVisible();
});

test("pricing page shows an error state with retry when the API fails", async ({ page }) => {
  // FAQ isn't mocked here either, so it independently shows its own error
  // state too — scope to the pricing section to assert on just that one.
  await page.route("**/api/products", (route) => route.fulfill({ status: 500, json: { error: "boom" } }));
  await page.goto("/pricing");
  const pricingSection = page.locator("section").filter({ hasText: "One program. Everything included." });
  await expect(pricingSection.getByRole("button", { name: /try again/i })).toBeVisible();
});
