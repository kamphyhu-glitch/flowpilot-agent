import { BrainCircuit, ChevronDown, Target } from "lucide-react";
import type { AgentTrace as AgentTraceType } from "@/types/agent";
import { PanelHeading } from "@/components/agent/panel-heading";

export function AgentTrace({ trace }: { trace?: AgentTraceType }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-panel">
      <PanelHeading eyebrow="Why" title="Agent trace" meta={<BrainCircuit size={15} className="text-zinc-400" />} />
      {!trace ? (
        <div className="flex items-center gap-3 p-4 text-[11px] text-zinc-400"><Target size={16} /> Decisions and reasoning will appear here.</div>
      ) : (
        <div className="p-3">
          <div className="rounded-xl bg-ink p-3.5 text-white">
            <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-400">Decision</div>
            <p className="mt-1.5 text-xs font-medium leading-5">{trace.decision}</p>
          </div>
          <details className="group mt-2" open>
            <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-1 py-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-zinc-400">
              Evidence <ChevronDown size={12} className="transition group-open:rotate-180" />
            </summary>
            <div className="space-y-3 px-1 pb-1">
              <div><span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-zinc-400">Goal</span><p className="mt-1 text-[10px] leading-4 text-zinc-600">{trace.goal}</p></div>
              <div><span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-zinc-400">Constraints</span><div className="mt-1.5 flex flex-wrap gap-1">{trace.constraints.map((constraint) => <span key={constraint} className="rounded-md bg-zinc-100 px-1.5 py-1 text-[9px] text-zinc-600">{constraint}</span>)}</div></div>
              <div><span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-zinc-400">Tools used</span><p className="mt-1 text-[10px] leading-4 text-zinc-600">{trace.tools.join(" · ")}</p></div>
              <div><span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-zinc-400">Reasons</span><ul className="mt-1 space-y-1">{trace.reasons.map((reason) => <li key={reason} className="flex gap-2 text-[10px] leading-4 text-zinc-600"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-violet" />{reason}</li>)}</ul></div>
            </div>
          </details>
        </div>
      )}
    </section>
  );
}
