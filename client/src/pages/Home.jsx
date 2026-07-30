import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import useDocumentMeta from "../hooks/useDocumentMeta.js";

const GROUPS = [
  { key: "assistants", label: "AI Coding Assistants" },
  { key: "agentic", label: "Agentic & Automation" },
  { key: "foundation", label: "Foundation Models & Concepts" },
];

export default function Home() {
  const [tools, setTools] = useState([]);
  const [activeGroup, setActiveGroup] = useState("assistants");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/content/tools")
      .then(({ data }) => setTools(data.tools))
      .finally(() => setLoading(false));
  }, []);

  useDocumentMeta(
    null,
    "Claude, GitHub Copilot, Cursor, Antigravity and Foundation Model interview questions, answered and tiered by difficulty."
  );

  const totalQuestions = tools.reduce(
    (sum, t) => sum + t.categories.reduce((s, c) => s + c.questionCount, 0),
    0
  );

  return (
    <div>
      <div style={{ padding: "8px 0 30px" }}>
        <span className="kicker">AI Tool Interview Prep</span>
        <h1 style={{ marginTop: 10, fontSize: 44, lineHeight: 1.08, maxWidth: 760 }}>
          Kill Your Next <span style={{ color: "var(--accent)" }}>AI Engineering</span> Interview
        </h1>
        <p style={{ marginTop: 14, fontSize: 17, color: "var(--muted)", maxWidth: 600, lineHeight: 1.5 }}>
          <b style={{ color: "var(--ink)" }}>{totalQuestions || "—"}</b> Claude, Copilot, Cursor, Antigravity &amp;
          Foundation-Model interview questions — answered, tiered by difficulty, and unlocked as you level up your
          subscription.
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
          <Link to="/pricing" className="btn btn-primary">
            See Pricing →
          </Link>
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", borderBottom: "1px solid var(--line)" }}>
          {GROUPS.map((g) => (
            <button
              key={g.key}
              onClick={() => setActiveGroup(g.key)}
              style={{
                all: "unset",
                boxSizing: "border-box",
                flex: 1,
                textAlign: "center",
                fontSize: 13,
                fontWeight: 700,
                padding: "14px 10px",
                cursor: "pointer",
                color: activeGroup === g.key ? "var(--ink)" : "var(--muted)",
                borderBottom: activeGroup === g.key ? "2px solid var(--accent)" : "2px solid transparent",
                marginBottom: -1,
              }}
            >
              {g.label}
            </button>
          ))}
        </div>
        <div style={{ padding: 20, display: "flex", flexWrap: "wrap", gap: 8, minHeight: 60 }}>
          {loading && <span style={{ color: "var(--muted)" }}>Loading tools…</span>}
          {!loading &&
            tools
              .filter((t) => t.group === activeGroup)
              .flatMap((tool) =>
                tool.categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/tools/${tool.slug}/${cat.slug}`}
                    className="mono"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      fontFamily: "var(--font-body)",
                      fontSize: 13.5,
                      fontWeight: 600,
                      padding: "8px 12px",
                      borderRadius: 9,
                      background: "var(--paper)",
                      border: "1px solid var(--line)",
                      color: "var(--ink)",
                      textDecoration: "none",
                    }}
                  >
                    {tool.name === cat.name ? cat.name : `${tool.name} ${cat.name}`}
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "var(--muted)",
                        background: "var(--paper-raised)",
                        border: "1px solid var(--line)",
                        padding: "1px 6px",
                        borderRadius: 100,
                      }}
                    >
                      {cat.questionCount}
                    </span>
                  </Link>
                ))
              )}
          {!loading && tools.filter((t) => t.group === activeGroup).length === 0 && (
            <span style={{ color: "var(--muted)" }}>No tools in this group yet.</span>
          )}
        </div>
      </div>
    </div>
  );
}
