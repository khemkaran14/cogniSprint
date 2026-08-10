import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Form";
import { useAuth, type AuthUser } from "@/auth/AuthContext";
import { apiPost, ApiError } from "@/lib/api";
import { AuthShell } from "./AuthShell";

export default function LoginPage() {
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const { setUser } = useAuth(); const navigate = useNavigate(); const location = useLocation();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    const data = new FormData(event.currentTarget);
    try { const result = await apiPost<{ user: AuthUser }>("/auth/login", { email: data.get("email"), password: data.get("password") }); setUser(result.user); navigate((location.state as { from?: string } | null)?.from ?? "/account", { replace: true }); }
    catch (e) { setError(e instanceof ApiError ? e.message : "Unable to sign in."); } finally { setBusy(false); }
  }
  return <AuthShell title="Welcome back" description="Sign in to continue your CogniSprint journey." path="/login" footer={<>New to CogniSprint? <Link className="font-semibold text-[var(--color-brand-blue)]" to="/register">Create an account</Link></>}>
    <form onSubmit={submit} className="space-y-5">{error && <Alert variant="error">{error}</Alert>}<div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" autoComplete="email" required /></div><div><div className="flex justify-between"><Label htmlFor="password">Password</Label><Link className="text-xs font-semibold text-[var(--color-brand-blue)]" to="/forgot-password">Forgot password?</Link></div><Input id="password" name="password" type="password" autoComplete="current-password" required /></div><Button className="w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button></form>
  </AuthShell>;
}
