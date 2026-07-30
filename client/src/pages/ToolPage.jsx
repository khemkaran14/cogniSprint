import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client.js";
import QuestionCard from "../components/QuestionCard.jsx";
import useDocumentMeta from "../hooks/useDocumentMeta.js";

const DIFF_TABS = [
  { key: "all", label: "All" },
  { key: "easy", label: "Easy · Free" },
  { key: "medium", label: "Medium · Pro" },
  { key: "hard", label: "Hard · Premium" },
];

export default function ToolPage() {
  const { toolSlug, categorySlug } = useParams();
  const [data, setData] = useState(null);
  const [diff, setDiff] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get(`/content/tools/${toolSlug}/categories/${categorySlug}/questions`)
      .then(({ data }) => setData(data))
      .catch(() => setError("This category could not be found."))
      .finally(() => setLoading(false));
  }, [toolSlug, categorySlug]);

  useDocumentMeta(
    data ? `${data.tool.name} ${data.category.name} Interview Questions` : null,
    data
      ? `${data.questions.length} ${data.tool.name} ${data.category.name} interview questions, answered and tiered by difficulty.`
      : null
  );

  if (loading) return <p style={{ color: "var(--muted)" }}>Loading questions…</p>;
  if (error) return <p className="error-text">{error}</p>;
  if (!data) return null;

  const questions = data.questions.filter((q) => diff === "all" || q.difficulty === diff);

  return (
    <div>
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>
        <Link to="/">Home</Link> / <b style={{ color: "var(--ink)" }}>{data.tool.name}</b> / {data.category.name}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 20,
          flexWrap: "wrap",
          marginBottom: 18,
        }}
      >
        <div>
          <span className="badge">
            {data.questions.length} Questions · {data.tool.name}
          </span>
          <h1 style={{ marginTop: 8, fontSize: 32 }}>{data.category.name} Interview Questions</h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {DIFF_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setDiff(t.key)}
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                padding: "8px 14px",
                borderRadius: 100,
                cursor: "pointer",
                border: diff === t.key ? "1px solid var(--ink)" : "1px solid var(--line)",
                background: diff === t.key ? "var(--ink)" : "transparent",
                color: diff === t.key ? "var(--paper)" : "var(--muted)",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {questions.map((q) => (
        <QuestionCard key={q.id} q={q} />
      ))}
      {questions.length === 0 && <p style={{ color: "var(--muted)" }}>No questions in this tier yet.</p>}
    </div>
  );
}
