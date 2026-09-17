"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Check, CheckCircle2, Circle, Pencil, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { addTask, taskRepository, updateTask } from "@/data/persistent-store";
import { useTasks } from "@/data/use-persistent-data";
import type { Task } from "@/types/persistent";

type Filter = "all" | "todo" | "completed";

const initialDraft = { title: "", scheduleLabel: "", description: "" };

function formatCreated(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function TaskWorkspace() {
  const tasks = useTasks();
  const [filter, setFilter] = useState<Filter>("all");
  const [draft, setDraft] = useState(initialDraft);
  const [editing, setEditing] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(
    () => tasks.filter((task) => filter === "all" || task.status === filter).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [filter, tasks],
  );

  function openCreate() {
    setEditing(null);
    setDraft(initialDraft);
    setShowForm(true);
  }

  function openEdit(task: Task) {
    setEditing(task);
    setDraft({ title: task.title, scheduleLabel: task.scheduleLabel ?? "", description: task.description ?? "" });
    setShowForm(true);
  }

  function save() {
    if (!draft.title.trim()) return;
    if (editing) {
      updateTask(editing.id, { title: draft.title.trim(), scheduleLabel: draft.scheduleLabel.trim() || undefined, description: draft.description.trim() || undefined });
    } else {
      addTask({ title: draft.title.trim(), scheduleLabel: draft.scheduleLabel.trim() || undefined, description: draft.description.trim() || undefined, status: "todo", source: "user" });
    }
    setShowForm(false);
    setEditing(null);
    setDraft(initialDraft);
  }

  function toggleTask(task: Task) {
    const completed = task.status !== "completed";
    updateTask(task.id, { status: completed ? "completed" : "todo", completedAt: completed ? new Date().toISOString() : undefined });
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-7 md:px-8 md:py-9">
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Stat label="Total tasks" value={tasks.length} />
        <Stat label="Open" value={tasks.filter((task) => task.status === "todo").length} />
        <Stat label="Completed" value={tasks.filter((task) => task.status === "completed").length} />
      </div>

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-panel">
        <div className="flex flex-col gap-3 border-b border-zinc-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
          <div className="flex gap-1 rounded-lg bg-zinc-100 p-1">
            {(["all", "todo", "completed"] as const).map((item) => (
              <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-md px-3 py-1.5 text-[10px] font-semibold capitalize transition ${filter === item ? "bg-white text-zinc-800 shadow-sm" : "text-zinc-400 hover:text-zinc-600"}`}>{item === "todo" ? "Open" : item}</button>
            ))}
          </div>
          <button type="button" onClick={openCreate} className="flex h-8 items-center justify-center gap-1.5 rounded-lg bg-ink px-3 text-[11px] font-semibold text-white hover:bg-zinc-700"><Plus size={13} /> New task</button>
        </div>

        {showForm && (
          <div className="border-b border-violet/10 bg-violet/[0.025] p-4 md:p-5">
            <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold">{editing ? "Edit task" : "Create task"}</h2><button type="button" onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-zinc-700"><X size={15} /></button></div>
            <div className="grid gap-3 md:grid-cols-[1.2fr_.8fr]">
              <Field label="Title"><input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="What needs to happen?" className="input" /></Field>
              <Field label="Schedule"><input value={draft.scheduleLabel} onChange={(event) => setDraft({ ...draft, scheduleLabel: event.target.value })} placeholder="e.g. Tomorrow · 10:00–11:00" className="input" /></Field>
              <div className="md:col-span-2"><Field label="Description"><input value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Optional context" className="input" /></Field></div>
            </div>
            <div className="mt-3 flex justify-end gap-2"><button type="button" onClick={() => setShowForm(false)} className="h-8 rounded-lg border border-zinc-200 px-3 text-[10px] font-medium text-zinc-500">Cancel</button><button type="button" onClick={save} disabled={!draft.title.trim()} className="h-8 rounded-lg bg-ink px-3 text-[10px] font-semibold text-white disabled:bg-zinc-200">{editing ? "Save changes" : "Create task"}</button></div>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-20 text-center"><span className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-50 text-zinc-300 ring-1 ring-zinc-100"><CheckCircle2 size={20} /></span><p className="text-sm font-medium text-zinc-600">No tasks here yet</p><p className="mt-1 text-xs text-zinc-400">Create one yourself or approve an Agent action.</p></div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {filtered.map((task) => (
              <article key={task.id} className="group flex items-start gap-3 px-4 py-4 transition hover:bg-zinc-50/70 md:px-5">
                <button type="button" onClick={() => toggleTask(task)} aria-label={task.status === "completed" ? "Reopen task" : "Complete task"} className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${task.status === "completed" ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-zinc-200 text-zinc-300 hover:border-violet hover:text-violet"}`}>{task.status === "completed" ? <Check size={12} strokeWidth={3} /> : <Circle size={7} fill="currentColor" strokeWidth={0} />}</button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><h3 className={`text-sm font-medium ${task.status === "completed" ? "text-zinc-400 line-through" : "text-zinc-800"}`}>{task.title}</h3><span className={`rounded-md px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.08em] ${task.source === "agent" ? "bg-violet/10 text-violet" : "bg-zinc-100 text-zinc-500"}`}>{task.source}</span><span className={`rounded-md px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.08em] ${task.status === "completed" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-700"}`}>{task.status}</span></div>
                  {task.description && <p className="mt-1 text-[10px] text-zinc-500">{task.description}</p>}
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-zinc-400">{task.scheduleLabel && <span className="flex items-center gap-1"><CalendarClock size={10} />{task.scheduleLabel}</span>}<span>Created {formatCreated(task.createdAt)}</span>{task.sourceRunId && <span className="font-mono">{task.sourceRunId}</span>}</div>
                </div>
                <div className="flex shrink-0 items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                  <button type="button" onClick={() => openEdit(task)} aria-label="Edit task" className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-white hover:text-zinc-700"><Pencil size={12} /></button>
                  {deleteId === task.id ? <div className="flex items-center gap-1"><button type="button" onClick={() => taskRepository.remove(task.id)} className="rounded-md bg-rose-600 px-2 py-1 text-[9px] font-semibold text-white">Delete</button><button type="button" onClick={() => setDeleteId(null)} className="flex h-7 w-7 items-center justify-center text-zinc-400"><X size={12} /></button></div> : <button type="button" onClick={() => setDeleteId(task.id)} aria-label="Delete task" className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={12} /></button>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      {tasks.some((task) => task.status === "completed") && <button type="button" onClick={() => tasks.filter((task) => task.status === "completed").forEach((task) => updateTask(task.id, { status: "todo", completedAt: undefined }))} className="mt-3 flex items-center gap-1.5 text-[10px] font-medium text-zinc-400 hover:text-zinc-700"><RotateCcw size={11} /> Reopen all completed</button>}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-panel"><div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-400">{label}</div><div className="mt-1 text-xl font-semibold tracking-[-0.03em] text-zinc-800">{value}</div></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-400">{label}</span>{children}</label>;
}
