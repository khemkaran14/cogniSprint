import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "18px 0",
        borderBottom: "1px solid var(--line)",
        marginBottom: 28,
        flexWrap: "wrap",
      }}
    >
      <Link to="/" style={{ display: "flex", alignItems: "baseline", gap: 9, textDecoration: "none" }}>
        <span
          className="mono"
          style={{
            fontSize: 13,
            letterSpacing: "0.06em",
            background: "var(--ink)",
            color: "var(--paper)",
            padding: "3px 7px",
            borderRadius: 4,
          }}
        >
          &gt;_
        </span>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, letterSpacing: "-0.01em" }}>
          <em style={{ fontStyle: "normal", color: "var(--accent)" }}>AI</em> Career Shield
        </span>
      </Link>

      <form onSubmit={handleSearch} style={{ flex: "1 1 220px", maxWidth: 320, minWidth: 160 }}>
        <input
          type="search"
          placeholder="Search questions…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: "100%" }}
        />
      </form>

      <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 14, fontWeight: 600 }}>
        <Link to="/pricing">Pricing</Link>
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            {user.role === "admin" && <Link to="/admin">Admin</Link>}
            <button className="btn btn-ghost" onClick={handleLogout}>
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Log In</Link>
            <Link to="/register" className="btn btn-primary">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
