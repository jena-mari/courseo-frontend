import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";
import imgBg from "../assets/courseo-bg.png";
import imgLogo from "../assets/courseo-logo.png";

function AuthLoading() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      setSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 500);
    return () => window.clearInterval(timer);
  }, []);

  const statusMessage = seconds < 3
    ? "Verifying your secure session"
    : "Courseo is taking a little longer to respond";

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#f4f6ff] px-6 font-['Montserrat',sans-serif] text-[#000181]">
      <img src={imgBg} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-55" />
      <div className="absolute inset-0 bg-white/70 backdrop-blur-lg" />

      <div
        className="relative flex w-full max-w-[340px] flex-col items-center px-8 py-8 text-center"
        role="status"
        aria-live="polite"
      >
        <div className="relative flex h-20 w-20 items-center justify-center">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 80 80" aria-hidden="true">
            <g transform="rotate(-90 40 40)">
              <circle cx="40" cy="40" r="35" fill="none" stroke="#e8eaff" strokeWidth="4" />
              <circle cx="40" cy="40" r="35" fill="none" stroke="#000181" strokeWidth="4" strokeLinecap="round" strokeDasharray="54 166">
                <animateTransform attributeName="transform" type="rotate" from="0 40 40" to="360 40 40" dur="0.9s" repeatCount="indefinite" />
              </circle>
            </g>
          </svg>
          <img
            src={imgLogo}
            alt="Courseo"
            className="h-9 w-9 object-contain"
          />
        </div>

        <h1 className="mt-5 text-[22px] font-black tracking-[-0.6px]">Connecting to Courseo</h1>
        <p className="mt-2 min-h-5 text-[12px] font-semibold leading-relaxed text-[rgba(0,1,129,0.55)]">
          {statusMessage}
        </p>
      </div>
    </div>
  );
}

/** Requires a valid backend session cookie (/me). */
export function ProtectedRoute() {
  const { user, status } = useAuth();

  if (status === "loading") return <AuthLoading />;
  if (!user) return <Navigate to="/" replace />;
  return <Outlet />;
}

/** Login/register: bounce away if already authenticated. */
export function GuestRoute() {
  const { user, status } = useAuth();

  // Login and registration are public. Render them immediately while the
  // background cookie check runs instead of making guests wait for /me.
  if (status === "loading") return <Outlet />;
  if (user) return <Navigate to="/connect-key" replace />;
  return <Outlet />;
}
