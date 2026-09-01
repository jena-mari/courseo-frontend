import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ExternalLink, LogIn, UserPlus } from "lucide-react";
import { Copilot } from "@lobehub/icons";
import imgBg from "../assets/courseo-bg.png";
import imgLogo from "../assets/courseo-logo.png";
import { useAuth } from "../auth/AuthContext";
import { LoginCard } from "./LoginPage";
import { RegisterCard } from "./RegisterPage";

type StartMode = "choice" | "account" | "login" | "register" | "copilot-details";
type Campus = "Wollongong" | "Liverpool";
const COPILOT_AGENT_URLS: Record<Campus, string> = {
  Wollongong: "https://m365.cloud.microsoft/chat/?titleId=T_5c978020-5344-cdcd-55b3-3e9f458833f6&source=embedded-builder",
  Liverpool: "https://m365.cloud.microsoft/chat/?titleId=T_0ac4b7b8-0eef-7376-66e5-5ade932e22f2&source=embedded-builder",
};
const COMMENCEMENT_YEARS = Array.from({ length: 11 }, (_, index) => String(2027 - index));
const DEGREES = [{ value: "1807", label: "1807 — Bachelor of Computer Science" }];

function Shell({ children }: { children: ReactNode }) {
  return <div className="relative min-h-[100dvh] w-full overflow-hidden font-['Montserrat',sans-serif]">
    <img src={imgBg} className="absolute inset-0 h-full w-full object-cover" alt="" aria-hidden="true" />
    <div className="absolute inset-0 bg-[#050515]/65 backdrop-blur-[3px]" />
    <main className="relative z-10 flex min-h-[100dvh] items-center justify-center px-4 py-6 sm:px-6">{children}</main>
  </div>;
}

function FlowCard({ title, description, onBack, children }: { title: string; description: string; onBack?: () => void; children: ReactNode }) {
  return <motion.section initial={{ opacity: 0, scale: 0.94, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 18 }} transition={{ type: "spring", stiffness: 280, damping: 28 }} className="relative w-full max-w-[660px] rounded-[28px] border border-white/70 bg-white px-6 py-8 shadow-[0_28px_80px_rgba(0,0,0,0.32)] sm:rounded-[32px] sm:px-12 sm:py-11">
    <div className="flex items-center justify-between">
      {onBack ? <button onClick={onBack} className="flex h-10 items-center gap-1 rounded-full px-3 text-[13px] font-extrabold text-[#000181] hover:bg-[#f1f3ff]"><ArrowLeft size={17} /> Back</button> : <img src={imgLogo} alt="Courseo" className="h-10 w-10 object-contain" />}
      <span className="rounded-full bg-[#f1f3ff] px-3 py-1.5 text-[11px] font-extrabold text-[#000181]">Courseo</span>
    </div>
    <div className="mt-8 text-center"><h1 className="text-[clamp(30px,7vw,46px)] font-black leading-[1.05] tracking-[-1.5px] text-[#000181]">{title}</h1><p className="mx-auto mt-3 max-w-[490px] text-[14px] font-semibold leading-relaxed text-[rgba(0,1,129,0.62)]">{description}</p></div>
    <div className="mt-8">{children}</div>
  </motion.section>;
}

