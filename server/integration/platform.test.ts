import crypto from "node:crypto";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { CurriculumModule } from "../src/models/Module.js";
import { EmailDelivery } from "../src/models/EmailDelivery.js";
import { Entitlement } from "../src/models/Entitlement.js";
import { Lesson } from "../src/models/Lesson.js";
import { Order } from "../src/models/Order.js";
import { Product } from "../src/models/Product.js";
import { User } from "../src/models/User.js";
import { WebhookEvent } from "../src/models/WebhookEvent.js";
import { Dispute } from "../src/models/Dispute.js";
import { OperationalAlert } from "../src/models/OperationalAlert.js";
import { LearningResource } from "../src/models/LearningResource.js";
import { ResourceDownload } from "../src/models/ResourceDownload.js";

let server: Server | undefined; let baseUrl: string;

async function request(path: string, init: RequestInit = {}) { return fetch(`${baseUrl}${path}`, init); }
async function register(email: string) {
  const response = await request("/api/auth/register", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "Integration Learner", email, password: "safe-test-password", acceptedTerms: true }) });
  expect(response.status).toBe(201);
  const cookie = response.headers.get("set-cookie")?.split(";", 1)[0];
  expect(cookie).toBeTruthy();
  const user = await User.findOne({ email }).orFail();
  return { cookie: cookie!, user };
}
async function catalogue() {
  const product = await Product.create({ slug: "integration-course", name: "Integration Course", shortName: "Course", tagline: "Test safely", description: "Integration-test product", productType: "course", accessDuration: "lifetime", status: "active" });
  const module = await CurriculumModule.create({ position: 1, slug: "integration-module", title: "Integration Module", description: "Test module", skills: ["focus"], lessonCount: 1, exerciseCount: 1, difficulty: "beginner", estimatedMinutes: 10, previewAvailable: false, phase: "guided_learning" });
  await Lesson.create({ moduleId: module._id, position: 1, sequenceNumber: 1, unlockDay: 1, slug: "integration-lesson", title: "Integration Lesson", summary: "Test lesson", estimatedMinutes: 10, passingScore: 60, content: ["Integration content"], exercises: [{ prompt: "Choose one", options: ["Correct", "Wrong"], correctIndex: 0, explanation: "Correct." }], status: "published" });
  return product;
}

