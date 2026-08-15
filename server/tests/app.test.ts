import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import type { Server } from "node:http";
import { createApp } from "../src/app.js";

let server: Server | undefined;

afterEach(() => {
  server?.close();
  server = undefined;
});

async function get(path: string) {
  server = createApp().listen(0);
  await new Promise<void>((resolve) => server?.once("listening", resolve));
  const { port } = server.address() as AddressInfo;
  return fetch(`http://127.0.0.1:${port}${path}`);
}

describe("server application", () => {
  it("serves the health endpoint", async () => {
    const response = await get("/api/health");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "ok" });
  });

  it("reports not-ready until the database is connected", async () => {
    const response = await get("/api/ready");
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ status: "not_ready", database: "disconnected" });
  });

  it("mounts entitlements as an authenticated endpoint", async () => {
    const response = await get("/api/entitlements");
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Please sign in to continue." });
  });

  it("protects owner order history", async () => {
    const response = await get("/api/checkout/orders");
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Please sign in to continue." });
  });

  it("protects session management", async () => {
    const response = await get("/api/auth/sessions");
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Please sign in to continue." });
  });

  it("protects administrator routes", async () => {
    const response = await get("/api/admin/dashboard");
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Please sign in to continue." });
  });

  it("protects the learning dashboard", async () => {
    const response = await get("/api/learning/dashboard");
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Please sign in to continue." });
  });

  it("protects monthly assessments", async () => {
    const response = await get("/api/assessments");
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Please sign in to continue." });
  });

  it("returns a JSON 404 for unknown routes", async () => {
    const response = await get("/api/does-not-exist");
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "No route for GET /api/does-not-exist" });
  });
});
