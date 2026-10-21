import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { LoadingIndicator } from "../ui/LoadingIndicator";

export function DeleteAccountDialog({ onClose }: { onClose: () => void }) {
  const { deleteAccount, user } = useAuth();
  const isGuest = user?.isGuest === true;
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const previousFocus = useRef(document.activeElement as HTMLElement | null);
  useEffect(() => () => previousFocus.current?.focus(), []);

  const handleKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      cancel();
    }
    if (event.key !== "Tab") return;
    const controls = event.currentTarget.querySelectorAll<HTMLElement>("input:not(:disabled), button:not(:disabled)");
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (!first) { event.preventDefault(); return; }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const cancel = () => {
    if (submitting.current) return;
    setPassword("");
    onClose();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting.current || (!isGuest && !password)) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      await deleteAccount(password);
      setPassword("");
      navigate("/login", { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Courseo could not delete your account. Please try again.");
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };

  return createPortal(
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-black/45 p-4" onClick={cancel} role="presentation">
      <form onSubmit={(event) => void submit(event)} onClick={(event) => event.stopPropagation()} onKeyDown={handleKeyDown} role="alertdialog" aria-modal="true" aria-labelledby="delete-account-title" aria-describedby="delete-account-description" aria-busy={busy} className="mx-auto my-auto w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-red-50 text-red-700"><AlertTriangle size={21} /></span>
          <div><h2 id="delete-account-title" className="text-[18px] font-black text-[#000181]">{isGuest ? "Delete guest workspace?" : "Delete your account?"}</h2><p id="delete-account-description" className="mt-2 text-[12px] font-semibold leading-relaxed text-[#000181]/60">Deletion permanently removes your account, chat history, saved plans, and stored API keys. This cannot be undone.{isGuest ? "" : " Enter your current password to confirm."}</p></div>
        </div>
        {!isGuest && <label className="mt-4 block text-[12px] font-bold text-[#000181]">Current password<input autoFocus required type="password" autoComplete="current-password" value={password} disabled={busy} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[#d9daea] bg-[#fafaff] px-3 text-[14px] text-[#000181] outline-none focus:border-[#000181] focus:ring-2 focus:ring-[#000181]/10" /></label>}
        {error && <p role="alert" className="mt-3 rounded-[14px] bg-red-50 px-4 py-3 text-[12px] font-semibold text-red-700">{error}</p>}
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={cancel} disabled={busy} className="h-12 flex-1 rounded-[15px] border border-[#000181]/20 text-[12px] font-extrabold text-[#000181] disabled:opacity-50">Cancel</button>
          <button type="submit" disabled={busy || (!isGuest && !password)} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[15px] bg-red-700 text-[12px] font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50">{busy && <LoadingIndicator size={15} />}{busy ? "Deleting…" : isGuest ? "Delete guest workspace" : "Permanently delete account"}</button>
        </div>
      </form>
    </motion.div>, document.body
  );
}
