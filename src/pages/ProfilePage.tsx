import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, GraduationCap } from "lucide-react";
import imgBg from "../assets/courseo-bg.png";
import imgLogo from "../assets/courseo-logo.png";
import { useAuth } from "../auth/AuthContext";
import { STORAGE_KEYS } from "../lib/storageKeys";

const DEGREES = ["Bachelor of Computer Science", "Bachelor of Information Technology", "Bachelor of Engineering", "Master of Information Technology", "Other"];

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.displayName ?? user?.username ?? "");
  const [degree, setDegree] = useState(DEGREES[0]);
  const [year, setYear] = useState("1");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const displayName = name.trim();
    if (user && displayName) updateUser({ ...user, displayName, username: displayName });
    localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify({ displayName, degree, year }));
    navigate("/chat");
  };
  return <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-4 py-6 font-['Montserrat',sans-serif]">
    <img src={imgBg} className="absolute inset-0 h-full w-full object-cover" alt="" aria-hidden="true" /><div className="absolute inset-0 bg-[#050515]/65 backdrop-blur-[3px]" />
    <motion.form onSubmit={submit} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-[590px] rounded-[30px] bg-white px-6 py-8 shadow-[0_28px_80px_rgba(0,0,0,0.32)] sm:px-12 sm:py-10">
      <img src={imgLogo} alt="Courseo" className="h-10 w-10" /><div className="mt-7 text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef0ff] text-[#000181]"><GraduationCap size={27} /></span><h1 className="mt-4 text-[36px] font-black tracking-[-1.2px] text-[#000181]">Complete your profile</h1><p className="mt-2 text-[13px] font-semibold text-[rgba(0,1,129,0.6)]">Tell Courseo a little about your studies before entering Chat.</p></div>
      <div className="mt-7 space-y-4">
        <label className="block text-[13px] font-extrabold text-[#000181]">Preferred name<input required value={name} onChange={(e) => setName(e.target.value)} className="mt-2 h-[50px] w-full rounded-[16px] border-2 border-[rgba(0,1,129,0.25)] px-4 text-[14px] font-semibold outline-none focus:border-[#000181]" /></label>
        <label className="block text-[13px] font-extrabold text-[#000181]">Degree<select value={degree} onChange={(e) => setDegree(e.target.value)} className="mt-2 h-[50px] w-full rounded-[16px] border-2 border-[rgba(0,1,129,0.25)] bg-white px-4 text-[14px] font-semibold outline-none focus:border-[#000181]">{DEGREES.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="block text-[13px] font-extrabold text-[#000181]">Year of study<select value={year} onChange={(e) => setYear(e.target.value)} className="mt-2 h-[50px] w-full rounded-[16px] border-2 border-[rgba(0,1,129,0.25)] bg-white px-4 text-[14px] font-semibold outline-none focus:border-[#000181]">{["1", "2", "3", "4", "5+"].map((item) => <option key={item} value={item}>Year {item}</option>)}</select></label>
      </div><button type="submit" className="mt-6 flex h-[54px] w-full items-center justify-center gap-2 rounded-[18px] bg-[#000181] text-[14px] font-extrabold text-white">Continue to Chat <ArrowRight size={18} /></button>
    </motion.form>
  </div>;
}
