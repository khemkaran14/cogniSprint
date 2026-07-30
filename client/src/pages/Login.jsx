import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await login(email, password);
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 380, margin: "40px auto" }} className="card">
      <form onSubmit={handleSubmit} style={{ padding: 28, display: "flex", flexDirection: "column", gap: 14 }}>
        <h1 style={{ fontSize: 24 }}>Log In</h1>
        {error && <p className="error-text">{error}</p>}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="btn btn-primary" disabled={busy} style={{ justifyContent: "center" }}>
          {busy ? "Logging in…" : "Log In"}
        </button>
        <p style={{ fontSize: 13.5, color: "var(--muted)" }}>
          No account? <Link to="/register">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
