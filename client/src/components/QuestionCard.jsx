import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const TIER_STYLE = {
  free: { background: "var(--secondary-tint)", color: "var(--secondary)", label: "Free" },
  pro: { background: "var(--accent-tint)", color: "var(--accent-strong)", label: "Pro" },
  premium: { background: "var(--locked-tint)", color: "var(--locked)", label: "Premium" },
};

export default function QuestionCard({ q }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState({ bookmarked: false, practiced: false });
  const tier = TIER_STYLE[q.requiredPlan] || TIER_STYLE.free;

  useEffect(() => {
    if (!user) return;
    api.get("/bookmarks/state", { params: { ids: q.id } }).then(({ data }) => {
      if (data.state[q.id]) setState(data.state[q.id]);
    });
  }, [user, q.id]);

  async function toggleBookmark(e) {
    e.stopPropagation();
    const { data } = await api.post(`/bookmarks/${q.id}/toggle-bookmark`);
    setState(data);
  }

  async function togglePracticed(e) {
    e.stopPropagation();
    const { data } = await api.post(`/bookmarks/${q.id}/toggle-practiced`);
    setState(data);
  }

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
        {user && (
          <span style={{ marginLeft: "auto", display: "flex", gap: 4, flex: "none" }}>
            <span
              role="button"
              aria-label={state.practiced ? "Mark as not practiced" : "Mark as practiced"}
              title={state.practiced ? "Practiced" : "Mark as practiced"}
              onClick={togglePracticed}
              style={{
                display: "flex",
                width: 26,
                height: 26,
                borderRadius: "50%",
                alignItems: "center",
                justifyContent: "center",
                color: state.practiced ? "var(--secondary)" : "var(--muted)",
                background: state.practiced ? "var(--secondary-tint)" : "transparent",
                cursor: "pointer",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4 10-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span
              role="button"
              aria-label={state.bookmarked ? "Remove bookmark" : "Save for later"}
              title={state.bookmarked ? "Saved" : "Save for later"}
              onClick={toggleBookmark}
              style={{
                display: "flex",
                width: 26,
                height: 26,
                borderRadius: "50%",
                alignItems: "center",
                justifyContent: "center",
                color: state.bookmarked ? "var(--accent-strong)" : "var(--muted)",
                background: state.bookmarked ? "var(--accent-tint)" : "transparent",
                cursor: "pointer",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={state.bookmarked ? "currentColor" : "none"}>
                <path d="M6 3h12v18l-6-4-6 4V3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </span>
          </span>
        )}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          style={{
            marginLeft: user ? 0 : "auto",
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
