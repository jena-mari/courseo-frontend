import { BookOpen, CalendarDays, PanelRightClose, PanelRightOpen } from "lucide-react";
import { motion } from "framer-motion";
import SubjectCard from "./subject-card";
import type { StudyPlanResponse } from "../types/studyPlanType";
import { PDFDownloadLink } from "@react-pdf/renderer";
import MyDocument from "../functions/pdf";


interface studyPlanProps {
  collapsed?: boolean;
  onToggle?: () => void;
  studyPlanInput: StudyPlanResponse | null;
  expandedWidth?: number | string;
}

export function StudyPlan({
  collapsed = false,
  onToggle,
  studyPlanInput = null,
  expandedWidth = "clamp(270px, 24vw, 300px)",
}: studyPlanProps) {

  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? 56 : expandedWidth }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative h-full shrink-0 overflow-hidden rounded-[30px] border border-white/80 bg-white/95 shadow-[0_10px_35px_rgba(0,1,129,0.10)] backdrop-blur-xl flex flex-col"
    >
      <div className={`flex items-center pt-4 pb-3 shrink-0 ${
        collapsed ? "justify-center px-2" : "justify-between px-4"
      }`}>
        <div className="flex min-w-0 items-center justify-start gap-2.5">
          {!collapsed && (
            <>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[rgba(131,231,255,0.35)] text-[#000181]">
                <BookOpen size={18} strokeWidth={2.3} />
              </span>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0 text-left">
                <span className="block whitespace-nowrap text-[19px] font-extrabold tracking-[-0.5px] text-[#000181]">Study Plan</span>
                <span className="block text-[10px] font-bold text-[rgba(0,1,129,0.45)]">Your course roadmap</span>
              </motion.div>
            </>
          )}
        </div>
        <button
          onClick={onToggle}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-[#000181] shrink-0"
          title={collapsed ? "Expand study plan" : "Collapse study plan"}
          aria-label={collapsed ? "Expand study plan" : "Collapse study plan"}
          aria-expanded={!collapsed}
        >
          {collapsed ? <PanelRightOpen size={20} /> : <PanelRightClose size={20} />}
        </button>
      </div>

      <div className="mx-4 mb-4 border-t border-[rgba(0,1,129,0.10)]" />

      {!collapsed && (
        <div className="flex-1 overflow-y-auto min-h-0 px-4 pb-4">
          {studyPlanInput ? ( studyPlanInput.plan.map((years) => (
              <section key={years.year} className="mb-6">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-[22px] font-extrabold tracking-[-0.7px] text-[#000181]">{years.year}</span>
                <span className="h-px flex-1 bg-[rgba(0,1,129,0.10)]" />
              </div>
              <div className="space-y-3">
                {years.sessions.map((sessions) => (
                  <div key={`${years.year}-${sessions.session}`} className="rounded-[20px] border border-[rgba(0,1,129,0.08)] bg-[#f8f9ff] p-3 shadow-[0_2px_10px_rgba(0,1,129,0.05)]">
                      <div className="mb-3 flex items-center gap-2 px-1">
                        <CalendarDays size={14} className={sessions.session === "Autumn" ? "text-[#1ca8c6]" : "text-[#b14bd3]"} />
                        <p className="text-[13px] font-extrabold text-[#000181]">{sessions.session}</p>
                        <span className={`ml-auto h-2 w-2 rounded-full ${sessions.session === "Autumn" ? "bg-[#83e7ff]" : "bg-[#e8a0ff]"}`} />
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {sessions.subjects.map((subject, index) => (
                          <div key={index}>
                            <SubjectCard code={subject.code} title={subject.name} cp={subject.cp} color={`${sessions.session === "Autumn" ? "rgba(131,231,255,0.65)" : "rgba(232,160,255,0.65)"}`} year={years.year} />
                          </div>
                        ))}
                      </div>
                  </div>
                ))}
              </div>
              </section>
            ))
          ) : (
            <div className="flex h-48 flex-col items-center justify-center rounded-[22px] border border-dashed border-[rgba(0,1,129,0.16)] bg-[#fafbff] p-5 text-center">
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(131,231,255,0.28)]"><BookOpen size={18} className="text-[#000181]" /></span>
              <p className="text-[#000181] font-semibold text-sm">No plan generated yet</p>
              <p className="text-gray-400 text-xs mt-1">Enter your enrolment details to generate a study plan specifically for you!</p>
            </div>
          )}
        </div>
      )}

    </motion.div>
  );
}
