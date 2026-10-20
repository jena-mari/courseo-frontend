import { motion } from "framer-motion";
import { BookOpen, ExternalLink, ShieldCheck, X } from "lucide-react";
import { GENERAL_HANDBOOK_URL } from "../../lib/handbookLinks";

export function HandbookModal({ onClose }: { onClose: () => void }) {
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex flex-col overflow-y-auto overscroll-contain bg-black/35 p-4 touch-pan-y [-webkit-overflow-scrolling:touch] sm:p-6" onClick={onClose} role="presentation">
    <motion.div initial={{ scale: 0.92, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.92, y: 20, opacity: 0 }} transition={{ type: "spring", stiffness: 280, damping: 28 }} className="relative mx-auto my-auto w-full shrink-0 max-w-2xl rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_28px_80px_rgba(0,0,0,0.32)] sm:rounded-[32px] sm:p-9" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="handbook-dialog-title">
      <button type="button" onClick={onClose} className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full text-[#000181] hover:bg-[#f1f3ff]" aria-label="Close course handbook"><X size={21} /></button>

      <div className="flex items-center gap-3 pr-12">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(131,231,255,0.45)] text-[#000181]"><BookOpen size={21} /></span>
        <div><h2 id="handbook-dialog-title" className="text-2xl font-extrabold tracking-tight text-[#000181]">Course handbook</h2><p className="mt-1 text-[13px] font-semibold text-[rgba(0,1,129,0.6)]">Browse the official UOW School of Computing and Information Technology handbook.</p></div>
      </div>

      <div className="mt-6 rounded-[20px] bg-[rgba(131,231,255,0.16)] p-4 sm:p-5">
        <p className="text-[13px] font-semibold leading-relaxed text-[#000181]">Choose your course on the handbook page, then check the handbook year, campus, and major that apply to your studies.</p>
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-[16px] border border-[#b9c6ff] bg-[#f2f5ff] px-4 py-3 text-[#000181]">
        <ShieldCheck size={18} className="mt-0.5 shrink-0" />
        <p className="text-[12px] font-semibold leading-relaxed">Course requirements and dates can change. Verify your final study plan against the official UOW handbook before changing your enrolment.</p>
      </div>

      <a href={GENERAL_HANDBOOK_URL} target="_blank" rel="noopener noreferrer" className="mt-5 flex h-[50px] w-full items-center justify-center gap-2 rounded-[17px] bg-[#000181] text-[13px] font-extrabold text-white">Open the official UOW handbook <ExternalLink size={16} /></a>
    </motion.div>
  </motion.div>;
}
