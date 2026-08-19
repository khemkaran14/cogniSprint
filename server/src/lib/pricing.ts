export type CouponLike = {
  discountType: "percentage" | "flat";
  discountValue: number;
  active: boolean;
} | null | undefined;

export function calculateDiscountPercentage(regular: number, discounted: number): number {
  if (regular <= 0 || discounted >= regular) return 0;
  return Math.round(((regular - discounted) / regular) * 100);
}

export function applyCoupon(amount: number, coupon: CouponLike): number {
  if (!coupon || !coupon.active) return amount;
  if (coupon.discountType === "flat") {
    return Math.max(0, amount - coupon.discountValue);
  }
  return Math.max(0, Math.round(amount * (1 - coupon.discountValue / 100)));
}

/** Formats an amount in paise as an INR string, e.g. 99900 -> "₹999". */
export function formatINR(amountInPaise: number): string {
  const rupees = amountInPaise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}
