import crypto from "node:crypto";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import mongoose from "mongoose";
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

let server: Server; let baseUrl: string;

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
  await mongoose.connect(uri, { autoIndex: true });
  await Promise.all([User.syncIndexes(), Product.syncIndexes(), CurriculumModule.syncIndexes(), Lesson.syncIndexes(), Order.syncIndexes(), Entitlement.syncIndexes(), WebhookEvent.syncIndexes(), EmailDelivery.syncIndexes()]);
  server = createApp().listen(0); await new Promise<void>((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
beforeEach(async () => { for (const collection of await mongoose.connection.db!.collections()) await collection.deleteMany({}); });
afterAll(async () => { await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())); await mongoose.disconnect(); });

describe("MongoDB-backed platform", () => {
  it("persists sessions and enforces entitlement-backed learning access", async () => {
    const { cookie, user } = await register("learner@example.com"); const product = await catalogue();
    const denied = await request("/api/learning/dashboard", { headers: { cookie } }); expect(denied.status).toBe(403);
    const order = await Order.create({ customerName: user.name, customerEmail: user.email, customerPhone: "9999999999", userId: user._id, productId: product._id, amount: 99900, currency: "INR", status: "paid", providerOrderId: "order_entitled" });
    await Entitlement.create({ userId: user._id, productId: product._id, sourceOrderId: order._id, status: "active" });
    const response = await request("/api/learning/dashboard", { headers: { cookie } }); expect(response.status).toBe(200);
    const body = await response.json() as { summary: { totalLessons: number }; modules: unknown[] };
    expect(body.summary.totalLessons).toBe(1); expect(body.modules).toHaveLength(1);
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
});
