import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    api.get("/payments/me").then(({ data }) => setPayments(data.payments));
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 30 }}>Welcome back, {user.name.split(" ")[0]}</h1>
      <div className="card" style={{ padding: 22, marginTop: 20, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div className="kicker">Current Plan</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6, textTransform: "capitalize" }}>{user.plan}</div>
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
