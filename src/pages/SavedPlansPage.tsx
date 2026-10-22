import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Pencil, Save, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { deleteSavedStudyPlan, listSavedStudyPlans, updateSavedStudyPlan, type SavedStudyPlan } from "../lib/savedPlansApi";
import { normalizeStudyPlanResponse } from "../types/studyPlanType";

export function SavedPlansPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SavedStudyPlan[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const selected = plans.find((plan) => plan.id === selectedId) ?? null;

  useEffect(() => {
    let active = true;
    void listSavedStudyPlans().then((items) => {
      if (!active) return;
      setPlans(items);
      if (items.length) {
        setSelectedId(items[0].id);
        setTitle(items[0].title);
        setDraft(JSON.stringify(items[0].plan, null, 2));
      }
    }).catch((cause) => {
      if (active) setError(cause instanceof Error ? cause.message : "Could not load saved plans.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const selectPlan = (plan: SavedStudyPlan) => {
    setSelectedId(plan.id);
    setTitle(plan.title);
    setDraft(JSON.stringify(plan.plan, null, 2));
    setEditing(false);
    setMessage("");
    setError("");
  };

  const saveChanges = async () => {
    if (!selected || !title.trim() || saving) return;
    let plan;
    try {
      plan = normalizeStudyPlanResponse(JSON.parse(draft));
      if (!plan) throw new Error("The plan needs at least one valid year, session, and subject list.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Check the study plan format.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const updated = await updateSavedStudyPlan(selected.id, { title: title.trim(), plan });
      setPlans((items) => items.map((item) => item.id === updated.id ? updated : item));
      setTitle(updated.title);
      setDraft(JSON.stringify(updated.plan, null, 2));
      setEditing(false);
      setMessage("Saved plan updated to your profile.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update the saved plan.");
    } finally {
      setSaving(false);
    }
  };

  const deleteSelected = async () => {
    if (!selected || saving || !window.confirm(`Delete “${selected.title}” from your saved plans?`)) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await deleteSavedStudyPlan(selected.id);
      const remaining = plans.filter((item) => item.id !== selected.id);
      setPlans(remaining);
      setSelectedId(remaining[0]?.id ?? null);
      setTitle(remaining[0]?.title ?? "");
      setDraft(remaining[0] ? JSON.stringify(remaining[0].plan, null, 2) : "");
      setEditing(false);
      setMessage("Saved plan deleted.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete the saved plan.");
    } finally {
      setSaving(false);
    }
  };

  return <main className="min-h-[100dvh] bg-[#f6f7ff] px-4 py-8 font-['Montserrat',sans-serif] text-[#000181] sm:px-8">
    <div className="mx-auto max-w-6xl">
      <button type="button" onClick={() => navigate("/chat")} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold hover:bg-white"><ArrowLeft size={17} /> Back to chat</button>
      <header className="mt-5 flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e5eaff]"><BookOpen size={22} /></span><div><h1 className="text-3xl font-black tracking-tight">Saved study plans</h1><p className="mt-1 text-sm font-medium text-[#000181]/60">Stored in your Courseo profile and available across sessions.</p></div></header>

      {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
      {message && <p role="status" className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">{message}</p>}
      {loading ? <p role="status" className="mt-8 text-sm font-semibold">Loading saved plans…</p> : plans.length === 0 ? <section className="mt-8 rounded-3xl border border-dashed border-[#000181]/20 bg-white p-10 text-center"><BookOpen size={28} className="mx-auto opacity-50" /><h2 className="mt-3 text-lg font-extrabold">No saved plans yet</h2><p className="mt-1 text-sm text-[#000181]/60">Plans saved to your profile will appear here.</p></section> : <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <nav aria-label="Saved study plans" className="space-y-2">{plans.map((plan) => <button key={plan.id} type="button" onClick={() => selectPlan(plan)} aria-current={plan.id === selectedId ? "true" : undefined} className={`w-full rounded-2xl border p-4 text-left transition ${plan.id === selectedId ? "border-[#000181] bg-white shadow-md" : "border-transparent bg-white/60 hover:bg-white"}`}><span className="block truncate text-sm font-extrabold">{plan.title}</span><span className="mt-1 block text-xs font-medium text-[#000181]/55">Updated {new Date(plan.updated_at).toLocaleDateString()}</span></button>)}</nav>
        {selected && <section className="min-w-0 rounded-3xl bg-white p-5 shadow-sm sm:p-7" aria-label={`Plan details: ${selected.title}`}>
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-black">{selected.title}</h2><p className="mt-1 text-xs font-medium text-[#000181]/55">Saved {new Date(selected.created_at).toLocaleDateString()}</p></div><div className="flex gap-2"><button type="button" onClick={() => { setEditing((value) => !value); setError(""); setMessage(""); }} className="inline-flex items-center gap-2 rounded-xl border border-[#000181]/20 px-4 py-2 text-xs font-extrabold hover:bg-[#f4f5ff]"><Pencil size={14} /> {editing ? "Cancel edit" : "Edit plan"}</button><button type="button" onClick={() => void deleteSelected()} disabled={saving} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-xs font-extrabold text-red-700 hover:bg-red-50 disabled:opacity-50"><Trash2 size={14} /> Delete plan</button></div></div>
          {editing ? <div className="mt-5 space-y-4"><label className="block text-xs font-extrabold">Plan name<input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} className="mt-2 h-11 w-full rounded-xl border border-[#000181]/20 px-3 text-sm outline-none focus:border-[#000181]" /></label><label className="block text-xs font-extrabold">Study plan data<textarea aria-label="Study plan data" value={draft} onChange={(event) => setDraft(event.target.value)} rows={18} spellCheck={false} className="mt-2 w-full rounded-xl border border-[#000181]/20 bg-[#fafbff] p-3 font-mono text-xs leading-relaxed outline-none focus:border-[#000181]" /><span className="mt-1 block font-medium text-[#000181]/50">Edit the years, sessions, or subjects using the displayed JSON format.</span></label><button type="button" onClick={() => void saveChanges()} disabled={saving || !title.trim()} className="inline-flex items-center gap-2 rounded-xl bg-[#000181] px-4 py-3 text-xs font-extrabold text-white disabled:opacity-50">{saving ? "Saving…" : <><Save size={15} /> Save changes</>}</button></div> : <div className="mt-5 space-y-4">{selected.plan.plan.map((year) => <section key={year.year} className="rounded-2xl bg-[#f8f9ff] p-4"><h3 className="text-lg font-black">{year.year}</h3><div className="mt-3 grid gap-3 md:grid-cols-2">{year.sessions.map((session) => <div key={`${year.year}-${session.session}`} className="rounded-xl border border-[#000181]/10 bg-white p-4"><h4 className="font-extrabold">{session.session}</h4><ul className="mt-2 space-y-1 text-sm">{session.subjects.map((subject, index) => <li key={`${subject.code}-${index}`}><span className="font-bold">{subject.code}</span> — {subject.name} <span className="text-[#000181]/50">({subject.cp} CP)</span></li>)}</ul></div>)}</div></section>)}</div>}
        </section>}
      </div>}
    </div>
  </main>;
}
