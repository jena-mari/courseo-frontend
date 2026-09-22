import { LoadingIndicator } from "./LoadingIndicator";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, LogOut, X } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { changePassword } from "../lib/authApi";
import { accountStorage, STORAGE_KEYS } from "../lib/storageKeys";

export function AccountManagement({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();
  const storage = accountStorage(user?.id);
  const [section, setSection] = useState<"profile" | "password">("profile");
  const [name, setName] = useState(user?.displayName ?? user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [profilePassword, setProfilePassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [busy, setBusy] = useState<"profile" | "password" | "logout" | "">("");
  const emailChanged = email.trim().toLowerCase() !== user?.email.toLowerCase();

  const showMessage = (text: string, success = false) => {
    setMessage(text);
    setIsSuccess(success);
  };

  const handleLogout = async () => {
    if (busy) return;
    setBusy("logout");
    try {
      await logout();
      navigate("/login");
    } catch {
      setBusy("");
      showMessage("Unable to log out. Please try again.");
    }
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    if (!user || !name.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      showMessage("Enter a valid preferred name and email address.");
      return;
    }
    if (emailChanged && !profilePassword) {
      showMessage("Enter your current password to change your email address.");
      return;
    }
    setBusy("profile");
    setMessage("");
    try {
      const saved = await updateProfile({
        email: email.trim(),
        display_name: name.trim(),
        elective_interests: user.electiveInterests ?? [],
        ...(emailChanged ? { current_password: profilePassword } : {}),
      });
      storage.setItem(STORAGE_KEYS.profile, JSON.stringify({
        displayName: saved.displayName,
        email: saved.email,
        degreeCode: saved.degreeCode,
        degree: "Bachelor of Computer Science",
        commencementYear: saved.commencementYear,
        campus: saved.campus,
        major: saved.major,
        interests: saved.electiveInterests,
      }));
      setName(saved.displayName ?? "");
      setEmail(saved.email);
      showMessage("Account details updated.", true);
    } catch (cause) {
      showMessage(cause instanceof Error ? cause.message : "Could not update your account.");
    } finally {
      setProfilePassword("");
      setBusy("");
    }
  };

  const savePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword.length < 8) return showMessage("Your new password must be at least eight characters.");
    if (newPassword !== confirmPassword) return showMessage("The new passwords do not match.");
    setBusy("password");
    setMessage("");
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showMessage("Password updated successfully.", true);
    } catch (cause) {
      showMessage(cause instanceof Error ? cause.message : "Could not update your password.");
    } finally {
      setBusy("");
    }
  };

  const fieldClass = "mt-2 h-11 w-full rounded-xl border border-[#d9daea] bg-[#fafaff] px-3 text-[14px] font-medium text-[#000181] outline-none transition-colors focus:border-[#000181] focus:bg-white focus:ring-2 focus:ring-[#000181]/10";

  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex flex-col overflow-y-auto overscroll-contain bg-black/35 p-4 touch-pan-y [-webkit-overflow-scrolling:touch] sm:p-6" onClick={onClose} role="presentation">
    <motion.div initial={{ scale: 0.92, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.92, y: 20, opacity: 0 }} transition={{ type: "spring", stiffness: 280, damping: 28 }} className="relative mx-auto my-auto w-full shrink-0 max-w-[480px] rounded-[24px] border border-white/70 bg-white px-6 py-7 shadow-[0_28px_80px_rgba(0,0,0,0.32)] sm:px-7 sm:py-7" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="account-dialog-title">
      <button type="button" onClick={onClose} className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full text-[#000181] hover:bg-[#f1f3ff]" aria-label="Close account settings"><X size={21} /></button>
      <div className="pr-12"><h2 id="account-dialog-title" className="text-[22px] font-extrabold tracking-tight text-[#000181]">Account settings</h2><p className="mt-1 truncate text-[12px] font-medium text-[#000181]/55">{user?.email}</p></div>
      <div className="my-6 flex gap-6 border-b border-[#e9e9f2]" aria-label="Account sections">
        {(["profile", "password"] as const).map((item) => <button key={item} type="button" aria-pressed={section === item} disabled={Boolean(busy)} onClick={() => { setSection(item); setMessage(""); }} className={`border-b-2 pb-3 text-[13px] font-bold transition-colors ${section === item ? "border-[#000181] text-[#000181]" : "border-transparent text-[#000181]/50 hover:text-[#000181]"}`}>{item === "profile" ? "Profile" : "Password"}</button>)}
      </div>

      {message && <p role={isSuccess ? "status" : "alert"} className={`mb-5 flex items-center gap-2 rounded-[14px] px-4 py-3 text-[12px] font-semibold ${isSuccess ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>{isSuccess && <CheckCircle2 size={16} />}{message}</p>}

      <form hidden={section !== "profile"} onSubmit={(event) => void saveProfile(event)}>
        <div className="mt-4 grid gap-4">
          <label className="text-[12px] font-extrabold text-[#000181]">Preferred name<input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" className={fieldClass} /></label>
          <label className="text-[12px] font-extrabold text-[#000181]">Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className={fieldClass} /></label>
        </div>
        {emailChanged && <label className="mt-4 block text-[12px] font-extrabold text-[#000181]">Current password<input type="password" value={profilePassword} onChange={(event) => setProfilePassword(event.target.value)} autoComplete="current-password" placeholder="Required to change email" className={fieldClass} /></label>}
        <button type="submit" disabled={Boolean(busy)} className="mt-4 flex h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#000181] text-[12px] font-extrabold text-white disabled:opacity-50">{busy === "profile" && <LoadingIndicator size={16} />}Save account details</button>
      </form>

      <form hidden={section !== "password"} onSubmit={(event) => void savePassword(event)}>
        <p className="mt-1 text-[11px] font-semibold leading-relaxed text-[rgba(0,1,129,0.55)]">Choose a password with at least eight characters.</p>
        <div className="mt-4 grid gap-4">
          <label className="text-[12px] font-extrabold text-[#000181]">Current password<input required type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" className={fieldClass} /></label>
          <label className="text-[12px] font-extrabold text-[#000181]">New password<input required type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" minLength={8} className={fieldClass} /></label>
        </div>
        <label className="mt-4 block text-[12px] font-extrabold text-[#000181]">Confirm new password<input required type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength={8} className={fieldClass} /></label>
        <button type="submit" disabled={Boolean(busy)} className="mt-4 flex h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#000181] text-[12px] font-bold text-white disabled:opacity-50">{busy === "password" && <LoadingIndicator size={16} />}Update password</button>
        <Link to="/forgot-password" onClick={onClose} className="mt-3 flex justify-center text-[11px] font-extrabold text-[#5556b5] underline decoration-[#aaaadd] underline-offset-4 hover:text-[#000181]">Forgot your current password?</Link>
      </form>

      <div className="mt-6 border-t border-[rgba(0,1,129,0.12)] pt-5"><button type="button" onClick={() => void handleLogout()} disabled={Boolean(busy)} className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-[12px] font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"><LogOut size={16} />{busy === "logout" ? "Logging out…" : "Log out"}</button></div>
    </motion.div>
  </motion.div>;
}
