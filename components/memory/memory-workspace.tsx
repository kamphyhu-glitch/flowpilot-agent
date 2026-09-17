"use client";

import { useState } from "react";
import { Brain, Flag, History, LockKeyhole, Pencil, Plus, Repeat2, Sparkles, Target, Trash2, X } from "lucide-react";
import { inferHardConstraint } from "@/agent/memory-planning";
import { addMemory, memoryRepository, updateMemory } from "@/data/persistent-store";
import { useMemories } from "@/data/use-persistent-data";
import type { Memory, MemoryType } from "@/types/persistent";

const sections: { type: MemoryType; title: string; description: string; icon: typeof Brain }[] = [
  { type: "preference", title: "Preferences", description: "How you prefer plans and decisions to feel.", icon: Sparkles },
  { type: "goal", title: "Goals", description: "Outcomes FlowPilot should keep in view.", icon: Target },
  { type: "habit", title: "Habits", description: "Patterns that shape realistic schedules.", icon: Repeat2 },
  { type: "recent_context", title: "Recent Context", description: "Short-lived details from recent work.", icon: History },
];

type Draft = { type: MemoryType; content: string; isHardConstraint: boolean; confidence: string };
const initialDraft: Draft = { type: "preference", content: "", isHardConstraint: false, confidence: "" };

