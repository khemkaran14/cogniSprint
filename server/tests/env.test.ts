import { describe, expect, it } from "vitest";
import { validateEnvironment } from "../src/lib/env.js";

const validEnv = {
  MONGODB_URI: "mongodb://127.0.0.1:27017/cognisprint",
  CLIENT_URL: "http://localhost:5173",
};

describe("validateEnvironment", () => {
  it("accepts a valid local configuration", () => {
    expect(() => validateEnvironment(validEnv)).not.toThrow();
  });

  it("rejects an Atlas password placeholder", () => {
    expect(() =>
      validateEnvironment({
        ...validEnv,
        MONGODB_URI: "mongodb+srv://user:<db_password>@cluster.example.net/cognisprint",
      })
    ).toThrow(/placeholder/);
  });

  it("rejects a Markdown-formatted client URL", () => {
    expect(() => validateEnvironment({ ...validEnv, CLIENT_URL: "[http://localhost:5000](http://localhost:5000)" })).toThrow(
      /plain URL/
    );
  });

  it("requires both Razorpay credentials", () => {
    expect(() => validateEnvironment({ ...validEnv, RAZORPAY_KEY_ID: "rzp_test_example" })).toThrow(/both be set/);
  });

  it("requires a webhook secret with production Razorpay credentials", () => {
    expect(() => validateEnvironment({
      ...validEnv,
      NODE_ENV: "production",
      RAZORPAY_KEY_ID: "rzp_live_example",
      RAZORPAY_KEY_SECRET: "secret",
    })).toThrow(/WEBHOOK_SECRET/);
  });

  it("requires an absolute log-drain URL", () => {
    expect(() => validateEnvironment({ ...validEnv, LOG_DRAIN_URL: "logs.example.com" })).toThrow(/plain URL/);
  });

  it("requires an encrypted production log drain", () => {
    expect(() => validateEnvironment({ ...validEnv, NODE_ENV: "production", LOG_DRAIN_URL: "http://logs.example.com" })).toThrow(/https/);
  });
});