beforeAll(async () => {
  const uri = process.env.INTEGRATION_MONGODB_URI;
  if (!uri) throw new Error("INTEGRATION_MONGODB_URI is required for database integration tests.");
  process.env.CLIENT_URL = "http://localhost:5173";
  process.env.RAZORPAY_WEBHOOK_SECRET = "integration-webhook-secret";
  process.env.RAZORPAY_KEY_ID = "rzp_test_integration";
  process.env.RAZORPAY_KEY_SECRET = "integration-payment-secret";
  process.env.RESEND_WEBHOOK_SECRET = `whsec_${Buffer.from("integration-resend-secret").toString("base64")}`;
  await mongoose.connect(uri, { autoIndex: true });
  await Promise.all([User.syncIndexes(), Product.syncIndexes(), CurriculumModule.syncIndexes(), Lesson.syncIndexes(), Order.syncIndexes(), Entitlement.syncIndexes(), WebhookEvent.syncIndexes(), EmailDelivery.syncIndexes(), Dispute.syncIndexes(), OperationalAlert.syncIndexes(), LearningResource.syncIndexes(), ResourceDownload.syncIndexes()]);
  server = createApp().listen(0); await new Promise<void>((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
beforeEach(async () => { for (const collection of await mongoose.connection.db!.collections()) await collection.deleteMany({}); });
afterAll(async () => { if (server) await new Promise<void>((resolve, reject) => server!.close((error) => error ? reject(error) : resolve())); await mongoose.disconnect(); });

describe("MongoDB-backed platform", () => {
  it("persists sessions and enforces entitlement-backed learning access", async () => {
    const { cookie, user } = await register("learner@example.com"); const product = await catalogue();
    const denied = await request("/api/learning/dashboard", { headers: { cookie } }); expect(denied.status).toBe(403);
    const order = await Order.create({ customerName: user.name, customerEmail: user.email, customerPhone: "9999999999", userId: user._id, productId: product._id, amount: 99900, currency: "INR", status: "paid", providerOrderId: "order_entitled" });
    await Entitlement.create({ userId: user._id, productId: product._id, sourceOrderId: order._id, status: "active" });
    const response = await request("/api/learning/dashboard", { headers: { cookie } }); expect(response.status).toBe(200);
    const body = await response.json() as { summary: { totalLessons: number }; modules: unknown[] };
    expect(body.summary.totalLessons).toBe(1); expect(body.modules).toHaveLength(1);
    const availability = await request("/api/content-availability"); expect(availability.status).toBe(200); expect(await availability.json()).toMatchObject({ published: { lessons: 1, exercises: 1, assessments: 0, workbooks: 0 }, targets: { lessons: 365, assessments: 12, workbooks: 1 }, launchContentComplete: false, enrollmentOpen: false });
    process.env.ENROLLMENT_OPEN = "true";
    try {
      const products = await request("/api/products"); expect(products.status).toBe(200); expect(await products.json()).toEqual([]);
      const checkout = await request("/api/checkout/create-order", { method: "POST", headers: { "content-type": "application/json", cookie }, body: JSON.stringify({ productSlug: product.slug, customer: { name: user.name, email: user.email, phone: "9999999999" } }) }); expect(checkout.status).toBe(503); expect(await checkout.json()).toMatchObject({ error: expect.stringMatching(/content is incomplete/) });
    } finally { process.env.ENROLLMENT_OPEN = "false"; }
  });

  it("lists and streams only resources covered by the learner entitlement", async () => {
    const { cookie, user } = await register("resources@example.com"); const product = await catalogue();
    const order = await Order.create({ customerName: user.name, customerEmail: user.email, customerPhone: "9999999999", userId: user._id, productId: product._id, amount: 99900, currency: "INR", status: "paid", providerOrderId: "order_resources" });
    const entitlement = await Entitlement.create({ userId: user._id, productId: product._id, sourceOrderId: order._id, status: "active" });
    const pdf = Buffer.from("%PDF-1.7\nintegration workbook"); const bucket = new GridFSBucket(mongoose.connection.db!, { bucketName: "learningResources" }); const upload = bucket.openUploadStream("integration-workbook.pdf", { contentType: "application/pdf" }); upload.end(pdf); await new Promise<void>((resolve, reject) => upload.on("finish", resolve).on("error", reject));
    await LearningResource.create({ productId: product._id, slug: "integration-workbook", title: "Integration Workbook", description: "Private test workbook", kind: "workbook", version: 1, gridFsFileId: upload.id, filename: "integration-workbook.pdf", mimeType: "application/pdf", sizeBytes: pdf.length, sha256: crypto.createHash("sha256").update(pdf).digest("hex"), status: "published", publishedAt: new Date() });
    const listing = await request("/api/resources", { headers: { cookie } }); expect(listing.status).toBe(200); expect((await listing.json() as { resources: unknown[] }).resources).toHaveLength(1);
    const download = await request("/api/resources/integration-workbook/download", { headers: { cookie } }); expect(download.status).toBe(200); expect(download.headers.get("content-type")).toBe("application/pdf"); expect(Buffer.from(await download.arrayBuffer())).toEqual(pdf); expect(await ResourceDownload.countDocuments({ userId: user._id, entitlementId: entitlement._id })).toBe(1);
    const outsider = await register("resource-outsider@example.com"); expect((await request("/api/resources/integration-workbook/download", { headers: { cookie: outsider.cookie } })).status).toBe(403);
  });

  it("deduplicates captured-payment webhook replay and grants one entitlement", async () => {
    const { user } = await register("buyer@example.com"); const product = await catalogue();
    await Order.create({ customerName: user.name, customerEmail: user.email, customerPhone: "9999999999", userId: user._id, productId: product._id, amount: 99900, currency: "INR", status: "pending", providerOrderId: "order_webhook" });
    const raw = JSON.stringify({ event: "payment.captured", payload: { payment: { entity: { order_id: "order_webhook", id: "pay_webhook", amount: 99900 } } } });
    const signature = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!).update(raw).digest("hex");
    const send = () => request("/api/webhooks/razorpay", { method: "POST", headers: { "content-type": "application/json", "x-razorpay-signature": signature, "x-razorpay-event-id": "event_replayed" }, body: raw });
    const first = await send(); expect(first.status).toBe(200); expect(await first.json()).toEqual({ received: true });
    const replay = await send(); expect(replay.status).toBe(200); expect(await replay.json()).toEqual({ received: true, duplicate: true });
    expect(await Order.findOne({ providerOrderId: "order_webhook" }).lean()).toMatchObject({ status: "paid", providerPaymentId: "pay_webhook" });
    expect(await Entitlement.countDocuments({ userId: user._id, productId: product._id, status: "active" })).toBe(1);
    expect(await WebhookEvent.countDocuments({ eventId: "event_replayed", status: "processed" })).toBe(1);
  });

  it("converges callback/webhook races and revokes access only after a full refund", async () => {
    const { cookie, user } = await register("race@example.com"); const product = await catalogue();
    const order = await Order.create({ customerName: user.name, customerEmail: user.email, customerPhone: "9999999999", userId: user._id, productId: product._id, amount: 99900, currency: "INR", status: "pending", providerOrderId: "order_race" });
    const paymentId = "pay_race"; const callbackSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!).update(`order_race|${paymentId}`).digest("hex");
    const captured = JSON.stringify({ event: "payment.captured", payload: { payment: { entity: { order_id: "order_race", id: paymentId, amount: 99900 } } } });
    const webhookSignature = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!).update(captured).digest("hex");
    const [callback, webhook] = await Promise.all([
      request("/api/checkout/verify", { method: "POST", headers: { "content-type": "application/json", cookie }, body: JSON.stringify({ razorpay_order_id: "order_race", razorpay_payment_id: paymentId, razorpay_signature: callbackSignature }) }),
      request("/api/webhooks/razorpay", { method: "POST", headers: { "content-type": "application/json", "x-razorpay-signature": webhookSignature, "x-razorpay-event-id": "event_race_capture" }, body: captured }),
    ]);
    expect(callback.status).toBe(200); expect(webhook.status).toBe(200); expect(await Entitlement.countDocuments({ sourceOrderId: order._id, status: "active" })).toBe(1);
    const refund = async (amount: number, eventId: string) => { const raw = JSON.stringify({ event: "payment.refunded", payload: { payment: { entity: { order_id: "order_race", id: paymentId, amount_refunded: amount } } } }); const signature = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!).update(raw).digest("hex"); return request("/api/webhooks/razorpay", { method: "POST", headers: { "content-type": "application/json", "x-razorpay-signature": signature, "x-razorpay-event-id": eventId }, body: raw }); };
    expect((await refund(40000, "event_race_partial")).status).toBe(200); expect(await Order.findById(order._id).lean()).toMatchObject({ status: "partially_refunded", refundedAmount: 40000 }); expect(await Entitlement.countDocuments({ sourceOrderId: order._id, status: "active" })).toBe(1);
    expect((await refund(99900, "event_race_full")).status).toBe(200); expect(await Order.findById(order._id).lean()).toMatchObject({ status: "refunded", refundedAmount: 99900 }); expect(await Entitlement.countDocuments({ sourceOrderId: order._id, status: "revoked" })).toBe(1);
    expect((await refund(99900, "event_race_full")).status).toBe(200); expect(await WebhookEvent.countDocuments({ eventId: "event_race_full" })).toBe(1);
  });

  it("records a dispute and revokes access after a lost chargeback", async () => {
    const { user } = await register("disputed@example.com"); const product = await catalogue();
    const order = await Order.create({ customerName: user.name, customerEmail: user.email, customerPhone: "9999999999", userId: user._id, productId: product._id, amount: 99900, currency: "INR", status: "paid", providerOrderId: "order_disputed", providerPaymentId: "pay_disputed" });
    await Entitlement.create({ userId: user._id, productId: product._id, sourceOrderId: order._id, status: "active" });
    const send = async (event: string, eventId: string) => { const raw = JSON.stringify({ event, payload: { dispute: { entity: { id: "disp_1", payment_id: "pay_disputed", amount: 99900, currency: "INR", reason: "fraudulent", phase: "evidence", respond_by: 1787227200 } } } }); const signature = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!).update(raw).digest("hex"); return request("/api/webhooks/razorpay", { method: "POST", headers: { "content-type": "application/json", "x-razorpay-signature": signature, "x-razorpay-event-id": eventId }, body: raw }); };
    expect((await send("payment.dispute.created", "event_dispute_open")).status).toBe(200);
    expect(await Order.findById(order._id).lean()).toMatchObject({ status: "disputed" });
    expect(await OperationalAlert.countDocuments({ category: "payment_dispute", status: "open" })).toBe(1);
    expect((await send("payment.dispute.lost", "event_dispute_lost")).status).toBe(200);
    expect(await Order.findById(order._id).lean()).toMatchObject({ status: "chargeback" });
    expect(await Entitlement.findOne({ sourceOrderId: order._id }).lean()).toMatchObject({ status: "revoked" });
    expect(await Dispute.findOne({ providerDisputeId: "disp_1" }).lean()).toMatchObject({ status: "lost", lastEventId: "event_dispute_lost" });
  });

  it("records a signed Resend bounce once and opens an operational alert", async () => {
    await EmailDelivery.create({ idempotencyKey: "integration-email", category: "purchase", to: "bounce@example.com", subject: "Purchase", text: "Purchase confirmed", status: "sent", attempts: 1, providerMessageId: "resend_message_1", sentAt: new Date() });
    const raw = JSON.stringify({ type: "email.bounced", created_at: "2026-08-18T12:00:00.000Z", data: { email_id: "resend_message_1", to: ["bounce@example.com"], bounce: { message: "Mailbox unavailable" } } });
    const timestamp = String(Math.floor(Date.now() / 1000)); const eventId = "resend_event_1"; const secret = Buffer.from(process.env.RESEND_WEBHOOK_SECRET!.slice(6), "base64");
    const signature = `v1,${crypto.createHmac("sha256", secret).update(`${eventId}.${timestamp}.${raw}`).digest("base64")}`;
    const send = () => request("/api/webhooks/resend", { method: "POST", headers: { "content-type": "application/json", "svix-id": eventId, "svix-timestamp": timestamp, "svix-signature": signature }, body: raw });
    expect((await send()).status).toBe(200); expect(await EmailDelivery.findOne({ providerMessageId: "resend_message_1" }).lean()).toMatchObject({ status: "bounced", lastError: "Mailbox unavailable" });
    expect((await send()).status).toBe(200); expect(await WebhookEvent.countDocuments({ provider: "resend", eventId })).toBe(1); expect(await OperationalAlert.countDocuments({ category: "email_bounce" })).toBe(1);
  });
});
