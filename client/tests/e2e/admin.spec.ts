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

test("administrator can review refundable balances", async ({ page }) => {
  await page.route("**/api/auth/me", (route) => route.fulfill({ json: { user: admin } }));
  await page.route("**/api/admin/orders", (route) => route.fulfill({ json: { orders: [{ _id: "66bb88cc00dd11ee22ff3344", customerName: "Asha Rao", customerEmail: "asha@example.com", productId: { name: "CogniSprint Complete" }, amount: 99900, refundedAmount: 10000, currency: "INR", status: "partially_refunded", createdAt: "2026-08-13T06:00:00Z", refunds: [{ _id: "refund_1", amount: 10000, status: "processed", reason: "Customer requested adjustment" }] }] } }));
  await page.goto("/admin/orders");
  await expect(page.getByRole("heading", { name: "Orders and refunds" })).toBeVisible();
  await expect(page.getByText("Remaining 899.00")).toBeVisible();
  await expect(page.getByRole("button", { name: "Issue refund" })).toBeVisible();
});

test("administrator can review and retry failed transactional email", async ({ page }) => {
  await page.route("**/api/auth/me", (route) => route.fulfill({ json: { user: admin } }));
  await page.route("**/api/admin/email-deliveries", (route) => route.fulfill({ json: { deliveries: [{ _id: "delivery_1", category: "refund", to: "asha@example.com", subject: "Your refund was processed", status: "failed", attempts: 8, lastError: "Resend 503" }] } }));
  await page.goto("/admin/email-deliveries");
  await expect(page.getByRole("heading", { name: "Transactional email" })).toBeVisible();
  await expect(page.getByText("Resend 503")).toBeVisible();
  await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
});

test("administrator can review operational alerts", async ({ page }) => {
  await page.route("**/api/auth/me", (route) => route.fulfill({ json: { user: admin } }));
  await page.route("**/api/admin/alerts", (route) => route.fulfill({ json: { alerts: [{ _id: "alert_1", category: "entitlement_mismatch", severity: "critical", status: "open", title: "Paid order has no active entitlement", details: { orderId: "order_1" }, occurrences: 2, firstSeenAt: "2026-08-15T10:00:00Z", lastSeenAt: "2026-08-15T11:00:00Z" }] } }));
  await page.goto("/admin/alerts");
  await expect(page.getByRole("heading", { name: "Operational alerts" })).toBeVisible();
  await expect(page.getByText("Paid order has no active entitlement")).toBeVisible();
  await expect(page.getByRole("button", { name: "Acknowledge" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Resolve" })).toBeVisible();
});

test("administrator can review privacy deletion requests", async ({ page }) => {
  await page.route("**/api/auth/me", (route) => route.fulfill({ json: { user: admin } }));
  await page.route("**/api/admin/privacy-requests", (route) => route.fulfill({ json: { requests: [{ _id: "privacy_1", type: "deletion", status: "pending", reason: "I no longer use the program.", createdAt: "2026-08-15T11:00:00Z", userId: { name: "Asha Rao", email: "asha@example.com", status: "active" } }] } }));
  await page.goto("/admin/privacy-requests");
  await expect(page.getByRole("heading", { name: "Privacy requests" })).toBeVisible();
  await expect(page.getByText("asha@example.com", { exact: false })).toBeVisible();
  await expect(page.getByPlaceholder("Required operational note")).toBeVisible();
});
