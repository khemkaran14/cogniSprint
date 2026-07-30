import { useEffect, useState } from "react";
import api from "../../api/client.js";

export default function Subscriptions() {
  const [subs, setSubs] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    api.get("/admin/subscriptions").then(({ data }) => {
      setSubs(data.subscriptions);
      setTotal(data.total);
    });
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: 20, marginBottom: 16 }}>Subscriptions ({total})</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {["Name", "Email", "Plan", "Renews / Expires", "Since"].map((h) => (
              <th key={h} style={{ textAlign: "left", color: "var(--muted)", fontWeight: 700, fontSize: 11, textTransform: "uppercase", padding: "8px 10px", borderBottom: "1px solid var(--line)" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {subs.map((s) => {
            const expired = s.planExpiresAt && new Date(s.planExpiresAt) < new Date();
            return (
              <tr key={s._id}>
                <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--line)" }}>{s.name}</td>
                <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--line)" }}>{s.email}</td>
                <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--line)", textTransform: "capitalize" }}>{s.plan}</td>
                <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--line)", color: expired ? "var(--locked)" : "var(--ink)" }}>
                  {s.planExpiresAt ? new Date(s.planExpiresAt).toLocaleDateString() : "—"} {expired && "(expired)"}
                </td>
                <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--line)" }}>
                  {new Date(s.createdAt).toLocaleDateString()}
                </td>
              </tr>
            );
          })}
          {subs.length === 0 && (
            <tr>
              <td colSpan={5} style={{ padding: 16, color: "var(--muted)" }}>No active subscriptions yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
