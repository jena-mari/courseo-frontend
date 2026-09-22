import { LoadingIndicator } from "../components/LoadingIndicator";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, KeyRound, ShieldAlert } from "lucide-react";
import imgBg from "../assets/courseo-bg.png";
import imgLogo from "../assets/courseo-logo.png";
import { ApiKeysPanel } from "../components/ApiKeysPanel";
import { getKeyProviders, usableProviderModels, type ProvidersResponse } from "../lib/keyApi";
import { accountStorage, STORAGE_KEYS } from "../lib/storageKeys";
import { ApiError } from "../lib/api";
import { useAuth } from "../auth/AuthContext";

export function ConnectKeyPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const storage = accountStorage(user?.id);
  const location = useLocation();
  const [providers, setProviders] = useState<ProvidersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorAction, setErrorAction] = useState<"retry" | "signin">("retry");
  const models = useMemo(() => usableProviderModels(providers), [providers]);
  const blockedDetail = (location.state as { detail?: string } | null)?.detail;
  const [model, setModel] = useState(storage.getItem(STORAGE_KEYS.selectedModel) ?? "");
  const hasUsableKey = models.length > 0;

  const load = async () => {
    setErrorAction("retry");
    try {
      const providerData = await getKeyProviders();
      const usableModels = usableProviderModels(providerData);
      setProviders(providerData);
      setModel((current) => usableModels.some((item) => item.name === current)
        ? current
        : usableModels.find((item) => item.name === providerData.default_model)?.name ?? usableModels[0]?.name ?? "");
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) setErrorAction("signin");
      setError(cause instanceof Error ? cause.message : "Courseo couldn’t load the available AI providers.");
    }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  const continueToChat = () => { if (model) storage.setItem(STORAGE_KEYS.selectedModel, model); navigate("/chat"); };
  const canContinue = hasUsableKey;

  return <div className="courseo-page-frame relative min-h-[100dvh] w-full px-4 py-6 font-['Montserrat',sans-serif]">
    <img src={imgBg} className="fixed inset-0 h-full w-full object-cover" alt="" aria-hidden="true" /><div className="fixed inset-0 bg-[#050515]/65 backdrop-blur-[3px]" />
    <main className="relative z-10 mx-auto my-auto w-full max-w-[660px] rounded-[30px] bg-white px-6 py-8 shadow-[0_28px_80px_rgba(0,0,0,0.32)] sm:px-10">
      <div className="flex items-center justify-between"><img src={imgLogo} alt="Courseo" className="h-10 w-10" /><span className="rounded-full bg-[#eef0ff] px-3 py-1.5 text-[10px] font-extrabold text-[#000181]">Secure setup</span></div>
      <div className="mt-6 text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef0ff] text-[#000181]"><KeyRound size={25} /></span><h1 className="mt-4 text-[34px] font-black tracking-tight text-[#000181]">Connect your AI provider</h1><p className="mx-auto mt-2 max-w-lg text-[13px] font-semibold leading-relaxed text-[rgba(0,1,129,0.6)]">Use your own API key so usage and provider costs stay under your control. Courseo encrypts it on the server and never returns the full key.</p></div>
      {loading ? <div className="courseo-loading-enter mt-8 flex items-start gap-3 rounded-[16px] border border-[rgba(0,1,129,0.1)] bg-[#f7f8ff] p-5 text-[#000181]" role="status" aria-live="polite"><LoadingIndicator size={20} /><div><p className="text-[13px] font-extrabold">Loading AI providers</p><p className="mt-1 text-[12px] leading-relaxed">Fetching available providers and secure key setup options…</p></div></div> : error ? <div role="alert" className="mt-6 rounded-[16px] bg-red-50 p-4 text-center"><p className="text-sm font-semibold text-red-700">{error}</p><button type="button" onClick={() => { if (errorAction === "signin") { void logout().finally(() => navigate("/", { replace: true, state: { authRequired: true, returnTo: "/connect-key" } })); return; } setLoading(true); setError(""); void load(); }} className="mt-3 rounded-[12px] bg-[#000181] px-4 py-2 text-[12px] font-extrabold text-white">{errorAction === "signin" ? "Log in again" : "Try again"}</button></div> : <>
        {blockedDetail && <div role="alert" className="mt-6 rounded-[15px] border border-amber-300 bg-amber-50 p-4 text-[12px] font-semibold leading-relaxed text-amber-900"><p className="font-extrabold">This chat needs an API key</p><p className="mt-1">{blockedDetail}</p></div>}
        <div className="mt-7"><ApiKeysPanel compact onConnected={() => void load()} /></div>
        {models.length > 0 && <label className="mt-5 block text-[12px] font-extrabold text-[#000181]">Model for new chats<select value={model} onChange={(event) => setModel(event.target.value)} className="mt-2 h-12 w-full rounded-[14px] border border-[rgba(0,1,129,0.2)] bg-white px-4 text-[13px] font-bold text-[#000181]">{models.map((item) => <option key={item.name} value={item.name}>{item.label} — {item.providerLabel}{item.priced ? " (may incur charges)" : ""}</option>)}</select></label>}
        {!hasUsableKey && <div role="alert" className="mt-4 flex items-start gap-3 rounded-[14px] border border-red-200 bg-red-50 p-4 text-red-800"><ShieldAlert size={18} className="mt-0.5 shrink-0" /><div><p className="text-[12px] font-extrabold">A verified API key is required</p><p className="mt-1 text-[11px] font-semibold leading-relaxed">Connect and verify a personal key above before starting a Courseo chat.</p></div></div>}
        <button onClick={continueToChat} disabled={!canContinue} className="mt-5 flex h-[54px] w-full items-center justify-center gap-2 rounded-[17px] bg-[#000181] text-[13px] font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40">{hasUsableKey ? "Continue with my key" : "Connect a key to continue"} <ArrowRight size={17} /></button>
      </>}
    </main>
  </div>;
}
