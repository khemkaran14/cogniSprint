import { describe, it, expect } from "vitest";
import { calculateDiscountPercentage, applyCoupon } from "../src/lib/pricing.js";

describe("calculateDiscountPercentage", () => {
  it("computes a rounded percentage saved", () => {
    expect(calculateDiscountPercentage(249900, 99900)).toBe(60);
  });

  it("returns 0 when the discounted amount is not actually lower", () => {
    expect(calculateDiscountPercentage(1000, 1000)).toBe(0);
    expect(calculateDiscountPercentage(1000, 1200)).toBe(0);
  });

  it("returns 0 for a non-positive regular amount", () => {
    expect(calculateDiscountPercentage(0, 0)).toBe(0);
  });
});

describe("applyCoupon", () => {
  const flatCoupon = { discountType: "flat" as const, discountValue: 10000, active: true };
  const percentCoupon = { discountType: "percentage" as const, discountValue: 10, active: true };

  it("returns the original amount when no coupon is supplied", () => {
    expect(applyCoupon(99900, undefined)).toBe(99900);
  });

  it("ignores an inactive coupon", () => {
    expect(applyCoupon(99900, { ...flatCoupon, active: false })).toBe(99900);
  });

  it("subtracts a flat discount without going negative", () => {
    expect(applyCoupon(99900, flatCoupon)).toBe(89900);
    expect(applyCoupon(5000, flatCoupon)).toBe(0);
  });

  it("applies a percentage discount", () => {
    expect(applyCoupon(100000, percentCoupon)).toBe(90000);
  });
});
