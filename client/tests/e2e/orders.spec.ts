import { expect, test } from "@playwright/test";

const user = { id: "user_1", name: "Asha Rao", email: "asha@example.com", role: "learner", timezone: "Asia/Kolkata", emailVerified: true };
const orderId = "66bb88cc00dd11ee22ff3344";

test("learner sees owner order history and printable payment receipt", async ({ page }) => {
  await page.route("**/api/auth/me", (route) => route.fulfill({ json: { user } }));
  await page.route("**/api/entitlements", (route) => route.fulfill({ json: { entitlements: [] } }));
  await page.route("**/api/auth/sessions", (route) => route.fulfill({ json: { sessions: [] } }));
  await page.route("**/api/checkout/orders", (route) => route.fulfill({ json: { orders: [{ id: orderId, product: { name: "CogniSprint Complete" }, amount: 99900, currency: "INR", status: "paid", createdAt: "2026-08-13T06:00:00Z", receiptAvailable: true }] } }));
  await page.goto("/account");
  await expect(page.getByRole("heading", { name: "Order history" })).toBeVisible();
  await expect(page.getByText("INR 999.00")).toBeVisible();
  await expect(page.getByRole("link", { name: "View receipt" })).toHaveAttribute("href", `/account/orders/${orderId}`);

  await page.route(`**/api/checkout/orders/${orderId}/receipt`, (route) => route.fulfill({ json: { receipt: { number: "CS-11EE22FF3344", orderId, providerPaymentId: "pay_123", customerName: "Asha Rao", customerEmail: "asha@example.com", product: { name: "CogniSprint Complete" }, amount: 99900, currency: "INR", status: "paid", purchasedAt: "2026-08-13T06:00:00Z" } } }));
  await page.goto(`/account/orders/${orderId}`);
  await expect(page.getByRole("heading", { name: "CogniSprint" })).toBeVisible();
  await expect(page.getByText("CS-11EE22FF3344")).toBeVisible();
  await expect(page.getByRole("button", { name: "Print or save PDF" })).toBeVisible();
  await expect(page.getByText("not a tax invoice")).toBeVisible();
});
