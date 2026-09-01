import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  type UserOut,
} from "../lib/authApi";
import {
  cacheAuthUser,
  clearCachedAuthUser,
  getCachedAuthUser,
  toCourseoUser,
  type CourseoUser,
} from "../lib/authSession";

type AuthStatus = "loading" | "authenticated" | "anonymous";

interface AuthContextValue {
  user: CourseoUser | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<CourseoUser>;
  register: (
    email: string,
    password: string,
    displayName?: string | null
  ) => Promise<CourseoUser>;
  logout: () => Promise<void>;
  updateUser: (user: CourseoUser) => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function applyUser(user: UserOut): CourseoUser {
  const mapped = toCourseoUser(user);
  cacheAuthUser(mapped);
  return mapped;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CourseoUser | null>(() => getCachedAuthUser());
  const [status, setStatus] = useState<AuthStatus>("loading");
  const authMutationRef = useRef(0);

  const refresh = useCallback(async () => {
    const mutationAtStart = authMutationRef.current;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);
    try {
      const current = await fetchCurrentUser(controller.signal);
      if (mutationAtStart !== authMutationRef.current) return;
      setUser(applyUser(current));
      setStatus("authenticated");
    } catch {
      if (mutationAtStart !== authMutationRef.current) return;
      clearCachedAuthUser();
      setUser(null);
      setStatus("anonymous");
    } finally {
      window.clearTimeout(timeout);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const current = await loginUser({ email, password });
    authMutationRef.current += 1;
    const mapped = applyUser(current);
    setUser(mapped);
    setStatus("authenticated");
    return mapped;
  }, []);

  const register = useCallback(
    async (email: string, password: string, displayName?: string | null) => {
      const current = await registerUser({
        email,
        password,
        display_name: displayName?.trim() || null,
      });
      authMutationRef.current += 1;
      const mapped = applyUser(current);
      setUser(mapped);
      setStatus("authenticated");
      return mapped;
    },
    []
  );

  const logout = useCallback(async () => {
    authMutationRef.current += 1;
    try {
      await logoutUser();
    } finally {
      clearCachedAuthUser();
      setUser(null);
      setStatus("anonymous");
    }
  }, []);

  const updateUser = useCallback((next: CourseoUser) => {
    cacheAuthUser(next);
    setUser(next);
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      login,
      register,
      logout,
      updateUser,
      refresh,
    }),
    [user, status, login, register, logout, updateUser, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
