import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpenCheck, GraduationCap, LoaderCircle, MapPin } from "lucide-react";
import imgBg from "../assets/courseo-bg.png";
import imgLogo from "../assets/courseo-logo.png";
import { useAuth } from "../auth/AuthContext";
import { ElectiveInterestsField, inferElectiveMode, type ElectiveRecommendationMode } from "../components/ElectiveInterestsField";
import { STORAGE_KEYS } from "../lib/storageKeys";

const MAJORS = [
  "Artificial Intelligence and Big Data",
  "Cybersecurity",
  "Digital Systems Security",
  "Game and Mobile Development",
  "Software Engineering",
  "No major",
];

const YEARS = Array.from({ length: 8 }, (_, index) => new Date().getFullYear() - index);

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();
  const [name, setName] = useState(user?.displayName ?? user?.username ?? "");
  const [commencementYear, setCommencementYear] = useState(String(user?.commencementYear ?? new Date().getFullYear()));
  const [campus, setCampus] = useState<"Wollongong" | "Liverpool">(user?.campus ?? "Wollongong");
  const [major, setMajor] = useState(user?.major ?? MAJORS[0]);
  const [electiveInterests, setElectiveInterests] = useState(user?.electiveInterests ?? []);
  const [electiveMode, setElectiveMode] = useState<ElectiveRecommendationMode>(() => inferElectiveMode(user?.electiveInterests ?? []));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [leaving, setLeaving] = useState(false);

  const backToLogin = async () => {
    setLeaving(true);
    try {
      await logout();
    } catch {
      // AuthContext clears the local session even if the server is unreachable.
    } finally {
      window.location.replace("/login");
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const displayName = name.trim();
    if (!user || !displayName) return;
    if (electiveMode === "interest" && electiveInterests.length === 0) {
      setError("Add at least one elective interest or choose degree-based recommendations.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const saved = await updateProfile({
        email: user.email,
        display_name: displayName,
        degree_code: "766",
        commencement_year: Number(commencementYear),
        campus,
        major: major === "No major" ? null : major,
        elective_interests: electiveMode === "interest" ? electiveInterests : [],
      });
      localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify({
        displayName: saved.displayName,
        email: saved.email,
        degreeCode: saved.degreeCode,
        degree: "Bachelor of Computer Science",
        commencementYear: saved.commencementYear,
        campus: saved.campus,
        major: saved.major,
        interests: saved.electiveInterests,
      }));
      navigate("/connect-key");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save your study details.");
    } finally {
      setLoading(false);
    }
  };

  return <div className="relative flex min-h-[100dvh] items-center justify-center overflow-y-auto px-4 py-6 font-['Montserrat',sans-serif]">
    <img src={imgBg} className="fixed inset-0 h-full w-full object-cover" alt="" aria-hidden="true" />
    <div className="fixed inset-0 bg-[#050515]/65 backdrop-blur-[3px]" />
    <motion.form onSubmit={(event) => void submit(event)} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 my-auto w-full max-w-[680px] rounded-[30px] bg-white px-6 py-8 shadow-[0_28px_80px_rgba(0,0,0,0.32)] sm:px-12 sm:py-10">
      <div className="flex items-center justify-between gap-4">
        <img src={imgLogo} alt="Courseo" className="h-10 w-10" />
        <button type="button" onClick={() => void backToLogin()} disabled={loading || leaving} className="flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-bold text-[#000181] transition hover:bg-[#eef0ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#000181] disabled:opacity-50">
          <ArrowLeft size={16} />{leaving ? "Signing out…" : "Back to login"}
        </button>
      </div>
      <div className="mt-5 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef0ff] text-[#000181]"><GraduationCap size={27} /></span>
        <h1 className="mt-4 text-[34px] font-black tracking-[-1.2px] text-[#000181]">Set up your course</h1>
        <p className="mx-auto mt-2 max-w-md text-[13px] font-semibold leading-relaxed text-[rgba(0,1,129,0.62)]">Courseo uses these details to address you correctly and apply the right course rules to your study advice.</p>
      </div>

      <div className="mt-7 space-y-4">
        <label className="block text-[13px] font-extrabold text-[#000181]">Preferred name<input required value={name} onChange={(event) => setName(event.target.value)} className="mt-2 h-[50px] w-full rounded-[16px] border-2 border-[rgba(0,1,129,0.25)] px-4 text-[14px] font-semibold outline-none focus:border-[#000181]" /></label>

        <div className="rounded-[16px] border border-[rgba(0,1,129,0.16)] bg-[rgba(131,231,255,0.12)] px-4 py-3">
          <div className="flex items-center gap-3"><BookOpenCheck size={18} className="text-[#000181]" /><div><p className="text-[12px] font-extrabold text-[#000181]">766 — Bachelor of Computer Science</p><p className="mt-0.5 text-[11px] font-semibold text-[rgba(0,1,129,0.58)]">Courseo currently supports this course.</p></div></div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-[13px] font-extrabold text-[#000181]">Commencement year<select value={commencementYear} onChange={(event) => setCommencementYear(event.target.value)} className="mt-2 h-[50px] w-full rounded-[16px] border-2 border-[rgba(0,1,129,0.25)] bg-white px-4 text-[14px] font-semibold outline-none focus:border-[#000181]">{YEARS.map((year) => <option key={year} value={year}>{year}</option>)}</select></label>
          <label className="block text-[13px] font-extrabold text-[#000181]">Campus<select value={campus} onChange={(event) => setCampus(event.target.value as "Wollongong" | "Liverpool")} className="mt-2 h-[50px] w-full rounded-[16px] border-2 border-[rgba(0,1,129,0.25)] bg-white px-4 text-[14px] font-semibold outline-none focus:border-[#000181]"><option>Wollongong</option><option>Liverpool</option></select></label>
        </div>

        <label className="block text-[13px] font-extrabold text-[#000181]">Major<select value={major} onChange={(event) => setMajor(event.target.value)} className="mt-2 h-[50px] w-full rounded-[16px] border-2 border-[rgba(0,1,129,0.25)] bg-white px-4 text-[14px] font-semibold outline-none focus:border-[#000181]">{MAJORS.map((item) => <option key={item}>{item}</option>)}</select></label>
        <div className="rounded-[20px] border border-[rgba(0,1,129,0.14)] bg-[#fafaff] p-4 sm:p-5">
          <ElectiveInterestsField
            mode={electiveMode}
            interests={electiveInterests}
            onModeChange={(mode) => { setElectiveMode(mode); setError(""); }}
            onInterestsChange={(interests) => { setElectiveInterests(interests); setError(""); }}
          />
        </div>
        <p className="flex items-start gap-2 text-[11px] font-semibold leading-relaxed text-[rgba(0,1,129,0.55)]"><MapPin size={14} className="mt-0.5 shrink-0" />You can update your elective preferences later in Settings. Courseo will still confirm your course details when your enrolment record differs.</p>
      </div>

      {error && <p role="alert" className="mt-4 text-center text-[12px] font-semibold text-red-600">{error}</p>}
      <button type="submit" disabled={loading || leaving || !name.trim() || (electiveMode === "interest" && electiveInterests.length === 0)} className="mt-6 flex h-[54px] w-full items-center justify-center gap-2 rounded-[18px] bg-[#000181] text-[14px] font-extrabold text-white disabled:opacity-50">{loading ? <LoaderCircle size={18} className="animate-spin" /> : <ArrowRight size={18} />}{loading ? "Saving your course…" : "Continue to secure setup"}</button>
    </motion.form>
  </div>;
}
