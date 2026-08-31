import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, X } from "lucide-react";
import imgBg from "../assets/courseo-bg.png";
import imgLogo from "../assets/courseo-logo.png";
import { CourseoSidebar, type Chat } from "../components/courseo-sidebar";
import { requestPasswordReset } from "../lib/authApi";

const AUTH_SIDEBAR_CHATS: Chat[] = [
  { id: "chat-1", title: "Study plan - Autumn 2026" },
  { id: "chat-2", title: "Elective recommendations" },
  { id: "chat-3", title: "Prerequisite check" },
];

interface ForgotPasswordCardProps {
  onClose?: () => void;
  onLogin?: () => void;
}

export function ForgotPasswordCard({ onClose, onLogin }: ForgotPasswordCardProps = {}) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const goToLogin = () => {
    if (onLogin) onLogin();
    else navigate("/login");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(email.trim().toLowerCase());
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 20 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className="bg-white rounded-[28px] sm:rounded-[32px] shadow-[0_28px_80px_rgba(0,0,0,0.32)] border border-white/70 w-full max-w-[590px] max-h-[calc(100dvh-32px)] overflow-y-auto px-6 py-7 sm:px-12 sm:py-10 relative"
    >
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
        <img src={imgLogo} alt="Courseo" className="w-10 h-10 object-contain" />
      </div>

      <button
        onClick={onClose ?? (() => navigate("/"))}
        className="absolute top-6 right-6 sm:top-8 sm:right-8 w-10 h-10 flex items-center justify-center text-[#000181] hover:bg-[#f1f3ff] rounded-full transition-colors"
        aria-label="Close"
      >
        <X size={24} strokeWidth={2.25} />
      </button>

      <div className="text-center pt-14 sm:pt-12 mb-7">
        <h1 className="font-extrabold text-[clamp(32px,7vw,46px)] text-[#000181] tracking-[-1.5px] leading-[1.05]">
          Forgot password?
        </h1>
        <p className="mt-3 text-[14px] sm:text-[15px] font-semibold text-[rgba(0,1,129,0.68)]">
          {submitted
            ? "If an account exists for that email, we sent a reset link."
            : "Enter your email and we'll send you a reset link."}
        </p>
      </div>

      {submitted ? (
        <div className="space-y-4">
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[14px] font-semibold text-center text-[rgba(0,1,129,0.75)]"
          >
            Check your inbox and follow the link to choose a new password. The link expires
            after a short time.
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={goToLogin}
            className="w-full h-[54px] rounded-[18px] bg-[#000181] text-white font-extrabold text-[15px] flex items-center justify-center"
          >
            Back to log in
          </motion.button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="forgot-email"
              className="font-extrabold text-[13px] text-[#000181] block mb-2"
            >
              Email
            </label>
            <div className="border-2 border-[rgba(0,1,129,0.35)] focus-within:border-[#000181] rounded-[18px] h-[52px] shadow-[0_4px_14px_rgba(0,1,129,0.06)] flex items-center px-4 gap-3 transition-colors">
              <Mail size={16} className="text-[rgba(0,1,129,0.5)] shrink-0" />
              <input
                type="email"
                id="forgot-email"
                autoComplete="email"
                placeholder="Enter your email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 text-[14px] font-semibold text-[#000181] placeholder:text-[rgba(0,1,129,0.38)] outline-none bg-transparent min-w-0"
              />
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm font-semibold text-center"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full h-[54px] rounded-[18px] bg-[#000181] text-white font-extrabold text-[15px] transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                Sending...
              </>
            ) : (
              "Send reset link"
            )}
          </motion.button>

          <p className="text-center text-[14px] text-[#000181]">
            <span className="font-normal">Remember your password? </span>
            <button type="button" onClick={goToLogin} className="font-bold hover:underline">
              Log in here.
            </button>
          </p>
        </form>
      )}
    </motion.div>
  );
}

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const goToChat = () => navigate("/chat");

  return (
    <div className="relative w-full h-screen overflow-hidden font-['Montserrat',sans-serif]">
      <img
        src={imgBg}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        alt=""
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      <div className="relative z-10 flex h-screen items-stretch gap-4 p-5">
        <div className="hidden h-full md:block">
          <CourseoSidebar
            chats={AUTH_SIDEBAR_CHATS}
            onNewChat={goToChat}
            onSelectChat={goToChat}
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((value) => !value)}
            showHandbook={false}
            activeUtility="account"
            onAccount={() => navigate("/login")}
            onSettings={() => navigate("/settings")}
            onHelp={() => undefined}
          />
        </div>

        <main className="flex min-w-0 flex-1 items-center justify-center overflow-hidden rounded-[30px] bg-white/20 px-6 py-8">
          <ForgotPasswordCard />
        </main>
      </div>
    </div>
  );
}
