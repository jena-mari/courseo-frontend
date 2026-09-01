import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, KeyRound, LoaderCircle, ShieldCheck } from "lucide-react";
import imgBg from "../assets/courseo-bg.png";
import imgLogo from "../assets/courseo-logo.png";
import { ApiKeysPanel } from "../components/ApiKeysPanel";
import { allProviderModels, getKeyProviders, getSavedKeys, type ProvidersResponse, type SavedCredential } from "../lib/keyApi";
import { STORAGE_KEYS } from "../lib/storageKeys";

export function ConnectKeyPage() {
  const navigate = useNavigate();
  const [providers, setProviders] = useState<ProvidersResponse | null>(null);
  const [keys, setKeys] = useState<SavedCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const models = useMemo(() => allProviderModels(providers), [providers]);
  const [model, setModel] = useState(localStorage.getItem(STORAGE_KEYS.selectedModel) ?? "");
  const hasUsableKey = keys.some((key) => key.status === "active");

  const load = async () => {
    try {
      const [providerData, saved] = await Promise.all([getKeyProviders(), getSavedKeys()]);
      setProviders(providerData); setKeys(saved);
      setModel((current) => current || providerData.default_model || providerData.providers[0]?.default_model || "");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load AI providers."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  const continueToChat = () => { if (model) localStorage.setItem(STORAGE_KEYS.selectedModel, model); navigate("/chat"); };
  const canContinue = hasUsableKey || Boolean(providers?.system_fallback_enabled);

  return <div className="relative flex min-h-[100dvh] items-center justify-center overflow-y-auto px-4 py-6 font-['Montserrat',sans-serif]">
    <img src={imgBg} className="fixed inset-0 h-full w-full object-cover" alt="" aria-hidden="true" /><div className="fixed inset-0 bg-[#050515]/65 backdrop-blur-[3px]" />
    <main className="relative z-10 w-full max-w-[720px] rounded-[30px] bg-white px-6 py-8 shadow-[0_28px_80px_rgba(0,0,0,0.32)] sm:px-10">
      <div className="flex items-center justify-between"><img src={imgLogo} alt="Courseo" className="h-10 w-10" /><span className="rounded-full bg-[#eef0ff] px-3 py-1.5 text-[10px] font-extrabold text-[#000181]">Secure setup</span></div>
      <div className="mt-6 text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef0ff] text-[#000181]"><KeyRound size={25} /></span><h1 className="mt-4 text-[34px] font-black tracking-tight text-[#000181]">Connect your AI provider</h1><p className="mx-auto mt-2 max-w-lg text-[13px] font-semibold leading-relaxed text-[rgba(0,1,129,0.6)]">Use your own API key so usage and provider costs stay under your control. Courseo encrypts it on the server and never returns the full key.</p></div>
      {loading ? <p className="mt-8 flex items-center justify-center gap-2 text-sm font-bold text-[#000181]"><LoaderCircle className="animate-spin" size={18} /> Loading providers…</p> : error ? <p role="alert" className="mt-6 text-center text-sm font-semibold text-red-600">{error}</p> : <>
        <div className="mt-7"><ApiKeysPanel compact onConnected={() => void load()} /></div>
        {models.length > 0 && <label className="mt-5 block text-[12px] font-extrabold text-[#000181]">Model for new chats<select value={model} onChange={(event) => setModel(event.target.value)} className="mt-2 h-12 w-full rounded-[14px] border border-[rgba(0,1,129,0.2)] bg-white px-4 text-[13px] font-bold text-[#000181]">{models.map((item) => <option key={item.name} value={item.name}>{item.label} — {item.providerLabel}{item.priced ? " (may incur charges)" : ""}</option>)}</select></label>}
        {providers?.system_fallback_enabled && !hasUsableKey && <p className="mt-4 flex items-start gap-2 rounded-[14px] bg-[#fff8dd] p-3 text-[11px] font-semibold text-[#72520b]"><ShieldCheck size={16} className="shrink-0" /> You can continue with Courseo's system fallback and add a personal key later in Settings.</p>}
        <button onClick={continueToChat} disabled={!canContinue} className="mt-5 flex h-[54px] w-full items-center justify-center gap-2 rounded-[17px] bg-[#000181] text-[13px] font-extrabold text-white disabled:opacity-40">{hasUsableKey ? "Continue with my key" : "Continue with Courseo fallback"} <ArrowRight size={17} /></button>
      </>}
    </main>
  </div>;
}
