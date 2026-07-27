import { useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, LogIn, UserPlus, X } from "lucide-react";
import imgLogo from "../assets/courseo-logo.png";
import { ChatPage } from "./ChatPage";
import { LoginCard } from "./LoginPage";
import { RegisterCard } from "./RegisterPage";
import { HelpSlider } from "../components/help-carousel";

type StartMode = "start" | "login" | "register" | "tutorial";

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
    <div className="relative w-full h-[100dvh] overflow-hidden font-['Montserrat',sans-serif]">
      <div className={modalOpen ? "pointer-events-none" : ""}>
        <ChatPage />
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#050515]/65 backdrop-blur-[3px] z-20"
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {modalOpen && (
          <div className="absolute inset-0 flex items-center justify-center px-4 py-4 sm:px-6 sm:py-8 z-30">
            {mode === "start" && (
              <motion.div
                key="start"
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ type: "spring", stiffness: 280, damping: 28 }}
                className="bg-white rounded-[28px] sm:rounded-[32px] shadow-[0_28px_80px_rgba(0,0,0,0.32)] border border-white/70 w-full max-w-[590px] max-h-[calc(100dvh-32px)] overflow-y-auto px-6 py-7 sm:px-12 sm:py-10 relative"
              >
                <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
                  <img src={imgLogo} alt="Courseo" className="w-10 h-10 object-contain" />
                </div>

                <button
                  onClick={() => setModalOpen(false)}
                  className="absolute top-6 right-6 sm:top-8 sm:right-8 w-10 h-10 flex items-center justify-center text-[#000181] hover:bg-[#f1f3ff] rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X size={24} strokeWidth={2.25} />
                </button>

                <div className="flex flex-col items-center pt-16 sm:pt-14">
                  <div className="text-center mb-8">
                    <h1 className="font-extrabold text-[clamp(32px,7vw,46px)] text-[#000181] tracking-[-1.5px] leading-[1.05]">
                      Welcome to Courseo
                    </h1>
                    <p className="mt-4 text-[14px] sm:text-[15px] font-semibold leading-relaxed text-[rgba(0,1,129,0.68)] max-w-[430px] mx-auto">
                      Add your enrolment record to get personalised course advice and build your study plan.{" "}
                      <button
                        type="button"
                        onClick={() => setMode("tutorial")}
                        className="font-black underline underline-offset-2 hover:opacity-70"
                      >
                        Need help?
                      </button>
                    </p>
                  </div>

                  <div className="w-full">
                    <label htmlFor="enrolment-record" className="block mb-2 text-[13px] font-extrabold text-[#000181]">
                      Enrolment record
                    </label>
                    <div className="border-2 border-[rgba(0,1,129,0.35)] focus-within:border-[#000181] rounded-[18px] h-[58px] shadow-[0_4px_14px_rgba(0,1,129,0.08)] flex items-center pl-5 pr-3 gap-3 transition-colors">
                      <input
                        id="enrolment-record"
                        type="text"
                        placeholder="Paste your enrolment record here..."
                        value={enrollment}
                        onChange={(e) => setEnrollment(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 text-[14px] font-semibold text-[#000181] placeholder:text-[rgba(0,1,129,0.38)] outline-none bg-transparent min-w-0"
                      />
                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSubmit}
                        disabled={!enrollment.trim()}
                        className="w-9 h-9 rounded-full bg-[#000181] flex items-center justify-center shrink-0 disabled:opacity-35"
                        aria-label="Continue"
                      >
                        <ArrowRight size={16} className="text-white" />
                      </motion.button>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleSubmit}
                    disabled={!enrollment.trim()}
                    className="mt-4 w-full h-[54px] rounded-[18px] bg-[#000181] text-white font-extrabold text-[15px] disabled:opacity-35 transition-opacity"
                  >
                    Continue
                  </motion.button>

                  <div className="my-7 flex items-center gap-4 w-full text-[12px] font-extrabold text-[rgba(0,1,129,0.42)]">
                    <span className="h-px flex-1 bg-[rgba(0,1,129,0.15)]" />
                    OR
                    <span className="h-px flex-1 bg-[rgba(0,1,129,0.15)]" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setMode("register")}
                      className="bg-white border border-[rgba(0,1,129,0.25)] rounded-[18px] h-[52px] font-extrabold text-[14px] text-[#000181] hover:bg-[#faf4ff] transition-all flex items-center justify-center gap-2"
                    >
                      <UserPlus size={17} />
                      Create account
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setMode("login")}
                      className="bg-white border border-[rgba(0,1,129,0.25)] rounded-[18px] h-[52px] font-extrabold text-[14px] text-[#000181] hover:bg-[#f1fcff] transition-all flex items-center justify-center gap-2"
                    >
                      <LogIn size={17} />
                      Log in
                    </motion.button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="mt-7 text-[13px] font-bold text-[rgba(0,1,129,0.62)] underline underline-offset-4 hover:text-[#000181] transition-colors"
                  >
                    Continue without an enrolment record
                  </button>
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

            {mode === "tutorial" && (
              <HelpSlider
                onClose={() => setMode("start")}
              />
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
