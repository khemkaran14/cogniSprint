import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/client.js";
import QuestionCard from "../components/QuestionCard.jsx";
import useDocumentMeta from "../hooks/useDocumentMeta.js";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useDocumentMeta(q ? `Search: ${q}` : "Search", "Search interview questions across every AI tool.");

  useEffect(() => {
    setLoading(true);
    api
      .get("/content/search", { params: { q } })
      .then(({ data }) => setResults(data.results))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div>
      <span className="kicker">Search</span>
      <h1 style={{ marginTop: 8, fontSize: 30 }}>
        {q ? `Results for “${q}”` : "Search interview questions"}
      </h1>

      {loading && <p style={{ color: "var(--muted)", marginTop: 20 }}>Searching…</p>}

      {!loading && results.length === 0 && q && (
        <p style={{ color: "var(--muted)", marginTop: 20 }}>
          No questions match “{q}” yet. Try a different term, or{" "}
          <Link to="/">browse the full tool list</Link>.
        </p>
      )}

      <div style={{ marginTop: 20 }}>
        {results.map((r) => (
          <div key={r.id}>
            <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 4 }}>
              <Link to={`/tools/${r.tool.slug}/${r.category.slug}`}>
                {r.tool.name} · {r.category.name}
              </Link>
            </div>
            <QuestionCard q={r} />
          </div>
        ))}
      </div>
    </div>
  );
}
