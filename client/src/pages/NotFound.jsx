import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "80px 0" }}>
      <h1 style={{ fontSize: 40 }}>404</h1>
      <p style={{ color: "var(--muted)", marginTop: 8 }}>That page doesn't exist.</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: 20, display: "inline-flex" }}>
        Back Home
      </Link>
    </div>
  );
}
