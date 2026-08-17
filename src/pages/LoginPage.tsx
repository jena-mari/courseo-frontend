import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, User, Lock, X } from "lucide-react";
import imgBg from "../assets/courseo-bg.png";
import imgLogo from "../assets/courseo-logo.png";
import { CourseoSidebar, type Chat } from "../components/courseo-sidebar";
import { createAuthSession } from "../lib/authSession";

const AUTH_SIDEBAR_CHATS: Chat[] = [
  { id: "chat-1", title: "Study plan - Autumn 2026" },
  { id: "chat-2", title: "Elective recommendations" },
  { id: "chat-3", title: "Prerequisite check" },
];

interface LoginCardProps {
  onClose?: () => void;
  onRegister?: () => void;
}

export function LoginCard({ onClose, onRegister }: LoginCardProps = {}) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Please enter your username and password.");
      return;
    }
    setLoading(true);
    try {
      createAuthSession({ username: username.trim() }, rememberMe);
      navigate("/chat");
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
          Welcome back
        </h1>
        <p className="mt-3 text-[14px] sm:text-[15px] font-semibold text-[rgba(0,1,129,0.68)]">
          Log in to continue with Courseo.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="login-username" className="font-extrabold text-[13px] text-[#000181] block mb-2">
            Username
          </label>
          <div className="border-2 border-[rgba(0,1,129,0.35)] focus-within:border-[#000181] rounded-[18px] h-[52px] shadow-[0_4px_14px_rgba(0,1,129,0.06)] flex items-center px-4 gap-3 transition-colors">
            <User size={16} className="text-[rgba(0,1,129,0.5)] shrink-0" />
            <input
              type="text"
              id="login-username"
              autoComplete="username"
              placeholder="Enter your username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-1 text-[14px] font-semibold text-[#000181] placeholder:text-[rgba(0,1,129,0.38)] outline-none bg-transparent min-w-0"
            />
          </div>
        </div>


        <div>
          <label htmlFor="login-password" className="font-extrabold text-[13px] text-[#000181] block mb-2">
            Password
          </label>
          <div className="border-2 border-[rgba(0,1,129,0.35)] focus-within:border-[#000181] rounded-[18px] h-[52px] shadow-[0_4px_14px_rgba(0,1,129,0.06)] flex items-center px-4 gap-3 transition-colors">
            <Lock size={16} className="text-[rgba(0,1,129,0.5)] shrink-0" />
            <input
              type={showPassword ? "text" : "password"}
              id="login-password"
              autoComplete="current-password"
              placeholder="Enter your password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 text-[14px] font-semibold text-[#000181] placeholder:text-[rgba(0,1,129,0.38)] outline-none bg-transparent min-w-0"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[rgba(0,1,129,0.5)] hover:text-[#000181] transition-colors shrink-0"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-5 h-5 border-2 border-[#000181] rounded accent-[#000181]"
            />
            <span className="font-bold text-[14px] text-[#000181]">Remember Me</span>
          </label>
          <button
            type="button"
            className="font-bold text-[14px] text-[#000181] hover:underline"
          >
            Forgot Password?
          </button>
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
              Logging in...
            </>
          ) : (
            "Log in"
          )}
        </motion.button>

        <p className="text-center text-[14px] text-[#000181]">
          <span className="font-normal">Don't have an account? </span>
          <button
            type="button"
            onClick={onRegister ?? (() => navigate("/register"))}
            className="font-bold hover:underline"
          >
            Register an account.
          </button>
        </p>
      </form>
    </motion.div>
  );
}

export function LoginPage() {
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
          <LoginCard />
        </main>
      </div>
    </div>
  );
}
