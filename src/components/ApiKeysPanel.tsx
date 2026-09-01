import { useCallback, useEffect, useState } from "react";
import { Check, ExternalLink, KeyRound, LoaderCircle, Pencil, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";
import { addApiKey, deleteApiKey, getKeyProviders, getSavedKeys, updateApiKey, verifyApiKey, type KeyProvider, type SavedCredential } from "../lib/keyApi";

export function ApiKeysPanel({ compact = false, onConnected }: { compact?: boolean; onConnected?: () => void }) {
  const [providers, setProviders] = useState<KeyProvider[]>([]);
  const [keys, setKeys] = useState<SavedCredential[]>([]);
  const [provider, setProvider] = useState("");
  const [secret, setSecret] = useState("");
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState("");
  const [editLabel, setEditLabel] = useState("");
  const [replacement, setReplacement] = useState("");

  const load = useCallback(async () => {
    setBusy("loading"); setMessage("");
    try {
      const [providerData, saved] = await Promise.all([getKeyProviders(), getSavedKeys()]);
      setProviders(providerData.providers); setKeys(saved);
      setProvider((current) => current || providerData.providers[0]?.provider || "");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not load API keys."); }
    finally { setBusy(""); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const add = async () => {
    if (!provider || !secret.trim()) return;
    setBusy("add"); setMessage("");
    const rawKey = secret.trim(); setSecret("");
    try {
      const saved = await addApiKey({ provider, api_key: rawKey, label: label.trim() || undefined, make_default: true });
      setKeys((current) => [saved, ...current.filter((item) => item.id !== saved.id)]); setLabel("");
      setMessage("API key verified and saved securely."); onConnected?.();
    } catch (error) { setMessage(error instanceof Error ? error.message : "The provider rejected this API key."); }
    finally { setBusy(""); }
  };
  const verify = async (id: string) => { setBusy(id); try { const result = await verifyApiKey(id); setMessage(result.detail); await load(); } catch (error) { setMessage(error instanceof Error ? error.message : "Verification failed."); setBusy(""); } };
  const remove = async (id: string) => { if (!window.confirm("Remove this API key? Existing chats may stop working.")) return; setBusy(id); try { await deleteApiKey(id); setKeys((current) => current.filter((item) => item.id !== id)); setMessage("API key removed."); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not remove the key."); } finally { setBusy(""); } };
  const makeDefault = async (id: string) => { setBusy(id); try { await updateApiKey(id, { make_default: true }); await load(); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not update the default key."); setBusy(""); } };
  const saveEdit = async (id: string) => {
    const newSecret = replacement.trim();
    const changes = { ...(editLabel.trim() ? { label: editLabel.trim() } : {}), ...(newSecret ? { api_key: newSecret } : {}) };
    if (!Object.keys(changes).length) return;
    setReplacement(""); setBusy(id);
    try { const updated = await updateApiKey(id, changes); setKeys((current) => current.map((item) => item.id === id ? updated : item)); setEditingId(""); setEditLabel(""); setMessage("API key details updated."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not update the API key."); }
    finally { setBusy(""); }
  };
  const selectedProvider = providers.find((item) => item.provider === provider);

  return <div className={compact ? "space-y-4" : "space-y-5 px-5 py-5"}>
    <div className="rounded-[16px] border border-[rgba(0,1,129,0.14)] bg-[rgba(131,231,255,0.08)] p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-[12px] font-extrabold text-[#000181]">Provider<select value={provider} onChange={(event) => setProvider(event.target.value)} className="mt-1.5 h-11 w-full rounded-[13px] border border-[rgba(0,1,129,0.2)] bg-white px-3 font-semibold">{providers.map((item) => <option key={item.provider} value={item.provider}>{item.label}</option>)}</select></label>
        <label className="text-[12px] font-extrabold text-[#000181]">Label (optional)<input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="e.g. University account" className="mt-1.5 h-11 w-full rounded-[13px] border border-[rgba(0,1,129,0.2)] bg-white px-3 font-semibold outline-none" /></label>
      </div>
      <label className="mt-3 block text-[12px] font-extrabold text-[#000181]">API key<div className="mt-1.5 flex flex-col gap-2 sm:flex-row"><input type="password" autoComplete="off" value={secret} onChange={(event) => setSecret(event.target.value)} placeholder="Paste a new API key" className="h-11 min-w-0 flex-1 rounded-[13px] border border-[rgba(0,1,129,0.2)] bg-white px-3 font-semibold outline-none" /><button type="button" onClick={() => void add()} disabled={!secret.trim() || busy === "add"} className="flex h-11 items-center justify-center gap-2 rounded-[13px] bg-[#000181] px-5 text-[12px] font-extrabold text-white disabled:opacity-50">{busy === "add" ? <LoaderCircle size={15} className="animate-spin" /> : <KeyRound size={15} />} Connect key</button></div></label>
      {selectedProvider?.console_url && <a href={selectedProvider.console_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-[11px] font-extrabold text-[#000181] underline">Get a {selectedProvider.label} API key <ExternalLink size={11} /></a>}
      <p className="mt-2 text-[10px] font-semibold text-[rgba(0,1,129,0.52)]">The key is sent directly to Courseo over HTTPS, verified by the provider, and never stored in this browser.</p>
    </div>
    {message && <p role="status" className="rounded-[12px] bg-[#f3f4ff] px-3 py-2 text-[11px] font-semibold text-[#000181]">{message}</p>}
    {busy === "loading" ? <p className="flex items-center gap-2 text-[12px] font-semibold text-[#000181]"><LoaderCircle size={15} className="animate-spin" /> Loading keys…</p> : keys.length > 0 && <div className="space-y-2">{keys.map((key) => {
      const providerInfo = providers.find((item) => item.provider === key.provider);
      return <div key={key.id} className="rounded-[15px] border border-[rgba(0,1,129,0.12)] p-3"><div className="flex flex-wrap items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef0ff] text-[#000181]"><ShieldCheck size={17} /></span><div className="min-w-[150px] flex-1"><p className="text-[12px] font-extrabold text-[#000181]">{key.label || providerInfo?.label || key.provider} · ••••{key.last4}</p><p className="mt-0.5 text-[10px] font-semibold text-[rgba(0,1,129,0.5)]">{key.status}{key.is_default ? " · Default" : ""}</p></div>{!key.is_default && <button onClick={() => void makeDefault(key.id)} className="text-[10px] font-extrabold text-[#000181] underline">Make default</button>}<button onClick={() => { setEditingId(editingId === key.id ? "" : key.id); setEditLabel(key.label ?? ""); setReplacement(""); }} aria-label="Rename or replace key" className="rounded-lg p-2 text-[#000181] hover:bg-[#eef0ff]"><Pencil size={15} /></button><button onClick={() => void verify(key.id)} disabled={busy === key.id} aria-label="Verify key" className="rounded-lg p-2 text-[#000181] hover:bg-[#eef0ff]">{busy === key.id ? <LoaderCircle size={15} className="animate-spin" /> : <RefreshCw size={15} />}</button><button onClick={() => void remove(key.id)} aria-label="Remove key" className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={15} /></button></div>{editingId === key.id && <div className="mt-3 grid gap-2 border-t border-[rgba(0,1,129,0.1)] pt-3 sm:grid-cols-2"><input aria-label="Key label" value={editLabel} onChange={(event) => setEditLabel(event.target.value)} placeholder="New label" className="h-10 rounded-[12px] border border-[rgba(0,1,129,0.2)] px-3 text-[11px] font-semibold" /><input aria-label="Replacement API key" type="password" autoComplete="off" value={replacement} onChange={(event) => setReplacement(event.target.value)} placeholder="New key (leave blank to keep)" className="h-10 rounded-[12px] border border-[rgba(0,1,129,0.2)] px-3 text-[11px] font-semibold" /><button onClick={() => void saveEdit(key.id)} className="h-9 rounded-[11px] bg-[#000181] px-4 text-[11px] font-extrabold text-white sm:col-span-2">Save changes</button></div>}</div>;
    })}</div>}
    {keys.some((key) => key.status === "active") && <p className="flex items-center gap-2 text-[11px] font-bold text-emerald-700"><Check size={14} /> A usable personal key is connected.</p>}
  </div>;
}
