import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, Mail, User, X } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { clearCourseoStorage } from "../lib/storageKeys";

export function AccountManagement({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      clearCourseoStorage();
      navigate("/login");
    } catch {
      setIsLoggingOut(false);
      setIsSuccess(false);
      setMessage("Unable to log out. Please try again.");
    }
  };

  const handleAccountChange = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSuccess(false);

    if (!username.trim()) {
      setMessage("Please enter a username.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setMessage("Please enter a valid email address.");
      return;
    }

    if (!user) {
      setMessage("Log in before updating your account.");
      return;
    }

    updateUser({
      ...user,
      username: username.trim(),
      email: email.trim(),
      displayName: username.trim(),
    });

    setIsSuccess(true);
    setMessage("Account updated locally. Server profile sync is not available yet.");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <motion.div
        initial={{ scale: 0.92, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        className="relative max-h-[calc(100dvh-32px)] w-full max-w-[590px] overflow-y-auto rounded-[28px] border border-white/70 bg-white px-6 py-7 shadow-[0_28px_80px_rgba(0,0,0,0.32)] sm:rounded-[32px] sm:px-10 sm:py-9"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-dialog-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full text-[#000181] transition-colors hover:bg-[#f1f3ff]"
          aria-label="Close account settings"
        >
          <X size={22} strokeWidth={2.25} />
        </button>

        <div className="mb-6 flex items-center gap-3 pr-12">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(131,231,255,0.5)]">
            <User size={20} className="text-[#000181]" />
          </div>
          <div>
            <h2 id="account-dialog-title" className="text-2xl font-extrabold tracking-tight text-[#000181]">
              Your account
            </h2>
            <p className="mt-1 text-[13px] font-semibold text-[rgba(0,1,129,0.6)]">
              Update the profile shown in this browser session.
            </p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleAccountChange}>
          <div>
            <label htmlFor="account-username" className="mb-2 block text-[13px] font-extrabold text-[#000181]">
              Username
            </label>
            <div className="flex h-[52px] items-center gap-3 rounded-[18px] border-2 border-[rgba(0,1,129,0.35)] px-4 transition-colors focus-within:border-[#000181]">
              <User size={16} className="shrink-0 text-[rgba(0,1,129,0.5)]" />
              <input
                id="account-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-[14px] font-semibold text-[#000181] outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="account-email" className="mb-2 block text-[13px] font-extrabold text-[#000181]">
              Email
            </label>
            <div className="flex h-[52px] items-center gap-3 rounded-[18px] border-2 border-[rgba(0,1,129,0.35)] px-4 transition-colors focus-within:border-[#000181]">
              <Mail size={16} className="shrink-0 text-[rgba(0,1,129,0.5)]" />
              <input
                id="account-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-[14px] font-semibold text-[#000181] outline-none"
              />
            </div>
          </div>

          {message && (
            <p
              role={isSuccess ? "status" : "alert"}
              className={`text-center text-sm font-semibold ${isSuccess ? "text-emerald-700" : "text-red-600"}`}
            >
              {message}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-[50px] rounded-[18px] border border-[rgba(0,1,129,0.25)] px-7 text-[14px] font-extrabold text-[#000181] transition-colors hover:bg-[#f1f3ff]"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              className="h-[50px] rounded-[18px] bg-[#000181] px-7 text-[14px] font-extrabold text-white"
            >
              Save changes
            </motion.button>
          </div>
        </form>

        <div className="mt-6 border-t border-[rgba(0,1,129,0.12)] pt-5">
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={isLoggingOut}
            className="flex w-full items-center justify-center gap-2 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-extrabold text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut size={16} strokeWidth={2.25} />
            {isLoggingOut ? "Logging out…" : "Log out"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