export function StartPage() {
  const navigate = useNavigate();
  const { user, status } = useAuth();
  const [mode, setMode] = useState<StartMode>("choice");
  const [commencementYear, setCommencementYear] = useState("");
  const [degree, setDegree] = useState("");
  const [campus, setCampus] = useState<Campus | "">("");
  const [copilotError, setCopilotError] = useState("");
  const chooseCourseo = () => { if (status === "loading") return; user ? navigate("/chat") : setMode("account"); };
  const openCopilot = async () => {
    if (!commencementYear || !degree || !campus) {
      setCopilotError("Please select your commencement year, degree, and campus.");
      return;
    }
    const prompt = `My commencement year is ${commencementYear}. My degree is ${degree} — Bachelor of Computer Science, and my campus is ${campus}. Please use these details to help me plan my course.`;
    try { await navigator.clipboard.writeText(prompt); } catch { /* The agent still opens without clipboard access. */ }
    window.open(COPILOT_AGENT_URLS[campus], "_blank", "noopener,noreferrer");
  };

  return <Shell><AnimatePresence mode="wait">
    {mode === "choice" && <FlowCard key="choice" title="How would you like to continue?" description="Choose Microsoft Copilot or use Courseo's dedicated study chat.">
      <div className="grid gap-4 sm:grid-cols-2">
        <button onClick={() => setMode("copilot-details")} className="group rounded-[22px] border-2 border-[rgba(0,1,129,0.14)] bg-[rgba(131,231,255,0.12)] p-6 text-left transition hover:-translate-y-1 hover:border-[#000181]"><Copilot.Color size={34} /><span className="mt-5 flex items-center justify-between text-[17px] font-black text-[#000181]">Go to Copilot <ArrowRight size={18} /></span><span className="mt-2 block text-[12px] font-semibold leading-relaxed text-[rgba(0,1,129,0.58)]">Free for UOW students. We'll send you to the right course agent.</span></button>
        <button onClick={chooseCourseo} disabled={status === "loading"} className="group rounded-[22px] border-2 border-[rgba(0,1,129,0.14)] bg-[rgba(232,160,255,0.12)] p-6 text-left transition hover:-translate-y-1 hover:border-[#000181] disabled:opacity-60"><img src={imgLogo} alt="" className="h-[34px] w-[34px] object-contain" /><span className="mt-5 flex items-center justify-between text-[17px] font-black text-[#000181]">Courseo <ArrowRight size={18} /></span><span className="mt-2 block text-[12px] font-semibold leading-relaxed text-[rgba(0,1,129,0.58)]">{status === "loading" ? "Checking your session…" : user ? "You're logged in — continue to Chat." : "Log in or create an account to start chatting."}</span></button>
      </div>
    </FlowCard>}
    {mode === "account" && <FlowCard key="account" title="Do you have an account?" description="Log in to an existing Courseo account, or register a new one." onBack={() => setMode("choice")}><div className="grid gap-3 sm:grid-cols-2"><button onClick={() => setMode("login")} className="flex h-[58px] items-center justify-center gap-2 rounded-[18px] bg-[#000181] text-[14px] font-extrabold text-white"><LogIn size={18} /> Yes, log in</button><button onClick={() => setMode("register")} className="flex h-[58px] items-center justify-center gap-2 rounded-[18px] border-2 border-[rgba(0,1,129,0.25)] text-[14px] font-extrabold text-[#000181]"><UserPlus size={18} /> No, register</button></div></FlowCard>}
    {mode === "copilot-details" && <FlowCard key="copilot-details" title="Find your Copilot agent" description="Enter your course details and we'll open the agent built for your campus." onBack={() => setMode("choice")}>
      <div className="space-y-4">
        <label className="block text-[13px] font-extrabold text-[#000181]">Commencement year<select value={commencementYear} onChange={(event) => { setCommencementYear(event.target.value); setCopilotError(""); }} className="mt-2 h-[52px] w-full rounded-[16px] border-2 border-[rgba(0,1,129,0.25)] bg-white px-4 text-[14px] font-semibold outline-none focus:border-[#000181]"><option value="">Select commencement year</option>{COMMENCEMENT_YEARS.map((year) => <option key={year} value={year}>{year}</option>)}</select></label>
        <label className="block text-[13px] font-extrabold text-[#000181]">Degree<select value={degree} onChange={(event) => { setDegree(event.target.value); setCopilotError(""); }} className="mt-2 h-[52px] w-full rounded-[16px] border-2 border-[rgba(0,1,129,0.25)] bg-white px-4 text-[14px] font-semibold outline-none focus:border-[#000181]"><option value="">Select degree</option>{DEGREES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <fieldset><legend className="text-[13px] font-extrabold text-[#000181]">Campus</legend><div className="mt-2 grid grid-cols-2 gap-3">{(["Wollongong", "Liverpool"] as Campus[]).map((item) => <button type="button" key={item} onClick={() => { setCampus(item); setCopilotError(""); }} className={`h-[52px] rounded-[16px] border-2 text-[13px] font-extrabold transition ${campus === item ? "border-[#000181] bg-[#eef0ff] text-[#000181]" : "border-[rgba(0,1,129,0.2)] text-[rgba(0,1,129,0.62)]"}`}>{item}</button>)}</div></fieldset>
      </div>
      {copilotError && <p role="alert" className="mt-4 text-center text-[12px] font-semibold text-red-600">{copilotError}</p>}
      <button onClick={() => void openCopilot()} className="mt-6 flex h-[58px] w-full items-center justify-center gap-2 rounded-[18px] bg-[#000181] text-[14px] font-extrabold text-white">Open my Copilot agent <ExternalLink size={18} /></button>
      <p className="mt-3 text-center text-[11px] font-semibold leading-relaxed text-[rgba(0,1,129,0.5)]">Your details are copied as a starter message. Paste them into Copilot when it opens.</p>
    </FlowCard>}
    {mode === "login" && <LoginCard key="login" onClose={() => setMode("account")} onRegister={() => setMode("register")} onSuccess={() => navigate("/chat")} />}
    {mode === "register" && <RegisterCard key="register" onClose={() => setMode("account")} onLogin={() => setMode("login")} onSuccess={() => navigate("/profile")} />}
  </AnimatePresence></Shell>;
}
