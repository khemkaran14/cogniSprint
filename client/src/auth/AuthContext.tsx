import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { apiGet, apiPost } from "@/lib/api";

export type AuthUser = { id: string; name: string; email: string; role: "learner" | "admin"; emailVerified: boolean };

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ user: AuthUser | null }>("/auth/me").then((result) => setUser(result.user)).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => ({ user, loading, setUser, logout: async () => { await apiPost<void>("/auth/logout", {}); setUser(null); } }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
