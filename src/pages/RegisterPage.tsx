import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, User, Lock, Mail, X } from "lucide-react";
import imgBg from "../assets/courseo-bg.png";
import imgLogo from "../assets/courseo-logo.png";
import { CourseoSidebar, type Chat } from "../components/courseo-sidebar";
import { createAuthSession } from "../lib/authSession";

const AUTH_SIDEBAR_CHATS: Chat[] = [
  { id: "chat-1", title: "Study plan - Autumn 2026" },
  { id: "chat-2", title: "Elective recommendations" },
  { id: "chat-3", title: "Prerequisite check" },
];

interface RegisterCardProps {
  onClose?: () => void;
  onLogin?: () => void;
}

export function RegisterCard({ onClose, onLogin }: RegisterCardProps = {}) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!username.trim()) return setError("Please enter a username.");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      return setError("Please enter a valid email address.");
    }
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    if (!agreePrivacy) return setError("Please agree to the Privacy Policy.");

    setLoading(true);
    try {
      createAuthSession(
        { username: username.trim(), email: email.trim() },
        rememberMe
      );
      navigate("/chat");
    } finally {
      setLoading(false);
    }
  };

  const handleProviderRegister = (provider: "Google" | "Yahoo") => {
    createAuthSession(
      { username: provider, email: "", provider },
      rememberMe
    );
    navigate("/chat");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 20 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className="bg-white rounded-[42px] shadow-[2px_2px_10px_3px_rgba(0,0,0,0.1)] w-full max-w-[620px] px-7 py-8 sm:px-10 sm:py-9 relative overflow-y-auto max-h-[92vh]"
    >
      <div className="absolute top-8 left-8">
        <img src={imgLogo} alt="Courseo" className="w-12 h-12 object-contain" />
      </div>

      <button
        onClick={onClose ?? (() => navigate("/"))}
        className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center text-[#000181] hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Close"
      >
        <X size={22} strokeWidth={3} />
      </button>

      <div className="text-center mt-7 mb-5">
        <h1 className="font-extrabold text-[clamp(32px,5vw,54px)] text-[#000181] tracking-[-2px] leading-[1.05]">
          Register for<br />Courseo!
        </h1>
      </div>

      <form onSubmit={handleRegister} className="space-y-3 px-1 sm:px-2">
        <div>
          <label className="font-bold text-[15px] text-[#000181] block mb-1.5">
            Username
          </label>
          <div className="border-2 border-[#000181] rounded-[18px] h-[44px] flex items-center px-4 gap-3">
            <User size={16} className="text-[rgba(0,1,129,0.5)] shrink-0" />
            <input
              type="text"
              placeholder="Enter your username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-1 text-[14px] font-normal text-[rgba(0,1,129,0.5)] placeholder:text-[rgba(0,1,129,0.5)] outline-none bg-transparent min-w-0"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-[15px] text-[#000181] block mb-1.5">
            Email
          </label>
          <div className="border-2 border-[#000181] rounded-[18px] h-[44px] flex items-center px-4 gap-3">
            <Mail size={16} className="text-[rgba(0,1,129,0.5)] shrink-0" />
            <input
              type="email"
              placeholder="Enter your email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 text-[14px] font-normal text-[rgba(0,1,129,0.5)] placeholder:text-[rgba(0,1,129,0.5)] outline-none bg-transparent min-w-0"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-[15px] text-[#000181] block mb-1.5">
            Password
          </label>
          <div className="border-2 border-[#000181] rounded-[18px] h-[44px] flex items-center px-4 gap-3">
            <Lock size={16} className="text-[rgba(0,1,129,0.5)] shrink-0" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 text-[14px] font-normal text-[rgba(0,1,129,0.5)] placeholder:text-[rgba(0,1,129,0.5)] outline-none bg-transparent min-w-0"
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

        <div>
          <label className="font-bold text-[15px] text-[#000181] block mb-1.5">
            Confirm Password
          </label>
          <div className="border-2 border-[#000181] rounded-[18px] h-[44px] flex items-center px-4 gap-3">
            <Lock size={16} className="text-[rgba(0,1,129,0.5)] shrink-0" />
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Enter your password..."
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="flex-1 text-[14px] font-normal text-[rgba(0,1,129,0.5)] placeholder:text-[rgba(0,1,129,0.5)] outline-none bg-transparent min-w-0"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="text-[rgba(0,1,129,0.5)] hover:text-[#000181] transition-colors shrink-0"
              aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirm ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 border-2 border-[#000181] rounded accent-[#000181]"
          />
          <span className="font-bold text-[13px] text-[#000181]">Remember Me</span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={agreePrivacy}
            onChange={(e) => setAgreePrivacy(e.target.checked)}
            className="w-4 h-4 border-2 border-[#000181] rounded accent-[#000181]"
          />
          <span className="font-bold text-[13px] text-[#000181]">
            I agree to the{" "}
            <button
              type="button"
              className="italic underline hover:opacity-70 transition-opacity"
            >
              Privacy policy
            </button>
          </span>
        </label>

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
          className="w-full bg-[rgba(232,160,255,0.5)] border-2 border-[#000181] rounded-[20px] h-[50px] font-bold text-[15px] text-[#000181] shadow-[2px_2px_4px_rgba(0,0,0,0.25)] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                className="w-4 h-4 border-2 border-[#000181] border-t-transparent rounded-full"
              />
              Registering...
            </>
          ) : (
            "Register now"
          )}
        </motion.button>

        <div className="flex items-center gap-3 py-0.5">
          <div className="h-px flex-1 bg-[rgba(0,1,129,0.18)]" />
          <span className="text-[12px] font-bold text-[rgba(0,1,129,0.55)]">
            or register with
          </span>
          <div className="h-px flex-1 bg-[rgba(0,1,129,0.18)]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => handleProviderRegister("Google")}
            className="h-[42px] rounded-[16px] border-2 border-[#000181] bg-white font-bold text-[14px] text-[#000181] shadow-[1px_1px_3px_rgba(0,0,0,0.14)] flex items-center justify-center gap-2"
          >
            <span className="w-6 h-6 rounded-full bg-[#fff4f0] border border-[rgba(0,1,129,0.18)] flex items-center justify-center text-[13px] font-black">
              G
            </span>
            Google
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => handleProviderRegister("Yahoo")}
            className="h-[42px] rounded-[16px] border-2 border-[#000181] bg-white font-bold text-[14px] text-[#000181] shadow-[1px_1px_3px_rgba(0,0,0,0.14)] flex items-center justify-center gap-2"
          >
            <span className="w-6 h-6 rounded-full bg-[rgba(232,160,255,0.28)] border border-[rgba(0,1,129,0.18)] flex items-center justify-center text-[12px] font-black">
              Y!
            </span>
            Yahoo
          </motion.button>
        </div>

        <p className="text-center text-[14px] text-[#000181]">
          <span className="font-normal">Have an account? </span>
          <button
            type="button"
            onClick={onLogin ?? (() => navigate("/login"))}
            className="font-bold hover:underline"
          >
            Log in here.
          </button>
        </p>
      </form>
    </motion.div>
  );
}

export function RegisterPage() {
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
          <RegisterCard />
        </main>
      </div>
    </div>
  );
}
