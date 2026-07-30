import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const LINKS = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/subscriptions", label: "Subscriptions" },
  { to: "/admin/payments", label: "Payments" },
  { to: "/admin/tools", label: "Content — Tools" },
  { to: "/admin/questions", label: "Content — Questions" },
];

export default function AdminLayout() {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: 1180, margin: "24px auto", padding: "0 20px" }}>
      <div
        className="card"
        style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          overflow: "hidden",
          minHeight: "80vh",
        }}
      >
        <div style={{ background: "var(--ink)", color: "var(--paper)", padding: "18px 12px" }}>
          <div
            className="mono"
            style={{ fontSize: 12, letterSpacing: "0.05em", color: "var(--accent-strong)", padding: "0 8px 16px" }}
          >
            &gt;_ AI Career Shield Admin
          </div>
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "9px 10px",
                borderRadius: 8,
                color: isActive ? "#fff" : "rgba(234,230,218,.7)",
                background: isActive ? "rgba(255,255,255,.1)" : "transparent",
                fontSize: 13.5,
                fontWeight: 600,
                textDecoration: "none",
                marginBottom: 2,
              })}
            >
              {l.label}
            </NavLink>
          ))}
        </div>
        <div style={{ padding: "22px 26px" }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <span style={{ fontSize: 12.5, color: "var(--muted)" }}>Signed in as {user.email}</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
