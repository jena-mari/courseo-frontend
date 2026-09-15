import { AlertTriangle, ArrowRight, KeyRound, X } from "lucide-react";
import { motion } from "framer-motion";

interface ApiKeyStatusNoticeProps {
  title?: string;
  message: string;
  onAction: () => void;
  onDismiss?: () => void;
}

export function ApiKeyStatusNotice({
  title = "Your API key needs attention",
  message,
  onAction,
  onDismiss,
}: ApiKeyStatusNoticeProps) {
  return (
    <motion.aside
      initial={{ opacity: 0, y: -18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 340, damping: 28 }}
      role="alert"
      aria-live="assertive"
      className="fixed left-4 right-4 top-4 z-[90] mx-auto w-auto max-w-[520px] rounded-[20px] border border-amber-300 bg-white p-4 text-[#000181] shadow-[0_18px_55px_rgba(0,0,40,0.24)] sm:left-auto sm:right-6 sm:top-6 sm:w-[430px]"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-amber-100 text-amber-800">
          <AlertTriangle size={20} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div><p className="text-[13px] font-black">{title}</p><p className="mt-1 text-[11px] font-semibold leading-relaxed text-[rgba(0,1,129,0.65)]">{message}</p></div>
            {onDismiss && <button type="button" onClick={onDismiss} className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[rgba(0,1,129,0.55)] transition hover:bg-[#f3f4ff]" aria-label="Dismiss notification"><X size={16} /></button>}
          </div>
          <button type="button" onClick={onAction} className="mt-3 inline-flex h-10 items-center gap-2 rounded-[12px] bg-[#000181] px-4 text-[11px] font-extrabold text-white transition hover:bg-[#171899]"><KeyRound size={14} /> Review API key <ArrowRight size={14} /></button>
        </div>
      </div>
    </motion.aside>
  );
}
