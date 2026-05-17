import { useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import imgLogo from "../assets/courseo-logo.png";
import { ChatPage } from "./ChatPage";
import { LoginCard } from "./LoginPage";
import { RegisterCard } from "./RegisterPage";

type StartMode = "start" | "login" | "register";

export function StartPage() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(true);
  const [mode, setMode] = useState<StartMode>("start");
  const [enrollment, setEnrollment] = useState("");

  const handleSubmit = () => {
    if (!enrollment.trim()) return;
    localStorage.setItem("courseoEnrollment", enrollment.trim());
    navigate("/chat");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="relative w-full h-screen overflow-hidden font-['Montserrat',sans-serif]">
      <div className={modalOpen ? "pointer-events-none" : ""}>
        <ChatPage />
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20 z-20"
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {modalOpen && (
          <div className="absolute inset-0 flex items-center justify-center px-6 py-8 z-30">
            {mode === "start" && (
              <motion.div
                key="start"
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ type: "spring", stiffness: 280, damping: 28 }}
                className="bg-white rounded-[38px] shadow-[2px_2px_16px_4px_rgba(0,0,0,0.12)] w-full max-w-[980px] max-h-[90vh] overflow-y-auto px-10 py-5 sm:px-14 sm:py-5 relative flex flex-col"
              >
                <div className="absolute top-8 left-8">
                  <img src={imgLogo} alt="Courseo" className="w-12 h-12 object-contain" />
                </div>

                <button
                  onClick={() => setModalOpen(false)}
                  className="absolute top-8 right-8 w-11 h-11 flex items-center justify-center text-[#000181] hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X size={30} strokeWidth={2.5} />
                </button>

                <div className="flex flex-1 flex-col items-center justify-center pt-8 pb-6">
                  <div className="text-center mb-6">
                    <h1 className="font-extrabold text-[clamp(46px,6vw,68px)] text-[#000181] tracking-[-2px] leading-[0.9]">
                      Get Started<br />with Courseo
                    </h1>
                    <p className="mt-6 text-[14px] font-extrabold leading-tight text-[rgba(0,1,129,0.78)] max-w-[520px] mx-auto">
                      Copy and paste your enrolment record below to start chatting with
                      <br className="hidden sm:block" /> our AI assistant. For a guide on how to do this,{" "}
                      <button
                        type="button"
                        className="font-black underline underline-offset-2 hover:opacity-70"
                      >
                        click here.
                      </button>
                    </p>
                  </div>

                  <div className="w-full max-w-[470px]">
                    <div className="border-2 border-[#7890ff] rounded-[22px] h-[52px] shadow-[2px_2px_8px_rgba(0,1,129,0.22)] flex items-center pl-8 pr-3 gap-3">
                      <input
                        type="text"
                        placeholder="Paste your enrolment record here..."
                        value={enrollment}
                        onChange={(e) => setEnrollment(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 text-[13px] font-extrabold text-[rgba(0,1,129,0.72)] placeholder:text-[rgba(0,1,129,0.42)] outline-none bg-transparent min-w-0"
                      />
                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSubmit}
                        disabled={!enrollment.trim()}
                        className="w-7 h-7 rounded-full bg-[#000181] flex items-center justify-center shrink-0 disabled:opacity-40"
                        aria-label="Continue"
                      >
                        <ArrowRight size={13} className="text-white" />
                      </motion.button>
                    </div>
                  </div>

                  <p className="mt-6 text-center text-[15px] font-extrabold text-[rgba(0,1,129,0.82)]">
                    Want to save your study plan for future reference or changes?
                  </p>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-[340px]">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setMode("register")}
                      className="bg-[rgba(232,160,255,0.5)] border-2 border-[#000181] rounded-[18px] h-[44px] font-extrabold text-[14px] text-[#000181] shadow-[2px_2px_4px_rgba(0,0,0,0.25)] transition-all"
                    >
                      Register now
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setMode("login")}
                      className="bg-[#c7f4ff] border-2 border-[#000181] rounded-[18px] h-[44px] font-extrabold text-[14px] text-[#000181] shadow-[2px_2px_4px_rgba(0,0,0,0.25)] transition-all"
                    >
                      Log-In
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {mode === "login" && (
              <LoginCard
                onClose={() => setMode("start")}
                onRegister={() => setMode("register")}
              />
            )}

            {mode === "register" && (
              <RegisterCard
                onClose={() => setMode("start")}
                onLogin={() => setMode("login")}
              />
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
