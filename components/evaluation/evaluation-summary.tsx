import { CheckCircle2, FlaskConical, RotateCw, Sigma, TestTube2 } from "lucide-react";
import type { EvaluationRun } from "@/types/evaluation";

export function EvaluationSummary({ run, running, onRun }: { run: EvaluationRun; running: boolean; onRun: () => void }) {
  return (
    <section className="grid gap-3 lg:grid-cols-[1.25fr_.75fr_.75fr_.9fr]">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-panel">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-400">Overall score</p>
            <div className="mt-2 flex items-end gap-2"><span className="text-4xl font-semibold tracking-[-0.06em] text-zinc-900">{run.overallScore.toFixed(1)}</span><span className="mb-1 text-sm text-zinc-400">/ 5</span></div>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet/10 text-violet"><Sigma size={17} /></span>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-100"><div className="h-full rounded-full bg-violet" style={{ width: `${run.overallScore * 20}%` }} /></div>
      </div>
      <SummaryStat icon={TestTube2} label="Test count" value={String(run.testCount)} detail={`${run.statusCounts.passed} passed`} />
      <SummaryStat icon={CheckCircle2} label="Pass rate" value={`${Math.round((run.statusCounts.passed / run.testCount) * 100)}%`} detail={`${run.statusCounts.partial} partial · ${run.statusCounts.failed} failed`} />
      <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-4 shadow-panel">
        <div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600"><FlaskConical size={15} /></span><div><p className="text-[10px] font-semibold text-zinc-700">{run.adapterLabel}</p><p className="text-[9px] text-zinc-400">{run.suiteVersion}</p></div></div>
        <button type="button" onClick={onRun} disabled={running} className="mt-4 flex h-8 items-center justify-center gap-1.5 rounded-lg bg-ink px-3 text-[10px] font-semibold text-white transition hover:bg-zinc-700 disabled:bg-zinc-300"><RotateCw size={12} className={running ? "animate-spin" : ""} />{running ? "Running…" : "Run evaluation"}</button>
      </div>
    </section>
  );
}

function SummaryStat({ icon: Icon, label, value, detail }: { icon: typeof TestTube2; label: string; value: string; detail: string }) {
  return <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-panel"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500"><Icon size={15} /></span><p className="mt-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-400">{label}</p><p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-zinc-800">{value}</p><p className="mt-1 text-[9px] text-zinc-400">{detail}</p></div>;
}
