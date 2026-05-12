import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, User, Lock, X } from "lucide-react";
import imgBg from "../assets/courseo-bg.png";
import imgLogo from "../assets/courseo-logo.png";

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
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    localStorage.setItem("courseoUser", JSON.stringify({ username }));
    navigate("/chat");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 20 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className="bg-white rounded-[50px] shadow-[2px_2px_10px_3px_rgba(0,0,0,0.1)] w-full max-w-[650px] p-10 relative"
    >
      <div className="absolute top-8 left-8">
        <img src={imgLogo} alt="Courseo" className="w-14 h-14 object-contain" />
      </div>

      <button
        onClick={onClose ?? (() => navigate("/"))}
        className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center text-[#000181] hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Close"
      >
        <X size={22} strokeWidth={3} />
      </button>

      <div className="text-center mt-8 mb-8">
        <h1 className="font-extrabold text-[clamp(40px,5vw,64px)] text-[#000181] tracking-[-2px] leading-[1.1]">
          Welcome back<br />to Courseo!
        </h1>
      </div>

      <form onSubmit={handleLogin} className="space-y-5 px-2">
        <div>
          <label className="font-bold text-[18px] text-[#000181] block mb-2">
            Username
          </label>
          <div className="border-2 border-[#000181] rounded-[20px] h-[50px] flex items-center px-4 gap-3">
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
          <label className="font-bold text-[18px] text-[#000181] block mb-2">
            Password
          </label>
          <div className="border-2 border-[#000181] rounded-[20px] h-[50px] flex items-center px-4 gap-3">
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

        <div className="flex items-center justify-between">
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
          className="w-full bg-[#83e7ff] border-2 border-[#000181] rounded-[20px] h-[50px] font-bold text-[15px] text-[#000181] shadow-[2px_2px_4px_rgba(0,0,0,0.25)] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                className="w-4 h-4 border-2 border-[#000181] border-t-transparent rounded-full"
              />
              Logging in...
            </>
          ) : (
            "Log-In"
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

      <div className="absolute inset-0 flex items-center justify-center px-6 py-8 z-10">
        <LoginCard />
      </div>
    </div>
  );
}
