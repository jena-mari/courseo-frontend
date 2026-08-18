import { useMemo, useState, type KeyboardEvent } from "react";
import { startChat } from "../lib/chatApi";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, KeyRound, LogIn, UserPlus, X } from "lucide-react";
import { Copilot } from "@lobehub/icons";
import imgBg from "../assets/courseo-bg.png";
import imgLogo from "../assets/courseo-logo.png";
import { useAuth } from "../auth/AuthContext";
import { LoginCard } from "./LoginPage";
import { RegisterCard } from "./RegisterPage";
import { HelpSlider } from "../components/help-carousel";
import { STORAGE_KEYS } from "../lib/storageKeys";
import textBounce from "../functions/textBounce";
import { buildCopilotStudyPlanPrompt, parseEnrolmentSummary } from "../lib/enrolment";

type StartMode = "start" | "confirm" | "provider" | "login" | "register" | "tutorial";

const COPILOT_AGENT_URL = import.meta.env.VITE_COPILOT_AGENT_URL ?? "https://copilot.microsoft.com/";

export function StartPage() {
  const navigate = useNavigate();
  const { user, status } = useAuth();
  const [modalOpen] = useState(true);
  const [mode, setMode] = useState<StartMode>("start");
  const [enrollment, setEnrollment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [copilotCopied, setCopilotCopied] = useState(false);
  const enrolmentSummary = useMemo(() => parseEnrolmentSummary(enrollment), [enrollment]);

  const requireAuth = () => {
    if (status === "loading") {
      setSubmitError("Checking your session…");
      return false;
    }
    if (!user) {
      setSubmitError("Please log in or create an account first.");
      setMode("login");
      return false;
    }
    return true;
  };

  const handleSkip = async () => {
    if (!requireAuth()) return;

    const record = enrollment.trim() || " ";
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      localStorage.setItem(STORAGE_KEYS.enrolment, record);
      navigate("/chat");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to start your study-planning session."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!requireAuth()) return;

    const record = enrollment.trim() || " ";
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const result = await startChat(record);

      localStorage.setItem(STORAGE_KEYS.enrolment, record);

      localStorage.setItem(
        STORAGE_KEYS.bootstrapChat,
        JSON.stringify({
          sessionId: result.session_id,
          reply: result.reply,
        })
      );

      navigate("/chat");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to start your study-planning session."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReview = () => {
    if (!enrollment.trim()) return;
    setSubmitError("");
    setMode("confirm");
  };

  const handleConfirmedEnrolment = () => {
    setMode("provider");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      handleReview();
    }
  };

  const handleCopilot = async () => {
    const record = enrollment.trim();
    if (!record) return;
    const copilotPrompt = buildCopilotStudyPlanPrompt(record, enrolmentSummary);

    try {
      await navigator.clipboard.writeText(copilotPrompt);
      setCopilotCopied(true);
      window.open(COPILOT_AGENT_URL, "_blank", "noopener,noreferrer");
      window.setTimeout(() => setCopilotCopied(false), 4000);
    } catch {
      setSubmitError("Your browser blocked clipboard access. Copy the enrolment record manually, then open Copilot.");
    }
  };

  const afterAuthSuccess = () => {
    setSubmitError("");
    setMode("start");
  };

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden font-['Montserrat',sans-serif]">
      <img
        src={imgBg}
        className="absolute inset-0 h-full w-full object-cover"
        alt=""
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/10" />

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
                  onClick={() => void handleSkip()}
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
                    {user && (
                      <p className="mt-3 text-[13px] font-bold text-[#000181]">
                        Signed in as {user.username}
                      </p>
                    )}
                  </div>

                  <div className="w-full">
                    <label htmlFor="enrolment-record" className="block mb-2 text-[13px] font-extrabold text-[#000181]">
                      Enrolment record
                    </label>
                    <div className="border-2 border-[rgba(0,1,129,0.35)] focus-within:border-[#000181] rounded-[18px] min-h-[112px] shadow-[0_4px_14px_rgba(0,1,129,0.08)] flex items-end p-3 pl-5 gap-3 transition-colors">
                      <textarea
                        id="enrolment-record"
                        placeholder="Paste your enrolment record here..."
                        value={enrollment}
                        onChange={(e) => setEnrollment(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={4}
                        className="flex-1 self-stretch resize-none text-[14px] font-semibold leading-relaxed text-[#000181] placeholder:text-[rgba(0,1,129,0.38)] outline-none bg-transparent min-w-0"
                      />
                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleReview}
                        disabled={!enrollment.trim() || isSubmitting}
                        className="w-9 h-9 rounded-full bg-[#000181] flex items-center justify-center shrink-0 disabled:opacity-35"
                        aria-label="Continue"
                      >
                        <ArrowRight size={16} className="text-white" />
                      </motion.button>
                    </div>
                  </div>
                  {submitError && (
                      <p
                        role="alert"
                        className="mt-3 text-center text-sm font-semibold text-red-600"
                      >
                        {submitError}
                      </p>
                    )}

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleReview}
                    disabled={!enrollment.trim() || isSubmitting}
                    className="mt-4 w-full h-[54px] rounded-[18px] bg-[#000181] text-white font-extrabold text-[15px] disabled:opacity-35 transition-opacity"
                  >
                    {isSubmitting ? textBounce("Creating your study plan…", "mt-4 w-full h-[54px] rounded-[18px] text-white font-extrabold text-[15px]", -10) : "Continue"}
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
                    onClick={() => void handleSkip()}
                    className="mt-7 text-[13px] font-bold text-[rgba(0,1,129,0.62)] underline underline-offset-4 hover:text-[#000181] transition-colors"
                  >
                    Continue without an enrolment record
                  </button>
                </div>
              </motion.div>
            )}

            {mode === "confirm" && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                className="relative w-full max-w-[620px] rounded-[28px] border border-white/70 bg-white px-6 py-7 shadow-[0_28px_80px_rgba(0,0,0,0.32)] sm:px-10 sm:py-9"
              >
                <button type="button" onClick={() => setMode("start")} className="mb-5 flex items-center gap-1.5 text-[12px] font-extrabold text-[rgba(0,1,129,0.62)] hover:text-[#000181]">
                  <ArrowLeft size={15} /> Edit enrolment
                </button>
                <h2 className="text-[28px] font-black tracking-tight text-[#000181]">Is this enrolment correct?</h2>
                <p className="mt-2 text-[13px] font-semibold text-[rgba(0,1,129,0.6)]">
                  Confirm these subjects before Courseo sends anything to the AI provider.
                </p>

                {enrolmentSummary.current.length + enrolmentSummary.completed.length > 0 ? (
                  <div className="mt-5 grid max-h-[45vh] gap-4 overflow-y-auto sm:grid-cols-2">
                    {(["current", "completed"] as const).map((group) => (
                      <section key={group} className="rounded-[16px] bg-[rgba(131,231,255,0.12)] p-4">
                        <h3 className="text-[12px] font-extrabold uppercase tracking-wide text-[#000181]">
                          {group === "current" ? "Currently enrolled" : "Completed subjects"} ({enrolmentSummary[group].length})
                        </h3>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {enrolmentSummary[group].length ? enrolmentSummary[group].map((subject, index) => (
                            <span key={`${subject.code}-${index}`} className="rounded-full bg-white px-2.5 py-1 text-[10px] font-extrabold text-[#000181] shadow-sm" title={`${subject.year} ${subject.session} · ${subject.status}`}>
                              {subject.code}
                            </span>
                          )) : <span className="text-[11px] font-semibold text-[rgba(0,1,129,0.5)]">None found</span>}
                        </div>
                      </section>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-[16px] border border-amber-200 bg-amber-50 p-4 text-[12px] font-semibold leading-relaxed text-amber-900">
                    Courseo could not identify the subject table. Go back and paste the complete SOLS table, including the Subject Code and Status headings.
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleConfirmedEnrolment}
                  disabled={enrolmentSummary.current.length + enrolmentSummary.completed.length === 0 || isSubmitting}
                  className="mt-6 h-[52px] w-full rounded-[16px] bg-[#000181] text-[14px] font-extrabold text-white disabled:opacity-35"
                >
                  Yes, this is correct
                </button>
              </motion.div>
            )}

            {mode === "provider" && (
              <motion.div
                key="provider"
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                className="w-full max-w-[560px] rounded-[28px] border border-white/70 bg-white px-6 py-8 shadow-[0_28px_80px_rgba(0,0,0,0.32)] sm:px-10"
              >
                <h2 className="text-center text-[28px] font-black tracking-tight text-[#000181]">How would you like to continue?</h2>
                <p className="mx-auto mt-2 max-w-md text-center text-[13px] font-semibold leading-relaxed text-[rgba(0,1,129,0.6)]">
                  Generate your study plan with Courseo or use the free Microsoft Copilot agent.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button type="button" onClick={() => void handleCopilot()} className="rounded-[18px] border border-[rgba(0,1,129,0.16)] bg-[rgba(131,231,255,0.12)] p-5 text-left transition-transform hover:-translate-y-0.5">
                    <Copilot.Color size={30} />
                    <span className="mt-3 block text-[14px] font-extrabold text-[#000181]">{copilotCopied ? "Copied — paste in Copilot" : "Use Copilot"}</span>
                    <span className="mt-1 block text-[11px] font-semibold leading-relaxed text-[rgba(0,1,129,0.55)]">Free with your Microsoft account. Copies a concise, agent-ready record.</span>
                  </button>
                  <button type="button" onClick={() => void handleSubmit()} disabled={isSubmitting} className="rounded-[18px] border border-[rgba(0,1,129,0.16)] bg-[rgba(232,160,255,0.10)] p-5 text-left transition-transform hover:-translate-y-0.5 disabled:opacity-50">
                    <KeyRound size={30} className="text-[#000181]" />
                    <span className="mt-3 block text-[14px] font-extrabold text-[#000181]">{isSubmitting ? "Creating study plan…" : "Use Courseo"}</span>
                    <span className="mt-1 block text-[11px] font-semibold leading-relaxed text-[rgba(0,1,129,0.55)]">Create a Courseo chat and generate your study plan now.</span>
                  </button>
                </div>
                {submitError && <p role="alert" className="mt-3 text-center text-[12px] font-semibold text-red-600">{submitError}</p>}
                <button type="button" onClick={() => setMode("confirm")} className="mt-5 w-full text-center text-[12px] font-extrabold text-[rgba(0,1,129,0.55)] underline underline-offset-2">Back to confirmation</button>
              </motion.div>
            )}

            {mode === "login" && (
              <LoginCard
                onClose={() => setMode("start")}
                onRegister={() => setMode("register")}
                onSuccess={afterAuthSuccess}
              />
            )}

            {mode === "register" && (
              <RegisterCard
                onClose={() => setMode("start")}
                onLogin={() => setMode("login")}
                onSuccess={afterAuthSuccess}
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
