import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, GraduationCap, LoaderCircle } from "lucide-react";
import imgBg from "../assets/courseo-bg.png";
import imgLogo from "../assets/courseo-logo.png";
import { useAuth } from "../auth/AuthContext";
import { ElectiveInterestsField, inferElectiveMode, type ElectiveRecommendationMode } from "../components/ElectiveInterestsField";
import { accountStorage, STORAGE_KEYS } from "../lib/storageKeys";

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile, loadProfile, logout } = useAuth();
  const storage = accountStorage(user?.id);
  const [name, setName] = useState(user?.displayName ?? user?.username ?? "");
  const [electiveInterests, setElectiveInterests] = useState(user?.electiveInterests ?? []);
  const [electiveMode, setElectiveMode] = useState<ElectiveRecommendationMode>(() => inferElectiveMode(user?.electiveInterests ?? []));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [leaving, setLeaving] = useState(false);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoadingProfile(true);
    setError("");
    void loadProfile(controller.signal).then((saved) => {
      if (controller.signal.aborted) return;
      setName(saved.displayName ?? "");
      setElectiveInterests(saved.electiveInterests);
      setElectiveMode(inferElectiveMode(saved.electiveInterests));
      setProfileLoaded(true);
    }).catch((cause) => {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Unable to load profile.");
    }).finally(() => { if (!controller.signal.aborted) setLoadingProfile(false); });
    return () => controller.abort();
  }, [loadProfile, loadAttempt]);

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
    if (!user || !displayName || loading || !profileLoaded) return;
    if (electiveMode === "interest" && electiveInterests.length === 0) {
      setError("Add at least one elective interest or choose degree-based recommendations.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const saved = await updateProfile({
        display_name: displayName,
        degree_code: "766",
        commencement_year: user.commencementYear ?? null,
        campus: user.campus ?? null,
        major: user.major ?? null,
        elective_interests: electiveMode === "interest" ? electiveInterests : [],
      });
      storage.setItem(STORAGE_KEYS.profile, JSON.stringify({
        displayName: saved.displayName,
        email: saved.email,
        degreeCode: saved.degreeCode,
        commencementYear: saved.commencementYear,
        campus: saved.campus,
        major: saved.major,
        interests: saved.electiveInterests,
      }));
      navigate("/connect-key");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save your preferences.");
    } finally {
      setLoading(false);
    }
  };

  return <div className="courseo-page-frame relative flex min-h-[100dvh] items-center justify-center overflow-y-auto px-4 py-6 font-['Montserrat',sans-serif]">
    <img src={imgBg} className="fixed inset-0 h-full w-full object-cover" alt="" aria-hidden="true" />
    <div className="fixed inset-0 bg-[#050515]/65 backdrop-blur-[3px]" />
    <motion.form onSubmit={(event) => void submit(event)} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 my-auto w-full max-w-[620px] rounded-[30px] bg-white px-6 py-8 shadow-[0_28px_80px_rgba(0,0,0,0.32)] sm:px-12 sm:py-10">
      <div className="flex items-center justify-between gap-4">
        <img src={imgLogo} alt="Courseo" className="h-10 w-10" />
        <button type="button" onClick={() => void backToLogin()} disabled={loading || leaving} className="flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-bold text-[#000181] transition hover:bg-[#eef0ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#000181] disabled:opacity-50">
          <ArrowLeft size={16} />{leaving ? "Signing out…" : "Back to login"}
        </button>
      </div>
      <div className="mt-5 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef0ff] text-[#000181]"><GraduationCap size={27} /></span>
        <h1 className="mt-4 text-[34px] font-black tracking-[-1.2px] text-[#000181]">Set up your account</h1>
        <p className="mx-auto mt-2 max-w-md text-[13px] font-semibold leading-relaxed text-[rgba(0,1,129,0.62)]">Tell us what to call you and what interests you. We’ll work through your course details together in chat.</p>
      </div>

      {loadingProfile && <p role="status" className="mt-4 text-center">Loading your profile…</p>}
      <fieldset disabled={loading || loadingProfile || !profileLoaded} className="mt-7 space-y-4 disabled:opacity-60">
        <label className="block text-[13px] font-extrabold text-[#000181]">Preferred name<input required maxLength={100} autoComplete="given-name" value={name} onChange={(event) => setName(event.target.value)} className="mt-2 h-[50px] w-full rounded-[16px] border-2 border-[rgba(0,1,129,0.25)] px-4 text-[14px] font-semibold outline-none focus:border-[#000181]" /></label>

        <div className="rounded-[20px] border border-[rgba(0,1,129,0.14)] bg-[#fafaff] p-4 sm:p-5">
          <ElectiveInterestsField
            mode={electiveMode}
            interests={electiveInterests}
            onModeChange={(mode) => { setElectiveMode(mode); setError(""); }}
            onInterestsChange={(interests) => { setElectiveInterests(interests); setError(""); }}
          />
        </div>
        <p className="text-[11px] font-semibold leading-relaxed text-[rgba(0,1,129,0.55)]">You can change your preferences in Settings. Your degree, campus, commencement year, and major will be confirmed in chat.</p>
      </fieldset>

      {!loadingProfile && !profileLoaded && <button type="button" onClick={() => setLoadAttempt((value) => value + 1)} className="mt-4 text-sm font-bold text-[#000181]">Retry loading profile</button>}
      {error && <p role="alert" className="mt-4 text-center text-[12px] font-semibold text-red-600">{error}</p>}
      <button type="submit" disabled={loading || leaving || loadingProfile || !profileLoaded || !name.trim() || (electiveMode === "interest" && electiveInterests.length === 0)} className="mt-6 flex h-[54px] w-full items-center justify-center gap-2 rounded-[18px] bg-[#000181] text-[14px] font-extrabold text-white disabled:opacity-50">{loading ? <LoaderCircle size={18} className="animate-spin" /> : <ArrowRight size={18} />}{loading ? "Saving your preferences…" : "Continue to secure setup"}</button>
    </motion.form>
  </div>;
}
