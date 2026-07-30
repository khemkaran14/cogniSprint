import { useState } from "react";
import { Link } from "react-router-dom";

const TIER_STYLE = {
  free: { background: "var(--secondary-tint)", color: "var(--secondary)", label: "Free" },
  pro: { background: "var(--accent-tint)", color: "var(--accent-strong)", label: "Pro" },
  premium: { background: "var(--locked-tint)", color: "var(--locked)", label: "Premium" },
};

export default function QuestionCard({ q }) {
  const [open, setOpen] = useState(false);
  const tier = TIER_STYLE[q.requiredPlan] || TIER_STYLE.free;

  return (
    <div className="card" style={{ marginBottom: 10, overflow: "hidden" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          all: "unset",
          boxSizing: "border-box",
          width: "100%",
          padding: "16px 18px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          cursor: "pointer",
        }}
      >
        <span
          className="mono"
          style={{
            flex: "none",
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: "0.02em",
            padding: "3px 8px",
            borderRadius: 100,
            textTransform: "uppercase",
            background: tier.background,
            color: tier.color,
          }}
        >
          {tier.label}
        </span>
        <span style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.4 }}>{q.question}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          style={{
            marginLeft: "auto",
            flex: "none",
            color: "var(--muted)",
            transform: open ? "rotate(90deg)" : "none",
            transition: "transform .15s ease",
          }}
        >
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {open && q.unlocked && (
        <div style={{ padding: "0 18px 18px 46px", fontSize: 14.5, lineHeight: 1.65 }}>{q.answer}</div>
      )}

      {open && !q.unlocked && (
        <div style={{ position: "relative", padding: "0 18px 20px 46px" }}>
          <div
            style={{
              filter: "blur(5px)",
              userSelect: "none",
              color: "var(--muted)",
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            Upgrading unlocks a full written answer here, including the reasoning and trade-offs an interviewer
            expects for a {q.difficulty} question — not just a one-line definition.
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "linear-gradient(180deg, transparent, var(--paper-raised) 55%)",
            }}
          >
            <span
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "var(--locked-tint)",
                color: "var(--locked)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="2" />
              </svg>
            </span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Unlock with {tier.label}</span>
            <Link
              to="/pricing"
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: "var(--paper)",
                background: "var(--locked)",
                padding: "6px 14px",
                borderRadius: 100,
                textDecoration: "none",
              }}
            >
              Upgrade →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
