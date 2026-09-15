import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { BookOpen, CalendarDays, ExternalLink, GraduationCap, MapPin, ShieldCheck, X } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

function Detail({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="flex items-start gap-3 rounded-[15px] border border-[rgba(0,1,129,0.1)] bg-white px-4 py-3">
    <span className="mt-0.5 text-[#000181]">{icon}</span>
    <div><p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[rgba(0,1,129,0.48)]">{label}</p><p className="mt-1 text-[13px] font-extrabold text-[#000181]">{value}</p></div>
  </div>;
}

export function HandbookModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const handbookYear = user?.commencementYear ?? new Date().getFullYear();
  const handbookUrl = `https://courses.uow.edu.au/courses/${handbookYear}/766`;

  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex flex-col overflow-y-auto overscroll-contain bg-black/35 p-4 touch-pan-y [-webkit-overflow-scrolling:touch] sm:p-6" onClick={onClose} role="presentation">
    <motion.div initial={{ scale: 0.92, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.92, y: 20, opacity: 0 }} transition={{ type: "spring", stiffness: 280, damping: 28 }} className="relative mx-auto my-auto w-full max-w-2xl rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_28px_80px_rgba(0,0,0,0.32)] sm:rounded-[32px] sm:p-9" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="handbook-dialog-title">
      <button type="button" onClick={onClose} className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full text-[#000181] hover:bg-[#f1f3ff]" aria-label="Close course handbook"><X size={21} /></button>

      <div className="flex items-center gap-3 pr-12">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(131,231,255,0.45)] text-[#000181]"><BookOpen size={21} /></span>
        <div><h2 id="handbook-dialog-title" className="text-2xl font-extrabold tracking-tight text-[#000181]">Course handbook</h2><p className="mt-1 text-[13px] font-semibold text-[rgba(0,1,129,0.6)]">The official rules Courseo uses when checking your plan.</p></div>
      </div>

      <div className="mt-6 rounded-[20px] bg-[rgba(131,231,255,0.16)] p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <Detail icon={<GraduationCap size={17} />} label="Course" value="766 — Bachelor of Computer Science" />
          <Detail icon={<CalendarDays size={17} />} label="Handbook year" value={String(handbookYear)} />
          <Detail icon={<MapPin size={17} />} label="Campus" value={user?.campus ?? "Confirm in your profile"} />
          <Detail icon={<BookOpen size={17} />} label="Major" value={user?.major ?? "No major selected"} />
        </div>
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-[16px] border border-[#b9c6ff] bg-[#f2f5ff] px-4 py-3 text-[#000181]">
        <ShieldCheck size={18} className="mt-0.5 shrink-0" />
        <p className="text-[12px] font-semibold leading-relaxed">Course requirements and dates can change. Courseo checks handbook data when giving advice, and the official UOW page remains the source of truth.</p>
      </div>

      <a href={handbookUrl} target="_blank" rel="noopener noreferrer" className="mt-5 flex h-[50px] w-full items-center justify-center gap-2 rounded-[17px] bg-[#000181] text-[13px] font-extrabold text-white">Open the official UOW handbook <ExternalLink size={16} /></a>
    </motion.div>
  </motion.div>;
}
