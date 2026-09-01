import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f6ff] font-['Montserrat',sans-serif] text-[#000181]">
      <p className="text-sm font-semibold tracking-wide">Checking session…</p>
    </div>
  );
}

/** Requires a valid backend session cookie (/me). */
export function ProtectedRoute() {
  const { user, status } = useAuth();

  if (status === "loading") return <AuthLoading />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

/** Login/register: bounce away if already authenticated. */
export function GuestRoute() {
  const { user, status } = useAuth();

  if (status === "loading") return <AuthLoading />;
  if (user) return <Navigate to="/connect-key" replace />;
  return <Outlet />;
}
