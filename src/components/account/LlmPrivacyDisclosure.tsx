import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, ArrowLeft, MessageSquareText, ShieldCheck, UserRoundX } from "lucide-react";
import { motion } from "framer-motion";

interface LlmPrivacyDisclosureProps {
  reviewOnly?: boolean;
  purpose?: "chat" | "registration";
  onAcknowledge: () => void;
  onLeave: () => void;
}

export function LlmPrivacyDisclosure({ onAcknowledge, onLeave, reviewOnly = false, purpose = "chat" }: LlmPrivacyDisclosureProps) {
  const [confirmed, setConfirmed] = useState(false);
  const registration = purpose === "registration";
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    // Start at the policy heading instead of scrolling mobile readers to its checkbox.
    dialogRef.current?.focus({ preventScroll: true });
    return () => { if (previousFocus?.isConnected) previousFocus.focus(); };
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape" && (registration || reviewOnly)) {
      event.preventDefault();
      onLeave();
      return;
    }
    if (event.key !== "Tab") return;
    const controls = dialogRef.current?.querySelectorAll<HTMLElement>("input:not(:disabled), button:not(:disabled), a[href]");
    if (!controls?.length) return;
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (document.activeElement === dialogRef.current) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
      return;
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex flex-col overflow-y-auto overscroll-contain bg-[#050515]/55 p-4 backdrop-blur-[4px] touch-pan-y [-webkit-overflow-scrolling:touch] sm:p-6"
    >
      <motion.section
        ref={dialogRef}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 18 }}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="llm-privacy-title"
        aria-describedby="llm-privacy-description"
        className="mx-auto my-auto w-full shrink-0 max-w-[650px] rounded-[28px] border border-white/80 bg-white p-5 text-[#000181] shadow-[0_28px_90px_rgba(0,0,0,0.34)] outline-none sm:p-8"
      >
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px] bg-[#eef0ff]">
            <ShieldCheck size={24} aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[rgba(0,1,129,0.52)]">{registration ? "AI use and privacy" : "Privacy before your first message"}</p>
            <h2 id="llm-privacy-title" className="mt-1 text-[25px] font-black leading-tight tracking-tight sm:text-[30px]">{registration ? "Courseo’s AI Policy" : "What Courseo sends to the AI provider"}</h2>
            <p id="llm-privacy-description" className="mt-2 text-[13px] font-semibold leading-relaxed text-[rgba(0,1,129,0.65)]">{registration ? "Please review how Courseo uses AI before creating your account." : "Please review this before you start chatting."}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          <div className="flex gap-3 rounded-[17px] border border-[rgba(0,1,129,0.12)] bg-[#f7f8ff] p-4">
            <UserRoundX size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
            <div><h3 className="text-[13px] font-extrabold">Stored identifiers are not included</h3><p className="mt-1 text-[12px] font-semibold leading-relaxed text-[rgba(0,1,129,0.65)]">Courseo does not add your stored account or profile identifiers, such as your name, email address, or account ID, to an LLM request.</p></div>
          </div>
          <div className="flex gap-3 rounded-[17px] border border-[rgba(0,1,129,0.12)] bg-[#f7f8ff] p-4">
            <MessageSquareText size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
            <div><h3 className="text-[13px] font-extrabold">Your submitted content is sent</h3><p className="mt-1 text-[12px] font-semibold leading-relaxed text-[rgba(0,1,129,0.65)]">Your message, anything you paste, and the course or handbook context needed to answer it are sent to the selected AI provider.</p></div>
          </div>
          <div className="flex gap-3 rounded-[17px] border border-amber-200 bg-amber-50 p-4 text-amber-950">
            <AlertTriangle size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
            <div><h3 className="text-[13px] font-extrabold">Check your content before sending</h3><p className="mt-1 text-[12px] font-semibold leading-relaxed">Remove personal or sensitive information that you do not want shared with the AI provider.</p></div>
          </div>
        </div>

        {!reviewOnly && <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-[15px] border-2 border-[rgba(0,1,129,0.15)] p-4 text-[12px] font-bold leading-relaxed">
          <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#000181]" />
          <span>I understand what is sent and will review my content before submitting it.</span>
        </label>}

        <div className="mt-5 grid gap-3 sm:grid-cols-[auto_1fr]">
          {!reviewOnly && <button type="button" onClick={onLeave} className="flex h-12 items-center justify-center gap-2 rounded-[15px] border-2 border-[rgba(0,1,129,0.16)] px-5 text-[12px] font-extrabold transition hover:bg-[#f3f4ff]"><ArrowLeft size={16} />{registration ? "Cancel" : "Back to home"}</button>}
          <button type="button" onClick={onAcknowledge} disabled={!reviewOnly && !confirmed} className="h-12 rounded-[15px] bg-[#000181] px-5 text-[12px] font-extrabold text-white transition hover:bg-[#171899] disabled:cursor-not-allowed disabled:opacity-40">{reviewOnly ? "Close warning" : registration ? "Agree and continue" : "I understand — continue to chat"}</button>
        </div>
      </motion.section>
    </motion.div>, document.body
  );
}
