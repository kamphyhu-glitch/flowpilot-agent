import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { FailureCase } from "@/types/evaluation";

const severityStyles = {
  Low: "bg-sky-50 text-sky-700",
  Medium: "bg-amber-50 text-amber-700",
  High: "bg-orange-50 text-orange-700",
  Critical: "bg-rose-50 text-rose-700",
};

export function FailureCases({ failures }: { failures: FailureCase[] }) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-panel md:p-5">
      <div className="mb-4"><h2 className="text-sm font-semibold text-zinc-800">Failure cases</h2><p className="mt-0.5 text-[10px] text-zinc-400">Generated from failed assertions, plus versioned resolved history.</p></div>
      <div className="space-y-3">{failures.map((failure) => <article key={failure.id} className="rounded-xl border border-zinc-200 p-3.5">
        <div className="flex flex-wrap items-center gap-2"><span className={`flex items-center gap-1 rounded-md px-2 py-1 text-[8px] font-semibold uppercase ${failure.status === "resolved" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{failure.status === "resolved" ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}{failure.status}</span><span className="rounded-md bg-zinc-100 px-2 py-1 text-[8px] font-semibold text-zinc-600">{failure.failureType}</span><span className={`rounded-md px-2 py-1 text-[8px] font-semibold ${severityStyles[failure.severity]}`}>{failure.severity}</span><span className="ml-auto font-mono text-[8px] text-zinc-400">{failure.sourceTestCaseId}</span></div>
        <p className="mt-3 text-[10px] text-zinc-600"><span className="font-semibold text-zinc-700">Actual: </span>{failure.actualBehavior}</p>
        <div className="mt-3 grid gap-3 border-t border-zinc-100 pt-3 sm:grid-cols-2"><FailureDetail label="Root cause" value={failure.rootCause} /><FailureDetail label="Suggested fix" value={failure.suggestedFix} /></div>
      </article>)}</div>
    </section>
  );
}

function FailureDetail({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-zinc-400">{label}</p><p className="mt-1 text-[9px] leading-relaxed text-zinc-600">{value}</p></div>;
}
