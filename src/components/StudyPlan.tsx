import { useState } from "react";
import { Search, PenLine, BookOpen, ChevronRight, Settings, HelpCircle, User, LayoutDashboard, MessageSquare } from "lucide-react";
import imgLogo from "../assets/courseo-logo.png";
import { motion } from "framer-motion";
import SubjectCard from "./subject-card";
import type { StudyPlanResponse } from "../types/studyPlanType";


interface studyPlanProps {
  collapsed?: boolean;
  onToggle?: () => void;
  studyPlanInput: StudyPlanResponse | null;
}

export function StudyPlan({
  collapsed = false,
  onToggle,
  studyPlanInput = null,
}: studyPlanProps) {

  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? 48 : 300 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative bg-white rounded-[30px] shadow-[2px_2px_10px_3px_rgba(0,0,0,0.1)] h-full flex flex-col overflow-hidden shrink-0"
    >
      <div className="flex items-center justify-between px-3 pt-5 pb-3 shrink-0">
        <div></div>
        <div className="flex items-center gap-2">
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-extrabold text-center text-4xl text-[#000181] tracking-tight whitespace-nowrap"
            >
              Study Plan
            </motion.span>
          )}
        </div>
        <button
          onClick={onToggle}
          className="rounded-lg hover:bg-gray-100 transition-colors text-[#000181]"
          title="Toggle sidebar"
        >
          <LayoutDashboard size={20} />
        </button>
      </div>

      <div className="mx-4 border-t-2 border-[#000181] mb-6" />

      {!collapsed && (
        <div className="flex-1 overflow-y-auto min-h-0 px-4">
          {studyPlanInput ? ( studyPlanInput.plan.map((years) => (
              <div key={years.year}>
              <p className="font-extrabold text-center text-3xl text-[#000181] tracking-tight whitespace-nowrap pb-2">{years.year}</p>
              <div className='pb-5'>
                {years.sessions.map((sessions) => (
                  <div className='pb-5' key={`${years.year}-${sessions.session}`} >
                    <div className={`border-3 rounded-3xl ${sessions.session === "Autumn" ? "border-[rgba(131,231,255,1)]" : "border-[rgba(232,160,255,1)]"} 
                                  p-2 pb-5 ${sessions.session === "Autumn" ? "shadow-[0_0_30px_-5px_rgba(131,231,255,1)]" : "shadow-[0_0_30px_-5px_rgba(232,160,255,1)]"}`}>
                      <p className="font-extrabold text-center text-xl text-[#000181] tracking-tight whitespace-nowrap p-2">{sessions.session}</p>
                      <div className='grid grid-cols-2 gap-2'>
                        {sessions.subjects.map((subject, index) => (
                          <div key={index}>
                            <SubjectCard code={subject.code} title={subject.name} cp={subject.cp} color={`${sessions.session === "Autumn" ? "rgba(131,231,255,0.65)" : "rgba(232,160,255,0.65)"}`} year={years.year} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-200 rounded-3xl p-4 text-center">
              <p className="text-[#000181] font-semibold text-sm">No plan generated yet</p>
              <p className="text-gray-400 text-xs mt-1">Enter your enrolment details to generate a study plan specifically for you!</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
