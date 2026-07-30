import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const PLANS = [
  {
    key: "free",
    name: "Free",
    price: "₹0",
    period: "",
    features: [
      { ok: true, text: "All Easy questions, every tool" },
      { ok: true, text: "Full tool & category cloud" },
      { ok: true, text: "Weekly new-question digest" },
      { ok: false, text: "Medium & Hard answers" },
      { ok: false, text: "Downloadable cheat sheets" },
    ],
  },
  {
    key: "pro",
    name: "Pro",
    price: "₹499",
    period: "/mo",
    featured: true,
    features: [
      { ok: true, text: "Everything in Free" },
      { ok: true, text: "All Medium questions unlocked" },
      { ok: true, text: "Claude, Copilot, Cursor & Antigravity tracks" },
      { ok: true, text: "Downloadable PDF cheat sheets" },
      { ok: false, text: "Hard / system-design tier" },
    ],
  },
  {
    key: "premium",
    name: "Premium",
    price: "₹999",
    period: "/mo",
    features: [
      { ok: true, text: "Everything in Pro" },
      { ok: true, text: "All Hard & system-design questions" },
      { ok: true, text: "Mock-interview scenario guides" },
      { ok: true, text: "Priority coverage of new AI tools" },
      { ok: true, text: "1:1 monthly Q&A office hours" },
    ],
  },
];

export default function Pricing() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const [busyPlan, setBusyPlan] = useState(null);
  const [message, setMessage] = useState("");

  async function handleSubscribe(planKey) {
    if (planKey === "free") return;

    if (!user) {
      navigate("/register");
      return;
    }
    if (!window.Razorpay) {
      setMessage("Payment could not load. Please refresh and try again.");
      return;
    }

    setMessage("");
    setBusyPlan(planKey);
    try {
      const { data: order } = await api.post("/payments/order", { plan: planKey });

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "AI Career Shield",
        description: `${planKey === "pro" ? "Pro" : "Premium"} membership`,
        prefill: { name: user.name, email: user.email },
        theme: { color: "#c97a1f" },
        handler: async (response) => {
          try {
            await api.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            await refresh();
            setMessage("Payment successful — your plan has been upgraded.");
          } catch {
            setMessage("Payment verification failed. If you were charged, contact support.");
          }
        },
        modal: { ondismiss: () => setBusyPlan(null) },
      });
      rzp.on("payment.failed", () => setMessage("Payment failed. Please try again."));
      rzp.open();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not start checkout.");
    } finally {
      setBusyPlan(null);
    }
  }

  return (
    <div style={{ padding: "10px 0" }}>
      <span className="kicker" style={{ display: "block", textAlign: "center" }}>
        Membership
      </span>
      <h1 style={{ marginTop: 8, fontSize: 36, textAlign: "center" }}>Unlock The Answers That Get You Hired</h1>
      <p style={{ textAlign: "center", color: "var(--muted)", marginTop: 10, fontSize: 15.5 }}>
        Cancel anytime. Prices in INR, billed via Razorpay.
      </p>

      {message && (
        <p style={{ textAlign: "center", marginTop: 16, fontWeight: 600, color: "var(--secondary)" }}>{message}</p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 18,
          marginTop: 32,
          alignItems: "stretch",
        }}
      >
        {PLANS.map((plan) => (
          <div
            key={plan.key}
            className="card"
            style={{
              padding: "26px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              position: "relative",
              borderColor: plan.featured ? "var(--accent)" : undefined,
            }}
          >
            {plan.featured && (
              <span
                style={{
                  position: "absolute",
                  top: -12,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "var(--accent)",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "4px 12px",
                  borderRadius: 100,
                }}
              >
                Most Popular
              </span>
            )}
            <span className="mono" style={{ fontSize: 13, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--muted)" }}>
              {plan.name}
              {user?.plan === plan.key && (
                <span style={{ marginLeft: 8, color: "var(--secondary)" }}>· Current Plan</span>
              )}
            </span>
            <div style={{ fontSize: 34, fontWeight: 800 }}>
              {plan.price}
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>{plan.period}</span>
            </div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {plan.features.map((f, i) => (
                <li key={i} style={{ display: "flex", gap: 9, fontSize: 13.5, lineHeight: 1.4, color: f.ok ? "var(--ink)" : "var(--muted)" }}>
                  <span>{f.ok ? "✓" : "✗"}</span>
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>
            <button
              className={plan.featured ? "btn btn-primary" : "btn btn-ghost"}
              style={{ width: "100%", justifyContent: "center", marginTop: "auto" }}
              disabled={busyPlan === plan.key || user?.plan === plan.key}
              onClick={() => handleSubscribe(plan.key)}
            >
              {user?.plan === plan.key
                ? "Current Plan"
                : plan.key === "free"
                ? "Start Free"
                : busyPlan === plan.key
                ? "Starting checkout…"
                : `Go ${plan.name} →`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
