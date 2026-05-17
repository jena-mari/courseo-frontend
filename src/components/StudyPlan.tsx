import { useState } from "react";
import { Search, PenLine, BookOpen, ChevronRight, Settings, HelpCircle, User, LayoutDashboard, MessageSquare } from "lucide-react";
import imgLogo from "../assets/courseo-logo.png";
import { motion } from "framer-motion";
import SubjectCard from "./subject-card";


interface studyPlanProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function StudyPlan({
  collapsed = false,
  onToggle,
}: studyPlanProps) {

  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? 48 : 320 }}
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
            <p className="font-extrabold text-center text-3xl text-[#000181] tracking-tight whitespace-nowrap pb-2">2024</p>
            <div className='pb-5'>
              <div className="border-3 rounded-3xl border-[rgba(131,231,255,1)] p-2 shadow-[0_0_30px_-5px_rgba(131,231,255,1)]">
                <p className="font-extrabold text-center text-xl text-[#000181] tracking-tight whitespace-nowrap p-2">Autumn</p>
                <div className='grid grid-cols-2 gap-2'>
                  <SubjectCard code='CSIT123' title='Computing and Cyber Security Fundamentals' cp={6} color='rgba(131,231,255,0.65)' />
                  <SubjectCard code='CSIT123' title='Computing and Cyber Security Fundamentals' cp={6} color='rgba(131,231,255,0.65)' />
                  <SubjectCard code='CSIT123' title='Computing and Cyber Security Fundamentals' cp={6} color='rgba(131,231,255,0.65)' />
                  <SubjectCard code='CSIT123' title='Computing and Cyber Security Fundamentals' cp={6} color='rgba(131,231,255,0.65)' />
                </div>
              </div>
            </div>

            <div className='pb-5'>
              <div className="border-3 rounded-3xl border-[rgba(232,160,255,1)] p-2 shadow-[0_0_30px_-5px_rgba(232,160,255,1)]">
                <p className="font-extrabold text-center text-xl text-[#000181] tracking-tight whitespace-nowrap p-2">Spring</p>
                <div className='grid grid-cols-2 gap-2'>
                  <SubjectCard code='CSIT123' title='Computing and Cyber Security Fundamentals' cp={6} color='rgba(232,160,255,0.65)' />
                  <SubjectCard code='CSIT123' title='Computing and Cyber Security Fundamentals' cp={6} color='rgba(232,160,255,0.65)' />
                  <SubjectCard code='CSIT123' title='Computing and Cyber Security Fundamentals' cp={6} color='rgba(232,160,255,0.65)' />
                  <SubjectCard code='CSIT123' title='Computing and Cyber Security Fundamentals' cp={6} color='rgba(232,160,255,0.65)' />
                </div>    
              </div>
            </div>

            <p className="font-extrabold text-center text-3xl text-[#000181] tracking-tight whitespace-nowrap pb-2">2025</p>
            <div className='pb-5'>
              <div className="border-3 rounded-3xl border-[rgba(131,231,255,1)] p-2 shadow-[0_0_30px_-5px_rgba(131,231,255,1)]">
                <p className="font-extrabold text-center text-xl text-[#000181] tracking-tight whitespace-nowrap p-2">Autumn</p>
                <div className='grid grid-cols-2 gap-2'>
                  <SubjectCard code='CSIT123' title='Computing and Cyber Security Fundamentals' cp={6} color='rgba(131,231,255,0.65)' />
                  <SubjectCard code='CSIT123' title='Computing and Cyber Security Fundamentals' cp={6} color='rgba(131,231,255,0.65)' />
                  <SubjectCard code='CSIT123' title='Computing and Cyber Security Fundamentals' cp={6} color='rgba(131,231,255,0.65)' />
                  <SubjectCard code='CSIT123' title='Computing and Cyber Security Fundamentals' cp={6} color='rgba(131,231,255,0.65)' />
                </div>
              </div>
            </div>

            <div className='pb-5'>
              <div className="border-3 rounded-3xl border-[rgba(232,160,255,1)] p-2 shadow-[0_0_30px_-5px_rgba(232,160,255,1)]">
                <p className="font-extrabold text-center text-xl text-[#000181] tracking-tight whitespace-nowrap p-2">Spring</p>
                <div className='grid grid-cols-2 gap-2'>
                  <SubjectCard code='CSIT123' title='Computing and Cyber Security Fundamentals' cp={6} color='rgba(232,160,255,0.65)' />
                  <SubjectCard code='CSIT123' title='Computing and Cyber Security Fundamentals' cp={6} color='rgba(232,160,255,0.65)' />
                  <SubjectCard code='CSIT123' title='Computing and Cyber Security Fundamentals' cp={6} color='rgba(232,160,255,0.65)' />
                  <SubjectCard code='CSIT123' title='Computing and Cyber Security Fundamentals' cp={6} color='rgba(232,160,255,0.65)' />
                </div>    
              </div>
            </div>

            <p className="font-extrabold text-center text-3xl text-[#000181] tracking-tight whitespace-nowrap pb-2">2026</p>
            <div className='pb-5'>
              <div className="border-3 rounded-3xl border-[rgba(131,231,255,1)] p-2 shadow-[0_0_30px_-5px_rgba(131,231,255,1)]">
                <p className="font-extrabold text-center text-xl text-[#000181] tracking-tight whitespace-nowrap p-2">Autumn</p>
                <div className='grid grid-cols-2 gap-2'>
                  <SubjectCard code='CSIT123' title='Computing and Cyber Security Fundamentals' cp={6} color='rgba(131,231,255,0.65)' />
                  <SubjectCard code='CSIT123' title='Computing and Cyber Security Fundamentals' cp={6} color='rgba(131,231,255,0.65)' />
                  <SubjectCard code='CSIT123' title='Computing and Cyber Security Fundamentals' cp={6} color='rgba(131,231,255,0.65)' />
                  <SubjectCard code='CSIT123' title='Computing and Cyber Security Fundamentals' cp={6} color='rgba(131,231,255,0.65)' />
                </div>
              </div>
            </div>

            <div className='pb-5'>
              <div className="border-3 rounded-3xl border-[rgba(232,160,255,1)] p-2 shadow-[0_0_30px_-5px_rgba(232,160,255,1)]">
                <p className="font-extrabold text-center text-xl text-[#000181] tracking-tight whitespace-nowrap p-2">Spring</p>
                <div className='grid grid-cols-2 gap-2'>
                  <SubjectCard code='CSIT123' title='Computing and Cyber Security Fundamentals' cp={6} color='rgba(232,160,255,0.65)' />
                  <SubjectCard code='CSIT123' title='Computing and Cyber Security Fundamentals' cp={6} color='rgba(232,160,255,0.65)' />
                  <SubjectCard code='CSIT123' title='Computing and Cyber Security Fundamentals' cp={6} color='rgba(232,160,255,0.65)' />
                  <SubjectCard code='CSIT123' title='Computing and Cyber Security Fundamentals' cp={6} color='rgba(232,160,255,0.65)' />
                </div>    
              </div>
            </div>

        </div>
      )}

      

      
    </motion.div>
  );
}
