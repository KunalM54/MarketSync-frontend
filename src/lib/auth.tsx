import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { apiRequest, ApiError } from "./api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isPhoneVerified: boolean;
  role: "CUSTOMER" | "SELLER" | "ADMIN";
  isActive: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "commercex.user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  const persist = (next: AuthUser | null) => {
    setUser(next);
    try {
      if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable — keep in-memory state */
    }
  };

  // On load, validate a stored session against the server. If the auth cookie
  // is missing/expired, clear the stale local user so API calls don't fail.
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    apiRequest<AuthUser>("/auth/me")
      .then((fresh) => {
        if (!cancelled) persist(fresh);
      })
      .catch((err) => {
        if (cancelled) return;
        // Only clear on auth failures — keep the session if the API is just unreachable.
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          persist(null);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      async signIn(email, password) {
        const data = await apiRequest<AuthUser>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        persist(data);
        return data;
      },
      async signOut() {
        try {
          await apiRequest<void>("/auth/logout", { method: "POST" });
        } catch {
          /* server unreachable — still clear local state */
        }
        persist(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<AuthUser> {
  return apiRequest<AuthUser>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
