import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [progress, setProgress] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    api.get("/payments/me").then(({ data }) => setPayments(data.payments));
    api.get("/bookmarks/progress").then(({ data }) => setProgress(data));
    api.get("/bookmarks/me").then(({ data }) => setBookmarks(data.bookmarks));
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 30 }}>Welcome back, {user.name.split(" ")[0]}</h1>
      <div className="card" style={{ padding: 22, marginTop: 20, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div className="kicker">Current Plan</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6, textTransform: "capitalize" }}>
            {user.plan}
            {user.plan !== "free" && (
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", marginLeft: 8, textTransform: "none" }}>
                billed {user.billingPeriod}
              </span>
            )}
          </div>
          {user.planExpiresAt && (
            <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>
              Renews {new Date(user.planExpiresAt).toLocaleDateString()}
            </div>
          )}
        </div>
        <Link to="/pricing" className="btn btn-primary">
          {user.plan === "premium" ? "Manage Plan" : "Upgrade Plan →"}
        </Link>
      </div>

      {progress && (
        <div className="card" style={{ padding: 22, marginTop: 20 }}>
          <div className="kicker">Progress</div>
          <div style={{ display: "flex", gap: 28, marginTop: 10, flexWrap: "wrap" }}>
            <div>
              <div className="mono" style={{ fontSize: 22, fontWeight: 800 }}>
                {progress.practicedCount}
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}> / {progress.totalQuestions}</span>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Questions practiced</div>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 22, fontWeight: 800 }}>{progress.bookmarkedCount}</div>
              <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Saved for later</div>
            </div>
          </div>
        </div>
      )}

      <h2 style={{ fontSize: 18, marginTop: 30, marginBottom: 12 }}>Saved Questions</h2>
      <div className="card" style={{ padding: bookmarks.length ? 0 : 16 }}>
        {bookmarks.length === 0 && <p style={{ color: "var(--muted)" }}>Bookmark a question to find it here later.</p>}
        {bookmarks.map((b, i) => (
          <Link
            key={b.question.id}
            to={`/tools/${b.tool.slug}/${b.category.slug}`}
            style={{
              display: "block",
              padding: "14px 18px",
              borderBottom: i < bookmarks.length - 1 ? "1px solid var(--line)" : "none",
              textDecoration: "none",
              color: "var(--ink)",
            }}
          >
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              {b.tool.name} · {b.category.name} {b.practiced && <span style={{ color: "var(--secondary)" }}>· Practiced</span>}
            </div>
            <div style={{ fontWeight: 600, fontSize: 14.5, marginTop: 2 }}>{b.question.question}</div>
          </Link>
        ))}
      </div>

      <h2 style={{ fontSize: 18, marginTop: 30, marginBottom: 12 }}>Payment History</h2>
      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr>
              {["Date", "Plan", "Amount", "Status"].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    color: "var(--muted)",
                    fontWeight: 700,
                    fontSize: 11,
                    textTransform: "uppercase",
                    padding: "10px 16px",
                    borderBottom: "1px solid var(--line)",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p._id}>
                <td style={{ padding: "10px 16px", borderBottom: "1px solid var(--line)" }}>
                  {new Date(p.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: "10px 16px", borderBottom: "1px solid var(--line)", textTransform: "capitalize" }}>
                  {p.plan}
                </td>
                <td className="mono" style={{ padding: "10px 16px", borderBottom: "1px solid var(--line)" }}>
                  ₹{p.amount}
                </td>
                <td style={{ padding: "10px 16px", borderBottom: "1px solid var(--line)", textTransform: "capitalize" }}>
                  {p.status}
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: 16, color: "var(--muted)" }}>
                  No payments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
