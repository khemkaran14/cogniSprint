import { expect, test } from "@playwright/test";

const admin = { id: "admin_1", name: "Site Owner", email: "owner@example.com", role: "admin", timezone: "UTC", emailVerified: true };

test("administrator sees operational summaries and audit history", async ({ page }) => {
  await page.route("**/api/auth/me", (route) => route.fulfill({ json: { user: admin } }));
  await page.route("**/api/admin/dashboard", (route) => route.fulfill({ json: {
    summary: { users: 42, activeEntitlements: 12, pendingOrders: 2, failedWebhooks: 1, failedCertificateEmails: 0 },
    recentOrders: [{ _id: "order_1", customerName: "Asha Rao", customerEmail: "asha@example.com", amount: 99900, currency: "INR", status: "paid", createdAt: "2026-08-12T12:00:00Z" }],
    recentAudits: [{ _id: "audit_1", action: "certificate.revoke", targetType: "Certificate", targetId: "cert_1", createdAt: "2026-08-12T12:00:00Z", actorUserId: admin }],
  } }));
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Operations dashboard" })).toBeVisible();
  await expect(page.getByText("42", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recent orders" })).toBeVisible();
  await expect(page.getByText("certificate.revoke")).toBeVisible();
});

test("learner cannot open the administrator client route", async ({ page }) => {
  await page.route("**/api/auth/me", (route) => route.fulfill({ json: { user: { ...admin, role: "learner" } } }));
  await page.route("**/api/entitlements", (route) => route.fulfill({ json: { entitlements: [] } }));
  await page.route("**/api/auth/sessions", (route) => route.fulfill({ json: { sessions: [] } }));
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByRole("heading", { name: "Site Owner" })).toBeVisible();
});
