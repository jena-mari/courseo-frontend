import { useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ExternalLink, Info, LogIn, UserPlus } from "lucide-react";
import { Copilot } from "@lobehub/icons";
import imgBg from "../assets/courseo-bg.png";
import imgLogo from "../assets/courseo-logo.png";
import { useAuth } from "../auth/AuthContext";
import { HelpSlider } from "../components/help-carousel";
import { ApiKeyStatusNotice } from "../components/ApiKeyStatusNotice";
import { LoginCard } from "./LoginPage";
import { RegisterCard } from "./RegisterPage";
import copilotLink from "../functions/copilotLink";
import { getKeyProviders, personalKeyState } from "../lib/keyApi";

type StartMode = "choice" | "account" | "login" | "register" | "copilot-details";
type Campus = "Wollongong" | "Liverpool";
const COMMENCEMENT_YEARS = ["2026"];
const DEGREES = [{ value: "1807", label: "1807 — Bachelor of Information Technology" }, { value: "766", label: "766 — Bachelor of Computer Science" }];

function Shell({ children }: { children: ReactNode }) {
  const shellRef = useRef<HTMLDivElement>(null);
  const moveLight = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    shellRef.current?.style.setProperty("--courseo-pointer-x", `${event.clientX - bounds.left}px`);
    shellRef.current?.style.setProperty("--courseo-pointer-y", `${event.clientY - bounds.top}px`);
  };

  return <div ref={shellRef} onPointerMove={moveLight} className="courseo-start-shell relative min-h-[100dvh] w-full overflow-x-clip font-['Montserrat',sans-serif] text-[#000181]" style={{ "--courseo-pointer-x": "72%", "--courseo-pointer-y": "36%" } as CSSProperties}>
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <img src={imgBg} className="absolute inset-0 h-full w-full object-cover" alt="" />
      <div className="absolute inset-0 bg-white/10" />
      <div className="courseo-pointer-light absolute inset-0" />
      <div className="courseo-ambient courseo-ambient-one" />
      <div className="courseo-ambient courseo-ambient-two" />
    </div>

    <main className="courseo-landing-frame relative z-10 flex min-h-[100dvh] min-w-0 items-center justify-center">{children}</main>
  </div>;
}

function FlowCard({ title, description, onBack, children }: { title: string; description: string; onBack?: () => void; children: ReactNode }) {
  return <motion.section initial={{ opacity: 0, scale: 0.96, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 18 }} transition={{ duration: 0.3, ease: "easeOut" }} className="relative w-full max-w-[600px] overflow-hidden rounded-[30px] border border-white/50 bg-white/[0.92] px-6 py-8 text-[#000181] shadow-[0_30px_90px_rgba(0,0,30,0.45)] backdrop-blur-2xl sm:px-12 sm:py-11">
    <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
    <div className="flex items-center justify-between">
      {onBack ? <button type="button" onClick={onBack} className="flex h-10 items-center gap-1 rounded-full px-3 text-[13px] font-extrabold text-[#000181] transition hover:bg-[#eef0ff]"><ArrowLeft size={17} /> Back</button> : <img src={imgLogo} alt="Courseo" className="h-10 w-10 object-contain" />}
      <span className="rounded-full bg-[#eef0ff] px-3 py-1.5 text-[11px] font-extrabold text-[#000181]">Secure setup</span>
    </div>
    <div className="mt-8 text-center"><h1 className="text-[clamp(30px,7vw,46px)] font-black leading-[1.05] tracking-[-1.5px] text-[#000181]">{title}</h1><p className="mx-auto mt-3 max-w-[490px] text-[14px] font-semibold leading-relaxed text-[rgba(0,1,129,0.62)]">{description}</p></div>
    <div className="mt-8">{children}</div>
  </motion.section>;
}

