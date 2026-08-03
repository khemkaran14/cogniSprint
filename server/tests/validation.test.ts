import { describe, it, expect } from "vitest";
import { contactSchema, newsletterSchema, checkoutCustomerSchema } from "../src/lib/validation.js";

describe("newsletterSchema", () => {
  it("accepts a valid email", () => {
    expect(newsletterSchema.safeParse({ email: "person@example.com" }).success).toBe(true);
  });
  it("rejects an invalid email", () => {
    expect(newsletterSchema.safeParse({ email: "not-an-email" }).success).toBe(false);
  });
});

describe("contactSchema", () => {
  const valid = {
    name: "Asha Rao",
    email: "asha@example.com",
    topic: "general" as const,
    message: "I have a question about the course.",
  };

  it("accepts a well-formed submission", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects a message that is too short", () => {
    expect(contactSchema.safeParse({ ...valid, message: "hi" }).success).toBe(false);
  });
  it("rejects an invalid topic", () => {
    expect(contactSchema.safeParse({ ...valid, topic: "invalid" }).success).toBe(false);
  });
  it("rejects a filled honeypot field", () => {
    expect(contactSchema.safeParse({ ...valid, website: "spam" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, website: "" }).success).toBe(true);
  });
});

describe("checkoutCustomerSchema", () => {
  const valid = { name: "Asha Rao", email: "asha@example.com", phone: "9876543210", acceptedTerms: true as const };

  it("accepts a well-formed customer", () => {
    expect(checkoutCustomerSchema.safeParse(valid).success).toBe(true);
  });
  it("requires terms acceptance", () => {
    expect(checkoutCustomerSchema.safeParse({ ...valid, acceptedTerms: false }).success).toBe(false);
  });
  it("rejects an invalid phone number", () => {
    expect(checkoutCustomerSchema.safeParse({ ...valid, phone: "abc" }).success).toBe(false);
  });
});
