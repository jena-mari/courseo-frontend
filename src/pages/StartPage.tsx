import { useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, PenLine, BookOpen, Settings, HelpCircle,
  MoreVertical, Plus, ArrowRight, X
} from "lucide-react";
import imgBg from "../assets/courseo-bg.png";
import imgLogo from "../assets/courseo-logo.png";

// Static preview of sidebar behind the modal
function SidebarPreview() {
  return (
    <div className="bg-white rounded-[30px] shadow-[2px_2px_10px_3px_rgba(0,0,0,0.1)] w-[240px] h-[700px] shrink-0 flex flex-col p-5 overflow-hidden">
      <div className="flex items-center gap-3 mb-5">
        <img src={imgLogo} alt="Courseo" className="w-9 h-9 object-contain" />
      </div>

      <div className="border-2 border-[rgba(0,1,129,0.5)] rounded-[15px] h-8 flex items-center px-3 gap-2 mb-2">
        <Search size={10} className="text-[rgba(0,1,129,0.5)]" />
        <span className="text-[10px] font-extrabold text-[rgba(0,1,129,0.5)]">Search Chat</span>
      </div>
      <div className="bg-[rgba(131,231,255,0.5)] rounded-[15px] h-8 flex items-center px-3 gap-2 mb-2">
        <PenLine size={10} className="text-[#000181]" />
        <span className="text-[10px] font-extrabold text-[#000181]">Create Chat</span>
      </div>
      <div className="bg-[rgba(131,231,255,0.5)] rounded-[15px] h-8 flex items-center px-3 gap-2 mb-3">
        <BookOpen size={10} className="text-[#000181]" />
        <span className="text-[10px] font-extrabold text-[#000181]">Your Handbook</span>
      </div>

      <div className="border-t border-[#000181] mb-3" />
      <p className="text-[10px] font-black text-[#000181] mb-2">Previous Chats</p>
      <div className="space-y-1.5">
        <p className="text-[9px] font-semibold text-[#000181] px-2">Previous Chat #1</p>
        <div className="bg-[rgba(232,160,255,0.5)] rounded-[15px] px-2 py-1">
          <p className="text-[9px] font-semibold text-[#000181]">Previous Chat #2</p>
        </div>
        <p className="text-[9px] font-semibold text-[#000181] px-2">Previous Chat #3</p>
      </div>

      <div className="border-t border-[#000181] my-3" />
      <p className="text-[10px] font-black text-[#000181] mb-2">Settings &amp; Help</p>
      <div className="space-y-1">
        <div className="flex items-center gap-2 px-2">
          <Settings size={9} className="text-[#000181]" />
          <span className="text-[9px] font-semibold text-[#000181]">Settings</span>
        </div>
        <div className="flex items-center gap-2 px-2">
          <HelpCircle size={9} className="text-[#000181]" />
          <span className="text-[9px] font-semibold text-[#000181]">Help</span>
        </div>
      </div>

      <div className="mt-auto text-center pt-4">
        <p className="font-extrabold text-xl text-[#000181] tracking-tight">Courseo</p>
      </div>
    </div>
  );
}

// Static preview of main chat area behind the modal
function ChatPreview() {
  const suggestedPrompts = [
    '"What subjects should I take in the Autumn session this year?"',
    '"What should I study if I want to study game development?"',
    '"Am I allowed to take five subjects this semester?"',
  ];

  return (
    <div className="flex-1 bg-white rounded-[30px] shadow-[2px_2px_10px_3px_rgba(0,0,0,0.1)] h-[700px] flex flex-col p-7 overflow-hidden">
      <div className="flex items-center justify-between mb-auto">
        <p className="font-extrabold text-2xl text-[#000181] tracking-tight">Courseo</p>
        <MoreVertical size={22} className="text-[#000181]" />
      </div>

      <div className="flex items-center justify-center flex-1">
        <h1 className="font-extrabold text-[clamp(48px,6vw,80px)] text-[#000181] text-center tracking-[-3px] leading-none">
          How can I help?
        </h1>
      </div>

      <div className="space-y-2 mb-4">
        {suggestedPrompts.map((p, i) => (
          <div
            key={i}
            className="bg-[rgba(131,231,255,0.5)] rounded-[15px] px-4 py-2.5"
          >
            <p className="text-[12px] font-extrabold text-[rgba(0,1,129,0.6)]">{p}</p>
          </div>
        ))}
      </div>

      <div className="border border-[#0032fc] rounded-[20px] shadow-[2px_2px_10px_3px_rgba(0,1,129,0.1)] p-4 flex items-center gap-3">
        <Plus size={22} className="text-[#000181] shrink-0" />
        <p className="flex-1 text-xl font-semibold text-[rgba(0,1,129,0.6)]">Start typing...</p>
        <div className="w-7 h-7 rounded-full bg-[#000181] flex items-center justify-center shrink-0">
          <ArrowRight size={14} className="text-white" />
        </div>
      </div>
    </div>
  );
}

