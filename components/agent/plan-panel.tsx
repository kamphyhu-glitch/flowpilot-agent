import { Check, Circle, LoaderCircle, Route, Sparkles } from "lucide-react";
import type { PlanStep } from "@/types/agent";
import { PanelHeading } from "@/components/agent/panel-heading";

export function PlanPanel({ steps, isRunning, progress }: { steps: PlanStep[]; isRunning: boolean; progress: number }) {
  const completed = steps.filter((step) => step.status === "completed").length;

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-panel">
      <PanelHeading
        eyebrow="Live execution"
        title="Task planning"
        meta={steps.length ? <span className="text-[10px] font-medium tabular-nums text-zinc-400">{completed}/{steps.length} steps</span> : undefined}
      />
      <div className="px-4 pt-4">
        <div className="mb-1.5 flex items-center justify-between text-[10px]">
          <span className={isRunning ? "font-medium text-violet" : "text-zinc-400"}>{isRunning ? "Agent is executing" : steps.length ? "Plan ready" : "Waiting for a goal"}</span>
          <span className="font-medium tabular-nums text-zinc-500">{progress}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
          <div className={`relative h-full rounded-full bg-gradient-to-r from-violet to-indigo-500 transition-[width] duration-500 ${isRunning ? "progress-sheen" : ""}`} style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="max-h-[470px] overflow-y-auto px-4 pb-4 pt-4 lg:max-h-[calc(100vh-280px)]">
        {steps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-50 text-zinc-300 ring-1 ring-zinc-100"><Route size={19} /></div>
            <p className="text-xs font-medium text-zinc-500">Your plan will appear here</p>
            <p className="mt-1 max-w-[210px] text-[11px] leading-4 text-zinc-400">You’ll see every step as the Agent works through it.</p>
          </div>
        ) : (
          <ol>
            {steps.map((step, index) => (
              <li key={step.id} className="relative flex gap-3 pb-4 last:pb-0">
                {index < steps.length - 1 && <span className={`absolute left-[11px] top-6 h-[calc(100%-15px)] w-px ${step.status === "completed" ? "bg-emerald-200" : "bg-zinc-200"}`} />}
                <span className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all ${
                  step.status === "completed" ? "border-emerald-200 bg-emerald-50 text-emerald-600" : step.status === "running" ? "border-violet bg-violet text-white shadow-[0_0_0_4px_rgba(102,88,232,.12)]" : "border-zinc-200 bg-white text-zinc-300"
                }`}>
                  {step.status === "completed" ? <Check size={12} strokeWidth={2.8} /> : step.status === "running" ? <LoaderCircle size={12} className="animate-spin" /> : <Circle size={7} fill="currentColor" strokeWidth={0} />}
                </span>
                <div className={`min-w-0 flex-1 rounded-xl border px-3 py-2.5 transition-all ${step.status === "running" ? "border-violet/25 bg-violet/[0.035]" : "border-transparent"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs font-medium ${step.status === "pending" ? "text-zinc-400" : "text-zinc-800"}`}>{step.title}</p>
                    {step.status === "running" && <span className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-violet"><Sparkles size={9} /> Running</span>}
                  </div>
                  <p className={`mt-0.5 text-[10px] leading-4 ${step.status === "pending" ? "text-zinc-300" : "text-zinc-500"}`}>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
