import { describe, expect, it } from "vitest";
import { WebhookEvent } from "../src/models/WebhookEvent.js";

describe("WebhookEvent", () => {
  it("deduplicates provider event IDs", () => {
    const index = WebhookEvent.schema.indexes().find(([fields]) => fields.provider === 1 && fields.eventId === 1);
    expect(index?.[1]).toMatchObject({ unique: true });
  });

  it("expires operational event records after the retention window", () => {
    const index = WebhookEvent.schema.indexes().find(([fields]) => fields.createdAt === 1);
    expect(index?.[1]).toMatchObject({ expireAfterSeconds: 7_776_000 });
  });
});
