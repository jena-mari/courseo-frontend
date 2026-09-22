import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { LoadingScreen } from "../components/LoadingScreen";

/** Requires a valid backend session cookie (/me). */
export function ProtectedRoute() {
  const { user, status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <LoadingScreen title="Connecting to Courseo" detail="Verifying your secure session with the server…" />;
  if (!user) return <Navigate to="/" replace state={{ authRequired: true, returnTo: location.pathname }} />;
  return <Outlet key={user?.id ?? "anonymous"} />;
}

/** Login/register: bounce away if already authenticated. */
export function GuestRoute() {
  const { user, status } = useAuth();

  // Login and registration are public. Render them immediately while the
  // background cookie check runs instead of making guests wait for /me.
  if (status === "loading") return <Outlet />;
  if (user) return <Navigate to={user.displayName ? "/chat" : "/profile"} replace />;
  return <Outlet />;
}
