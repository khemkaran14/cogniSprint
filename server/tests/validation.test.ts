import { describe, it, expect } from "vitest";
import {
  contactSchema,
  newsletterSchema,
  checkoutCustomerSchema,
  registerSchema,
  loginSchema,
  resetPasswordSchema,
  refundSchema,
} from "../src/lib/validation.js";

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

describe("registerSchema", () => {
  const valid = { name: "Asha Rao", email: "asha@example.com", password: "correctH0rse" };

  it("accepts a well-formed registration", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects a password shorter than 8 characters", () => {
    expect(registerSchema.safeParse({ ...valid, password: "sh0rt" }).success).toBe(false);
  });
  it("rejects a password with no digit", () => {
    expect(registerSchema.safeParse({ ...valid, password: "noDigitsHere" }).success).toBe(false);
  });
  it("rejects a password with no letter", () => {
    expect(registerSchema.safeParse({ ...valid, password: "12345678" }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts email + non-empty password", () => {
    expect(loginSchema.safeParse({ email: "asha@example.com", password: "anything" }).success).toBe(true);
  });
  it("rejects an empty password", () => {
    expect(loginSchema.safeParse({ email: "asha@example.com", password: "" }).success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("accepts a token with a valid new password", () => {
    expect(resetPasswordSchema.safeParse({ token: "abc123", password: "correctH0rse" }).success).toBe(true);
  });
  it("rejects a weak new password", () => {
    expect(resetPasswordSchema.safeParse({ token: "abc123", password: "weak" }).success).toBe(false);
  });
});

describe("refundSchema", () => {
  it("accepts an order id with a reason", () => {
    expect(refundSchema.safeParse({ orderId: "order123", reason: "Customer request" }).success).toBe(true);
  });
  it("rejects a missing reason", () => {
    expect(refundSchema.safeParse({ orderId: "order123", reason: "" }).success).toBe(false);
  });
});
