import { useEffect, useState } from "react";
import api from "../../api/client.js";
import { StatusPill } from "./Overview.jsx";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [status, setStatus] = useState("");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    api.get("/admin/payments", { params: status ? { status } : {} }).then(({ data }) => {
      setPayments(data.payments);
      setTotal(data.total);
    });
  }, [status]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 20 }}>Payments ({total})</h2>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="created">Created</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {["Date", "User", "Plan", "Amount", "Razorpay Order", "Status"].map((h) => (
              <th key={h} style={{ textAlign: "left", color: "var(--muted)", fontWeight: 700, fontSize: 11, textTransform: "uppercase", padding: "8px 10px", borderBottom: "1px solid var(--line)" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p._id}>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--line)" }}>{new Date(p.createdAt).toLocaleString()}</td>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--line)" }}>{p.user?.email || "—"}</td>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--line)", textTransform: "capitalize" }}>{p.plan}</td>
              <td className="mono" style={{ padding: "8px 10px", borderBottom: "1px solid var(--line)" }}>₹{p.amount}</td>
              <td className="mono" style={{ padding: "8px 10px", borderBottom: "1px solid var(--line)", fontSize: 11.5 }}>{p.razorpayOrderId}</td>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--line)" }}>
                <StatusPill status={p.status} />
              </td>
            </tr>
          ))}
          {payments.length === 0 && (
            <tr>
              <td colSpan={6} style={{ padding: 16, color: "var(--muted)" }}>No payments found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
