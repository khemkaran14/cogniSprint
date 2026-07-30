import { useEffect, useState } from "react";
import api from "../../api/client.js";

function Tile({ label, value, trend }) {
  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: 11, padding: "14px 16px" }}>
      <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em" }}>
        {label}
      </div>
      <div className="mono" style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>
        {value}
      </div>
      {trend && (
        <div style={{ fontSize: 11.5, marginTop: 4, fontWeight: 700, color: trend.startsWith("-") ? "var(--locked)" : "var(--secondary)" }}>
          {trend}
        </div>
      )}
    </div>
  );
}

function Sparkline({ data }) {
  if (!data || data.length === 0) {
    return <p style={{ color: "var(--muted)", fontSize: 13 }}>No revenue in the last 14 days yet.</p>;
  }
  const values = data.map((d) => d.total);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const w = 300;
  const h = 120;
  const step = data.length > 1 ? w / (data.length - 1) : 0;
  const points = values.map((v, i) => [i * step, h - ((v - min) / range) * (h - 16) - 8]);
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const areaPath = `${linePath} L${w},${h} L0,${h} Z`;

  return (
    <svg width="100%" height="120" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#fill)" />
      <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.length > 0 && <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r="4" fill="var(--accent)" />}
    </svg>
  );
}

export default function Overview() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/admin/overview").then(({ data }) => setData(data));
  }, []);

  if (!data) return <p style={{ color: "var(--muted)" }}>Loading…</p>;

  return (
    <div>
      <h2 style={{ fontSize: 20, marginBottom: 18 }}>Overview</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 20 }}>
        <Tile label="Total Users" value={data.totalUsers.toLocaleString()} trend={`+${data.newUsersThisWeek} this week`} />
        <Tile label="Active Subscribers" value={data.activeSubscribers.toLocaleString()} trend={`+${data.newSubsThisWeek} this week`} />
        <Tile label="MRR" value={`₹${data.mrr.toLocaleString()}`} />
        <Tile label="Trial → Paid" value={`${data.conversionRate}%`} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16 }}>
        <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 16 }}>
          <h3 style={{ fontSize: 14, marginBottom: 12 }}>Recent Payments</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.8 }}>
            <thead>
              <tr>
                {["User", "Plan", "Amount", "Status"].map((h) => (
                  <th key={h} style={{ textAlign: "left", color: "var(--muted)", fontWeight: 700, fontSize: 11, textTransform: "uppercase", paddingBottom: 8, borderBottom: "1px solid var(--line)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.recentPayments.map((p) => (
                <tr key={p._id}>
                  <td style={{ padding: "9px 0", borderBottom: "1px solid var(--line)" }}>{p.user?.email || "—"}</td>
                  <td style={{ padding: "9px 0", borderBottom: "1px solid var(--line)", textTransform: "capitalize" }}>{p.plan}</td>
                  <td className="mono" style={{ padding: "9px 0", borderBottom: "1px solid var(--line)" }}>₹{p.amount}</td>
                  <td style={{ padding: "9px 0", borderBottom: "1px solid var(--line)" }}>
                    <StatusPill status={p.status} />
                  </td>
                </tr>
              ))}
              {data.recentPayments.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: "9px 0", color: "var(--muted)" }}>No payments yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 16 }}>
          <h3 style={{ fontSize: 14, marginBottom: 12 }}>Revenue — Last 14 Days</h3>
          <Sparkline data={data.dailyRevenue} />
          <h3 style={{ fontSize: 14, marginTop: 16, marginBottom: 12 }}>Plan Mix</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.8 }}>
            <tbody>
              {Object.entries(data.planMix).map(([plan, count]) => (
                <tr key={plan}>
                  <td style={{ padding: "9px 0", borderBottom: "1px solid var(--line)", textTransform: "capitalize" }}>{plan}</td>
                  <td className="mono" style={{ padding: "9px 0", borderBottom: "1px solid var(--line)", textAlign: "right" }}>
                    {count.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function StatusPill({ status }) {
  const colors = {
    paid: "var(--secondary)",
    created: "var(--muted)",
    failed: "var(--locked)",
    refunded: "var(--muted)",
  };
  const color = colors[status] || "var(--muted)";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 700, fontSize: 11.5, color, textTransform: "capitalize" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
      {status}
    </span>
  );
}
