import { motion } from "framer-motion";
import {
  BookOpen, X
} from "lucide-react";


export function HandbookModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        className="bg-white rounded-[40px] shadow-xl w-full max-w-2xl p-8 relative max-h-[80vh] overflow-y-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-[#000181] transition-colors"
        >
          <X size={18} strokeWidth={3} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-[rgba(131,231,255,0.5)] rounded-xl flex items-center justify-center">
            <BookOpen size={20} className="text-[#000181]" />
          </div>
          <h2 className="font-extrabold text-2xl text-[#000181] tracking-tight">
            Your Handbook
          </h2>
        </div>

        <div className="space-y-4 text-[14px] text-[#000181]">
          <div className="bg-[rgba(131,231,255,0.2)] rounded-2xl p-4">
            <p className="font-bold mb-1">📋 Degree: Bachelor of Computer Science</p>
            <p className="font-semibold opacity-70">Year 2 · 40 Credit Points completed</p>
          </div>
          <div>
            <p className="font-black mb-2 text-[15px]">Key Policies</p>
            <ul className="space-y-1.5 font-semibold opacity-80">
              <li>• Standard load: 4 subjects (20 CP) per semester</li>
              <li>• Maximum load: 5 subjects with approval (GPA ≥ 5.0)</li>
              <li>• Late penalty: 5% per day</li>
              <li>• Minimum pass mark: 50% per subject</li>
              <li>• Total required: 240 CP to graduate</li>
            </ul>
          </div>
          <div>
            <p className="font-black mb-2 text-[15px]">Important Dates</p>
            <ul className="space-y-1.5 font-semibold opacity-80">
              <li>• Enrolment opens: 28 Feb 2026</li>
              <li>• Autumn session starts: 2 Mar 2026</li>
              <li>• Census date: 31 Mar 2026</li>
              <li>• Final exams: 20 Jun – 4 Jul 2026</li>
            </ul>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="mt-5 w-full bg-[rgba(131,231,255,0.5)] border-2 border-[#000181] rounded-[20px] h-11 font-bold text-[14px] text-[#000181]"
        >
          Got it
        </motion.button>
      </motion.div>
    </motion.div>
  );
}