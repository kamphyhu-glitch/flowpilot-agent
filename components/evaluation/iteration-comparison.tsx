import { ArrowRight, Check, Wrench } from "lucide-react";
import { metricDefinitions } from "@/data/evaluation-cases";
import type { IterationCase } from "@/types/evaluation";

export function IterationComparison({ iteration }: { iteration: IterationCase }) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-panel md:p-5">
      <div className="mb-4"><p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-violet">Before / After iteration</p><h2 className="mt-1 text-sm font-semibold text-zinc-800">{iteration.title}</h2></div>
      <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-stretch">
        <Stage label="Before" value={iteration.before.behavior} score={iteration.before.score} tone="rose" />
        <Arrow />
        <Stage label="Root cause" value={iteration.rootCause} icon={<Wrench size={12} />} />
        <Arrow />
        <Stage label="Fix" value={iteration.fix} icon={<Wrench size={12} />} />
        <Arrow />
        <Stage label="After" value={iteration.after.behavior} score={iteration.after.score} tone="emerald" icon={<Check size={12} />} />
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">{iteration.affectedMetrics.map((metric) => <span key={metric} className="rounded-md bg-violet/10 px-2 py-1 text-[8px] font-semibold text-violet">{metricDefinitions.find((item) => item.id === metric)?.label}</span>)}</div>
    </section>
  );
}

function Arrow() { return <div className="hidden items-center text-zinc-300 lg:flex"><ArrowRight size={15} /></div>; }

function Stage({ label, value, score, tone, icon }: { label: string; value: string; score?: number; tone?: "rose" | "emerald"; icon?: React.ReactNode }) {
  const style = tone === "rose" ? "border-rose-100 bg-rose-50/50" : tone === "emerald" ? "border-emerald-100 bg-emerald-50/50" : "border-zinc-200 bg-zinc-50";
  return <div className={`rounded-xl border p-3 ${style}`}><div className="flex items-center justify-between"><p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-zinc-500">{label}</p>{score ? <span className="text-sm font-semibold text-zinc-700">{score.toFixed(1)}</span> : <span className="text-zinc-400">{icon}</span>}</div><p className="mt-3 text-[9px] leading-relaxed text-zinc-600">{value}</p></div>;
}
