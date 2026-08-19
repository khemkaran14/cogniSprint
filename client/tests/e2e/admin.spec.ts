import { expect, test } from "@playwright/test";

const admin = { id: "admin_1", name: "Site Owner", email: "owner@example.com", role: "admin", timezone: "UTC", emailVerified: true };

test("administrator sees operational summaries and audit history", async ({ page }) => {
  await page.route("**/api/auth/me", (route) => route.fulfill({ json: { user: admin } }));
  await page.route("**/api/admin/dashboard", (route) => route.fulfill({ json: {
    summary: { users: 42, activeEntitlements: 12, pendingOrders: 2, failedWebhooks: 1, openDisputes: 1, failedCertificateEmails: 0 },
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

test("administrator can review a provider-reported email bounce", async ({ page }) => {
  await page.route("**/api/auth/me", (route) => route.fulfill({ json: { user: admin } }));
  await page.route("**/api/admin/email-deliveries", (route) => route.fulfill({ json: { deliveries: [{ _id: "delivery_bounced", category: "purchase", to: "bounce@example.com", subject: "Purchase confirmed", status: "bounced", attempts: 1, providerMessageId: "resend_message_1", providerEventAt: "2026-08-18T12:00:00Z", lastError: "Mailbox unavailable" }] } }));
  await page.goto("/admin/email-deliveries");
  await expect(page.getByText("Mailbox unavailable")).toBeVisible();
  await expect(page.getByText("bounced")).toBeVisible();
  await expect(page.getByText(/Provider update/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Retry" })).toHaveCount(0);
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

test("administrator can review an open payment dispute and evidence deadline", async ({ page }) => {
  await page.route("**/api/auth/me", (route) => route.fulfill({ json: { user: admin } }));
  await page.route("**/api/admin/disputes", (route) => route.fulfill({ json: { disputes: [{ _id: "dispute_1", providerDisputeId: "disp_razorpay_1", providerPaymentId: "pay_1", amount: 99900, currency: "INR", status: "open", reason: "fraudulent", phase: "evidence", evidenceDueAt: "2026-08-20T12:00:00Z", updatedAt: "2026-08-17T12:00:00Z", orderId: { customerName: "Asha Rao", customerEmail: "asha@example.com", providerOrderId: "order_1", status: "disputed" } }] } }));
  await page.goto("/admin/disputes");
  await expect(page.getByRole("heading", { name: "Payment disputes" })).toBeVisible();
  await expect(page.getByText("disp_razorpay_1")).toBeVisible();
  await expect(page.getByText(/evidence due/i)).toBeVisible();
});

test("administrator can review and approve queued learning content", async ({ page }) => {
  await page.route("**/api/auth/me", (route) => route.fulfill({ json: { user: admin } }));
  await page.route("**/api/admin/content", (route) => route.fulfill({ json: { lessons: [{ _id: "lesson_review", title: "Focus foundations", status: "in_review", sequenceNumber: 4, updatedAt: "2026-08-18T12:00:00Z", reviewNote: "Ready for independent review" }], assessments: [{ _id: "assessment_draft", title: "Month two review", status: "draft", month: 2, updatedAt: "2026-08-18T12:00:00Z" }] } }));
  await page.route("**/api/admin/content/lessons/lesson_review/status", (route) => route.fulfill({ json: { content: { _id: "lesson_review", status: "approved" } } }));
  await page.goto("/admin/content");
  await expect(page.getByRole("heading", { name: "Content review and publishing" })).toBeVisible();
  await expect(page.getByText("Day 4 · Focus foundations")).toBeVisible();
  await page.locator("#note-lesson_review").fill("Reviewed for correctness and progression");
  await expect(page.getByRole("button", { name: "approved" })).toBeEnabled();
  await page.getByRole("button", { name: "approved" }).click();
});

test("administrator can publish an imported workbook with a release note", async ({ page }) => {
  await page.route("**/api/auth/me", (route) => route.fulfill({ json: { user: admin } }));
  await page.route("**/api/admin/resources", (route) => route.fulfill({ json: { resources: [{ _id: "resource_draft", title: "Focus Workbook", kind: "workbook", version: 1, filename: "focus-workbook.pdf", sizeBytes: 1048576, sha256: "a".repeat(64), status: "draft", productId: { name: "CogniSprint Complete" } }] } }));
  await page.route("**/api/admin/resources/resource_draft/status", (route) => route.fulfill({ json: { resource: { _id: "resource_draft", status: "published" } } }));
  await page.goto("/admin/resources");
  await expect(page.getByRole("heading", { name: "Workbook and worksheet releases" })).toBeVisible();
  await page.locator("#resource-note-resource_draft").fill("Reviewed PDF content and accessibility");
  await page.getByRole("button", { name: "published" }).click();
});

test("administrator can search learner accounts and prepare an audited suspension", async ({ page }) => {
  await page.route("**/api/auth/me", (route) => route.fulfill({ json: { user: admin } }));
  await page.route("**/api/admin/users?**", (route) => route.fulfill({ json: { users: [{ _id: "66bb88cc00dd11ee22ff3344", name: "Asha Rao", email: "asha@example.com", status: "active", emailVerifiedAt: "2026-08-01T12:00:00Z", lastLoginAt: "2026-08-18T12:00:00Z", timezone: "Asia/Kolkata", createdAt: "2026-07-01T12:00:00Z", activeEntitlements: 1, activeSessions: 2 }], pagination: { page: 1, limit: 25, total: 1, pages: 1 } } }));
  await page.goto("/admin/users");
  await expect(page.getByRole("heading", { name: "Learner access support" })).toBeVisible();
  await expect(page.getByText("asha@example.com", { exact: false })).toBeVisible();
  await expect(page.getByText("1 active entitlement · 2 active sessions")).toBeVisible();
  const suspend = page.getByRole("button", { name: "Suspend account" });
  await expect(suspend).toBeDisabled();
  await page.getByPlaceholder("Ticket reference and reason for this action").fill("Support case CS-1842 compromised device");
  await expect(suspend).toBeEnabled();
});

test("administrator can review a learner timeline and prepare paid access repair", async ({ page }) => {
  await page.route("**/api/auth/me", (route) => route.fulfill({ json: { user: admin } }));
  await page.route("**/api/admin/users/66bb88cc00dd11ee22ff3344", (route) => route.fulfill({ json: { user: { _id: "66bb88cc00dd11ee22ff3344", name: "Asha Rao", email: "asha@example.com", status: "active", timezone: "Asia/Kolkata", createdAt: "2026-07-01T12:00:00Z" }, entitlements: [{ _id: "66bb88cc00dd11ee22ff3355", status: "revoked", grantedAt: "2026-07-01T12:00:00Z", productId: { name: "CogniSprint Complete", slug: "cognisprint-complete" }, sourceOrderId: { status: "paid", providerOrderId: "order_1" } }], orders: [{ _id: "order_1", status: "paid", amount: 99900, refundedAmount: 0, currency: "INR", createdAt: "2026-07-01T12:00:00Z", productId: { name: "CogniSprint Complete" } }], sessions: [], audits: [{ _id: "audit_1", action: "entitlement.revoked", createdAt: "2026-08-18T12:00:00Z", metadata: { reason: "Support investigation" }, actorUserId: { email: "owner@example.com" } }], privacyRequests: [] } }));
  await page.goto("/admin/users/66bb88cc00dd11ee22ff3344");
  await expect(page.getByRole("heading", { name: "Asha Rao" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Audited support timeline" })).toBeVisible();
  const restore = page.getByRole("button", { name: "Restore paid access" });
  await expect(restore).toBeDisabled();
  await page.getByPlaceholder("Required repair reason and support ticket").fill("Ticket CS-1843 payment verified");
  await expect(restore).toBeEnabled();
});