function ChoiceHero({ onCopilot, onCourseo, onMoreInformation, user, loading }: { onCopilot: () => void; onCourseo: () => void; onMoreInformation: () => void; user: boolean; loading: boolean }) {
  return <motion.section initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }} className="relative mx-auto grid w-full min-w-0 max-w-[1040px] items-center gap-x-10 gap-y-3 lg:w-full lg:grid-cols-[1.08fr_0.92fr]">
    <div className="relative z-10 min-w-0 pt-2 text-center lg:pt-0 lg:text-left">
      <div className="overflow-hidden">
        <motion.p variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }} transition={{ duration: 0.55, ease: "easeOut" }} className="text-[clamp(18px,2vw,23px)] font-bold tracking-[-0.5px] text-[rgba(0,1,129,0.58)]">Welcome to</motion.p>
        <motion.h1 variants={{ hidden: { opacity: 0, y: 70 }, show: { opacity: 1, y: 0 } }} transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }} className="courseo-hero-word mt-[-0.04em] text-[clamp(60px,9vw,112px)] font-black leading-[0.88] tracking-[-0.075em]">Courseo</motion.h1>
      </div>
      <motion.p variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }} transition={{ duration: 0.5 }} className="mx-auto mt-5 max-w-[450px] text-[14px] font-semibold leading-relaxed text-[rgba(0,1,129,0.68)] lg:mx-0 lg:text-[15px]">Turn your enrolment record into a handbook-aware study plan, then ask questions and refine every session with Courseo.</motion.p>
      <motion.button variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} type="button" onClick={onMoreInformation} className="relative z-30 mt-5 inline-flex items-center gap-2 rounded-full px-1 py-2 text-[13px] font-extrabold text-[#000181] transition hover:opacity-65"><Info size={16} /> See how Courseo works <ArrowRight size={14} /></motion.button>
    </div>

    <motion.div variants={{ hidden: { opacity: 0, scale: 0.82, rotate: -5 }, show: { opacity: 1, scale: 1, rotate: 0 } }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} className="relative mx-auto flex w-full min-w-0 max-w-[600px] items-center justify-center ">
      <img src={imgLogo} alt="Courseo" className="courseo-hero-icon relative z-10 w-[min(40vw,210px)] lg:w-[min(29vw,350px)] select-none object-contain" />
    </motion.div>

    <motion.div variants={{ hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0 } }} transition={{ duration: 0.55 }} className="relative z-20 mt-5 grid min-w-0 gap-4 lg:col-span-2 lg:mt-6 lg:grid-cols-[1.35fr_0.85fr]">
      <button type="button" onClick={onCourseo} disabled={loading} aria-busy={loading} className="group relative flex min-h-[112px] w-full min-w-0 items-center justify-between overflow-hidden rounded-[25px] border-2 border-[#000181] bg-[#000181] px-4 py-5 text-left text-white shadow-[0_18px_42px_rgba(0,1,129,0.24)] transition duration-300 hover:-translate-y-1 hover:bg-[#171899] hover:shadow-[0_22px_48px_rgba(0,1,129,0.3)] disabled:cursor-wait sm:px-7">
        <span className="relative flex min-w-0 flex-1 items-center gap-3 sm:gap-5"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[17px] bg-white shadow-lg sm:h-14 sm:w-14 sm:rounded-[17px]"><img src={imgLogo} alt="" className="h-10 w-10 object-contain sm:h-11 sm:w-11" /></span><span className="min-w-0"><span className="mb-2 inline-flex rounded-full bg-[#83e7ff] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-[#000181]">Recommended</span><strong className="block text-[17px] font-black leading-tight text-white sm:text-[18px]">{loading ? "Checking your session…" : "Proceed to Courseo"}</strong><span className="mt-1 block text-[10px] font-semibold leading-relaxed text-white/75 sm:text-[12px]">{user ? "Open your handbook-aware planner and saved chats." : "Create an account for personalised plans and saved chats."}</span></span></span><span className="relative ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#000181] shadow-lg transition-transform group-hover:translate-x-1 sm:ml-3 sm:h-12 sm:w-12"><ArrowRight size={20} /></span>
      </button>
      <button type="button" onClick={onCopilot} className="group flex min-h-[112px] w-full min-w-0 items-center justify-between rounded-[25px] border-2 border-[rgba(0,1,129,0.22)] bg-white px-4 py-5 text-left shadow-[0_14px_34px_rgba(0,1,129,0.12)] transition duration-300 hover:-translate-y-1 hover:border-[#000181] hover:shadow-[0_18px_40px_rgba(0,1,129,0.18)] sm:px-6">
        <span className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[#f3f4ff] text-[#000181] sm:h-14 sm:w-14 sm:rounded-[17px]"><Copilot.Color size={27} /></span><span className="min-w-0"><span className="mb-2 block text-[9px] font-black uppercase tracking-[0.1em] text-[rgba(0,1,129,0.5)]">UOW agent</span><strong className="block text-[16px] font-black leading-tight text-[#000181] sm:text-[18px]">Microsoft Copilot</strong><span className="mt-1 block text-[10px] font-semibold leading-relaxed text-[rgba(0,1,129,0.65)] sm:text-[11px]">Open the UOW agent matched to your course and campus.</span></span></span><span className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgba(0,1,129,0.18)] text-[#000181] transition-transform group-hover:translate-x-1 sm:ml-3 sm:h-10 sm:w-10"><ArrowRight size={18} /></span>
      </button>
    </motion.div>
  </motion.section>;
}

export function StartPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, status } = useAuth();
  const routeState = location.state as { authRequired?: boolean; returnTo?: string } | null;
  const [mode, setMode] = useState<StartMode>(routeState?.authRequired ? "account" : "choice");
  const [showHelp, setShowHelp] = useState(false);
  const [commencementYear, setCommencementYear] = useState("");
  const [degree, setDegree] = useState("");
  const [campus, setCampus] = useState<Campus | "">("");
  const [copilotError, setCopilotError] = useState("");
  const [openingCourseo, setOpeningCourseo] = useState(false);
  const [showKeyNotice, setShowKeyNotice] = useState(false);

  const chooseCourseo = async () => {
    if (status === "loading") return;
    if (!user) {
      setMode("account");
      return;
    }
    if (!user.displayName) {
      navigate("/profile");
      return;
    }

    setOpeningCourseo(true);
    try {
      const state = personalKeyState(await getKeyProviders());
      if (state === "ready") navigate("/chat");
      else if (state === "missing") navigate("/connect-key");
      else setShowKeyNotice(true);
    } catch {
      setShowKeyNotice(true);
    } finally {
      setOpeningCourseo(false);
    }
  };

  const openCopilot = async () => {
    if (!commencementYear || !degree || !campus) {
      setCopilotError("Select your commencement year, degree, and campus to continue.");
      return;
    }
    const link = copilotLink({ year: commencementYear, degree, campus });
    if (!link) {
      setCopilotError("A dedicated Copilot agent is not available for that course and campus yet. Try Courseo instead.");
      return;
    }
    const degreeLabel = DEGREES.find((item) => item.value === degree)?.label ?? degree;
    const prompt = `My commencement year is ${commencementYear}. My degree is ${degreeLabel}, and my campus is ${campus}. Please use these details to help me plan my course.`;
    try { await navigator.clipboard.writeText(prompt); } catch { /* Copilot still opens if clipboard permission is unavailable. */ }
    window.open(link, "_blank", "noopener,noreferrer");
  };

  return <Shell>
    <AnimatePresence mode="wait">
      {mode === "choice" && <ChoiceHero key="choice" onCopilot={() => setMode("copilot-details")} onCourseo={() => void chooseCourseo()} onMoreInformation={() => setShowHelp(true)} user={Boolean(user)} loading={status === "loading" || openingCourseo} />}
      {mode === "account" && <FlowCard key="account" title="Continue to Courseo" description={routeState?.authRequired ? "Log in before connecting or managing an API key. Courseo will bring you back to secure setup afterwards." : "Log in to your account or create one to save your study details and plans."} onBack={() => setMode("choice")}><div className="grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => setMode("login")} className="flex h-[58px] items-center justify-center gap-2 rounded-[18px] bg-[#000181] text-[14px] font-extrabold text-white transition hover:-translate-y-0.5 hover:shadow-lg"><LogIn size={18} /> Log in</button><button type="button" onClick={() => setMode("register")} className="flex h-[58px] items-center justify-center gap-2 rounded-[18px] border-2 border-[rgba(0,1,129,0.22)] text-[14px] font-extrabold text-[#000181] transition hover:-translate-y-0.5 hover:bg-[#eef0ff]"><UserPlus size={18} /> Create account</button></div></FlowCard>}
      {mode === "copilot-details" && <FlowCard key="copilot-details" title="Find your Copilot agent" description="Choose your course details and Courseo will open the matching UOW Copilot agent." onBack={() => setMode("choice")}>
        <div className="space-y-4">
          <label className="block text-[13px] font-extrabold text-[#000181]">Commencement year<select value={commencementYear} onChange={(event) => { setCommencementYear(event.target.value); setCopilotError(""); }} className="mt-2 h-[52px] w-full rounded-[16px] border-2 border-[rgba(0,1,129,0.25)] bg-white px-4 text-[14px] font-semibold outline-none focus:border-[#000181]"><option value="">Select commencement year</option>{COMMENCEMENT_YEARS.map((year) => <option key={year} value={year}>{year}</option>)}</select></label>
          <label className="block text-[13px] font-extrabold text-[#000181]">Degree<select value={degree} onChange={(event) => { setDegree(event.target.value); setCopilotError(""); }} className="mt-2 h-[52px] w-full rounded-[16px] border-2 border-[rgba(0,1,129,0.25)] bg-white px-4 text-[14px] font-semibold outline-none focus:border-[#000181]"><option value="">Select degree</option>{DEGREES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          <fieldset><legend className="text-[13px] font-extrabold text-[#000181]">Campus</legend><div className="mt-2 grid grid-cols-2 gap-3">{(["Wollongong", "Liverpool"] as Campus[]).map((item) => <button type="button" key={item} onClick={() => { setCampus(item); setCopilotError(""); }} className={`h-[52px] rounded-[16px] border-2 text-[13px] font-extrabold transition ${campus === item ? "border-[#000181] bg-[#eef0ff] text-[#000181]" : "border-[rgba(0,1,129,0.2)] text-[rgba(0,1,129,0.62)] hover:border-[#000181]"}`}>{item}</button>)}</div></fieldset>
        </div>
        {copilotError && <p role="alert" className="mt-4 rounded-[13px] bg-red-50 px-4 py-3 text-center text-[12px] font-semibold text-red-700">{copilotError}</p>}
        <button type="button" onClick={() => void openCopilot()} className="mt-6 flex h-[58px] w-full items-center justify-center gap-2 rounded-[18px] bg-[#000181] text-[14px] font-extrabold text-white transition hover:-translate-y-0.5 hover:shadow-lg">Open my Copilot agent <ExternalLink size={18} /></button>
        <p className="mt-3 text-center text-[11px] font-semibold leading-relaxed text-[rgba(0,1,129,0.5)]">Courseo copies your details as a starter message. Paste it into Copilot after the agent opens.</p>
      </FlowCard>}
      {mode === "login" && <LoginCard key="login" onClose={() => setMode("account")} onRegister={() => setMode("register")} onSuccess={(nextPath) => navigate(routeState?.returnTo === "/connect-key" ? "/connect-key" : nextPath, { replace: Boolean(routeState?.authRequired) })} />}
      {mode === "register" && <RegisterCard key="register" onClose={() => setMode("account")} onLogin={() => setMode("login")} onSuccess={() => navigate("/profile")} />}
    </AnimatePresence>
    <AnimatePresence>{showHelp && <HelpSlider onClose={() => setShowHelp(false)} />}</AnimatePresence>
    <AnimatePresence>{showKeyNotice && <ApiKeyStatusNotice message="Your saved key could not be verified or may have reached its limit. Update or re-check it in Settings to continue." onAction={() => navigate("/settings?tab=system#api-keys")} onDismiss={() => setShowKeyNotice(false)} />}</AnimatePresence>
  </Shell>;
}