export function MemoryWorkspace() {
  const memories = useMemories();
  const [draft, setDraft] = useState(initialDraft);
  const [editing, setEditing] = useState<Memory | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [hardTouched, setHardTouched] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function openCreate(type: MemoryType = "preference") {
    setEditing(null);
    setDraft({ ...initialDraft, type });
    setHardTouched(false);
    setShowForm(true);
  }

  function openEdit(memory: Memory) {
    setEditing(memory);
    setDraft({ type: memory.type, content: memory.content, isHardConstraint: memory.isHardConstraint, confidence: memory.confidence?.toString() ?? "" });
    setHardTouched(true);
    setShowForm(true);
  }

  function changeContent(content: string) {
    setDraft((current) => ({ ...current, content, isHardConstraint: hardTouched ? current.isHardConstraint : inferHardConstraint(content) }));
  }

  function save() {
    if (!draft.content.trim()) return;
    const confidence = draft.confidence === "" ? undefined : Math.max(0, Math.min(1, Number(draft.confidence)));
    if (editing) updateMemory(editing.id, { type: draft.type, content: draft.content.trim(), isHardConstraint: draft.isHardConstraint, confidence });
    else addMemory({ type: draft.type, content: draft.content.trim(), isHardConstraint: draft.isHardConstraint, source: "user", confidence });
    setShowForm(false);
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-7 md:px-8 md:py-9">
      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-5 shadow-panel sm:flex-row sm:items-center sm:justify-between">
        <div><div className="flex items-center gap-2 text-sm font-semibold text-zinc-800"><Brain size={16} className="text-violet" /> Persistent context</div><p className="mt-1 text-xs text-zinc-500">The Agent reads these memories before every plan. Hard constraints are always enforced.</p></div>
        <button type="button" onClick={() => openCreate()} className="flex h-8 items-center justify-center gap-1.5 rounded-lg bg-ink px-3 text-[11px] font-semibold text-white hover:bg-zinc-700"><Plus size={13} /> Add memory</button>
      </div>

      {showForm && (
        <section className="mb-5 rounded-2xl border border-violet/20 bg-white p-5 shadow-panel">
          <div className="mb-4 flex items-center justify-between"><div><h2 className="text-sm font-semibold">{editing ? "Edit memory" : "Add memory"}</h2><p className="mt-0.5 text-[10px] text-zinc-400">Automatic classification sets the initial suggestion. Your toggle always wins.</p></div><button type="button" onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-zinc-700"><X size={15} /></button></div>
          <div className="grid gap-4 md:grid-cols-[180px_1fr]">
            <label><span className="label">Type</span><select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as MemoryType })} className="input"><option value="preference">Preference</option><option value="goal">Goal</option><option value="habit">Habit</option><option value="recent_context">Recent Context</option></select></label>
            <label><span className="label">Memory</span><input value={draft.content} onChange={(event) => changeContent(event.target.value)} placeholder="e.g. Don't schedule anything before 10 AM" className="input" /></label>
            <label><span className="label">Confidence · optional</span><input type="number" min="0" max="1" step="0.01" value={draft.confidence} onChange={(event) => setDraft({ ...draft, confidence: event.target.value })} placeholder="0–1" className="input" /></label>
            <label className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2.5 ${draft.isHardConstraint ? "border-rose-200 bg-rose-50/50" : "border-zinc-200"}`}><div><div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-700"><LockKeyhole size={12} className={draft.isHardConstraint ? "text-rose-600" : "text-zinc-400"} /> Hard constraint</div><p className="mt-0.5 text-[9px] text-zinc-400">Must be satisfied before execution.</p></div><input type="checkbox" checked={draft.isHardConstraint} onChange={(event) => { setHardTouched(true); setDraft({ ...draft, isHardConstraint: event.target.checked }); }} className="h-4 w-4 accent-rose-600" /></label>
          </div>
          <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setShowForm(false)} className="h-8 rounded-lg border border-zinc-200 px-3 text-[10px] font-medium text-zinc-500">Cancel</button><button type="button" onClick={save} disabled={!draft.content.trim()} className="h-8 rounded-lg bg-ink px-3 text-[10px] font-semibold text-white disabled:bg-zinc-200">{editing ? "Save changes" : "Save memory"}</button></div>
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {sections.map((section) => {
          const sectionMemories = memories.filter((memory) => memory.type === section.type);
          const Icon = section.icon;
          return (
            <section key={section.type} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-panel">
              <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-4">
                <div className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600"><Icon size={14} /></span><div><h2 className="text-xs font-semibold text-zinc-800">{section.title}</h2><p className="mt-0.5 text-[9px] text-zinc-400">{section.description}</p></div></div>
                <button type="button" onClick={() => openCreate(section.type)} aria-label={`Add ${section.title}`} className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 hover:text-zinc-700"><Plus size={12} /></button>
              </div>
              {sectionMemories.length === 0 ? <div className="px-4 py-8 text-center text-[10px] text-zinc-400">No {section.title.toLocaleLowerCase()} saved yet.</div> : <div className="divide-y divide-zinc-100">{sectionMemories.map((memory) => (
                <article key={memory.id} className="group p-4">
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${memory.isHardConstraint ? "bg-rose-50 text-rose-600" : "bg-violet/10 text-violet"}`}>{memory.isHardConstraint ? <LockKeyhole size={13} /> : <Flag size={13} />}</span>
                    <div className="min-w-0 flex-1"><p className="text-[11px] font-medium leading-5 text-zinc-700">{memory.content}</p><div className="mt-2 flex flex-wrap items-center gap-1.5"><span className={`rounded-md px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.08em] ${memory.isHardConstraint ? "bg-rose-50 text-rose-700" : "bg-violet/10 text-violet"}`}>{memory.isHardConstraint ? "Hard constraint" : memory.type.replace("_", " ")}</span><span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[8px] font-medium text-zinc-500">{memory.source.replace("_", " ")}</span>{memory.confidence !== undefined && <span className="text-[8px] text-zinc-400">{Math.round(memory.confidence * 100)}% confidence</span>}</div></div>
                    <div className="flex shrink-0 gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100"><button type="button" onClick={() => openEdit(memory)} aria-label="Edit memory" className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700"><Pencil size={12} /></button>{deleteId === memory.id ? <div className="flex items-center"><button type="button" onClick={() => memoryRepository.remove(memory.id)} className="rounded-md bg-rose-600 px-2 py-1 text-[9px] font-semibold text-white">Delete</button><button type="button" onClick={() => setDeleteId(null)} className="h-7 px-1 text-zinc-400"><X size={11} /></button></div> : <button type="button" onClick={() => setDeleteId(memory.id)} aria-label="Delete memory" className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={12} /></button>}</div>
                  </div>
                </article>
              ))}</div>}
            </section>
          );
        })}
      </div>
    </div>
  );
}