// The "Get Started with Courseo" modal
function GetStartedModal({ onClose }: { onClose: () => void }) {
  const [enrollment, setEnrollment] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (enrollment.trim()) {
      localStorage.setItem("courseoEnrollment", enrollment.trim());
      navigate("/chat");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 20 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className="bg-white rounded-[50px] shadow-[2px_2px_10px_3px_rgba(0,0,0,0.1)] w-full max-w-[700px] p-10 relative"
    >
      {/* Logo top-left */}
      <div className="absolute top-8 left-8">
        <img src={imgLogo} alt="Courseo" className="w-14 h-14 object-contain" />
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center text-[#000181] hover:bg-gray-100 rounded-full transition-colors"
      >
        <X size={22} strokeWidth={3} />
      </button>

      {/* Heading */}
      <div className="text-center mt-8 mb-6">
        <h1 className="font-extrabold text-[clamp(48px,6vw,72px)] text-[#000181] tracking-[-2.5px] leading-[1.05]">
          Get Started<br />with Courseo
        </h1>
      </div>

      {/* Subtext */}
      <p className="text-center text-[15px] font-semibold text-[#000181] mb-6 px-4">
        Copy and paste your enrolment record below to start chatting with our AI assistant.
        For a guide on how to do this,{" "}
        <button className="text-[#0032fc] underline font-extrabold hover:opacity-80 transition-opacity">
          click here.
        </button>
      </p>

      {/* Input */}
      <div className="border border-[#0032fc] rounded-[30px] shadow-[2px_2px_10px_3px_rgba(0,1,129,0.1)] flex items-center px-5 py-3 gap-3 mb-5">
        <input
          type="text"
          placeholder="Paste your enrolment record here..."
          value={enrollment}
          onChange={(e) => setEnrollment(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 text-base font-semibold text-[rgba(0,1,129,0.6)] placeholder:text-[rgba(0,1,129,0.6)] outline-none bg-transparent"
        />
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          className="w-8 h-8 rounded-full bg-[#000181] flex items-center justify-center shrink-0"
        >
          <ArrowRight size={14} className="text-white" />
        </motion.button>
      </div>

      {/* Save plan prompt */}
      <p className="text-center text-[15px] font-semibold text-[#000181] mb-5">
        Want to save your study plan for future reference or changes?
      </p>

      {/* CTA buttons */}
      <div className="flex items-center justify-center gap-6">
        <motion.button
          whileHover={{ scale: 1.04, boxShadow: "4px 4px 10px rgba(0,0,0,0.2)" }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/register")}
          className="bg-[rgba(232,160,255,0.5)] border-2 border-[#000181] rounded-[20px] h-[50px] w-[170px] font-bold text-[15px] text-[#000181] shadow-[2px_2px_4px_rgba(0,0,0,0.25)] transition-all"
        >
          Register now
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.04, boxShadow: "4px 4px 10px rgba(0,0,0,0.2)" }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/login")}
          className="bg-[rgba(131,231,255,0.5)] border-2 border-[#000181] rounded-[20px] h-[50px] w-[170px] font-bold text-[15px] text-[#000181] shadow-[2px_2px_4px_rgba(0,0,0,0.25)] transition-all"
        >
          Log-In
        </motion.button>
      </div>
    </motion.div>
  );
}

export function StartPage() {
  const [modalOpen, setModalOpen] = useState(true);

  return (
    <div className="relative w-full h-screen overflow-hidden font-['Montserrat',sans-serif]">
      {/* Background image */}
      <img
        src={imgBg}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        alt=""
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />

      {/* Chat UI Preview (behind overlay) */}
      <div className="absolute inset-0 flex items-center justify-center px-10 py-8">
        <div className="flex gap-4 w-full max-w-[1400px] h-full max-h-[750px]">
          <SidebarPreview />
          <ChatPreview />
        </div>
      </div>

      {/* Dark overlay */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20"
          />
        )}
      </AnimatePresence>

      {/* Modal centered */}
      <AnimatePresence>
        {modalOpen && (
          <div className="absolute inset-0 flex items-center justify-center px-6 py-8 z-10">
            <GetStartedModal onClose={() => setModalOpen(false)} />
          </div>
        )}
      </AnimatePresence>

      {/* If modal is closed, show a button to re-open */}
      {!modalOpen && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setModalOpen(true)}
            className="bg-[#000181] text-white rounded-[20px] px-8 py-4 font-extrabold text-lg shadow-xl"
          >
            Get Started with Courseo
          </motion.button>
        </div>
      )}
    </div>
  );
}
