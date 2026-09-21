import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, KeyRound, LoaderCircle, LogOut, User, X } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { changePassword } from "../lib/authApi";
import { clearCourseoStorage, STORAGE_KEYS } from "../lib/storageKeys";

export function AccountManagement({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();
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
      clearCourseoStorage();
      navigate("/login");
    } catch {
      setBusy("");
      showMessage("Unable to log out. Please try again.");
    }
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
        degree_code: "766",
        commencement_year: user.commencementYear ?? new Date().getFullYear(),
        campus: user.campus ?? "Wollongong",
        major: user.major,
        elective_interests: user.electiveInterests ?? [],
        ...(emailChanged ? { current_password: profilePassword } : {}),
      });
      localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify({
        displayName: saved.displayName,
        email: saved.email,
        degreeCode: saved.degreeCode,
        degree: "Bachelor of Computer Science",
        commencementYear: saved.commencementYear,
        campus: saved.campus,
        major: saved.major,
        interests: saved.electiveInterests,
      }));
      setProfilePassword("");
      showMessage("Account details updated.", true);
    } catch (cause) {
      showMessage(cause instanceof Error ? cause.message : "Could not update your account.");
    } finally {
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

  const fieldClass = "mt-2 h-[48px] w-full rounded-[16px] border-2 border-[rgba(0,1,129,0.28)] px-4 text-[14px] font-semibold text-[#000181] outline-none focus:border-[#000181]";

  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex flex-col overflow-y-auto overscroll-contain bg-black/35 p-4 touch-pan-y [-webkit-overflow-scrolling:touch] sm:p-6" onClick={onClose} role="presentation">
    <motion.div initial={{ scale: 0.92, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.92, y: 20, opacity: 0 }} transition={{ type: "spring", stiffness: 280, damping: 28 }} className="relative mx-auto my-auto w-full max-w-[640px] rounded-[28px] border border-white/70 bg-white px-6 py-7 shadow-[0_28px_80px_rgba(0,0,0,0.32)] sm:rounded-[32px] sm:px-10 sm:py-9" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="account-dialog-title">
      <button type="button" onClick={onClose} className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full text-[#000181] hover:bg-[#f1f3ff]" aria-label="Close account settings"><X size={21} /></button>
      <div className="mb-6 flex items-center gap-3 pr-12"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(131,231,255,0.45)] text-[#000181]"><User size={21} /></span><div><h2 id="account-dialog-title" className="text-2xl font-extrabold tracking-tight text-[#000181]">Your account</h2><p className="mt-1 text-[13px] font-semibold text-[rgba(0,1,129,0.6)]">Manage the account connected to Courseo.</p></div></div>

      {message && <p role={isSuccess ? "status" : "alert"} className={`mb-5 flex items-center gap-2 rounded-[14px] px-4 py-3 text-[12px] font-semibold ${isSuccess ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>{isSuccess && <CheckCircle2 size={16} />}{message}</p>}

      <form onSubmit={(event) => void saveProfile(event)} className="rounded-[20px] border border-[rgba(0,1,129,0.14)] p-5">
        <h3 className="flex items-center gap-2 text-[14px] font-extrabold text-[#000181]"><User size={16} /> Profile details</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-[12px] font-extrabold text-[#000181]">Preferred name<input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" className={fieldClass} /></label>
          <label className="text-[12px] font-extrabold text-[#000181]">Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className={fieldClass} /></label>
        </div>
        {emailChanged && <label className="mt-4 block text-[12px] font-extrabold text-[#000181]">Current password<input type="password" value={profilePassword} onChange={(event) => setProfilePassword(event.target.value)} autoComplete="current-password" placeholder="Required to change email" className={fieldClass} /></label>}
        <button type="submit" disabled={Boolean(busy)} className="mt-4 flex h-[46px] w-full items-center justify-center gap-2 rounded-[15px] bg-[#000181] text-[12px] font-extrabold text-white disabled:opacity-50">{busy === "profile" && <LoaderCircle size={16} className="animate-spin" />}Save account details</button>
      </form>

      <form onSubmit={(event) => void savePassword(event)} className="mt-5 rounded-[20px] border border-[rgba(0,1,129,0.14)] p-5">
        <h3 className="flex items-center gap-2 text-[14px] font-extrabold text-[#000181]"><KeyRound size={16} /> Manage password</h3>
        <p className="mt-1 text-[11px] font-semibold leading-relaxed text-[rgba(0,1,129,0.55)]">Update your password here, or request a recovery link if you cannot remember the current one.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-[12px] font-extrabold text-[#000181]">Current password<input required type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" className={fieldClass} /></label>
          <label className="text-[12px] font-extrabold text-[#000181]">New password<input required type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" minLength={8} className={fieldClass} /></label>
        </div>
        <label className="mt-4 block text-[12px] font-extrabold text-[#000181]">Confirm new password<input required type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength={8} className={fieldClass} /></label>
        <button type="submit" disabled={Boolean(busy)} className="mt-4 flex h-[46px] w-full items-center justify-center gap-2 rounded-[15px] border-2 border-[#000181] text-[12px] font-extrabold text-[#000181] disabled:opacity-50">{busy === "password" && <LoaderCircle size={16} className="animate-spin" />}Update password</button>
        <Link to="/forgot-password" onClick={onClose} className="mt-3 flex justify-center text-[11px] font-extrabold text-[#5556b5] underline decoration-[#aaaadd] underline-offset-4 hover:text-[#000181]">Forgot your current password?</Link>
      </form>

      <div className="mt-6 border-t border-[rgba(0,1,129,0.12)] pt-5"><button type="button" onClick={() => void handleLogout()} disabled={Boolean(busy)} className="flex w-full items-center justify-center gap-2 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-extrabold text-red-700 hover:bg-red-100 disabled:opacity-50"><LogOut size={16} />{busy === "logout" ? "Logging out…" : "Log out"}</button></div>
    </motion.div>
  </motion.div>;
}
