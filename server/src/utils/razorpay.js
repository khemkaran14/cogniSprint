import Razorpay from "razorpay";

let client = null;

// Built lazily so a missing RAZORPAY_KEY_ID/SECRET only breaks payment
// endpoints when someone actually hits them, instead of crashing the entire
// server at startup -- everything else (browsing, auth, admin) still works
// while Razorpay isn't configured yet.
export function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    const err = new Error(
      "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env to enable payments."
    );
    err.status = 503;
    throw err;
  }
  client ||= new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  return client;
}
