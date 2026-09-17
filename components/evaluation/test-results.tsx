"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { metricDefinitions } from "@/data/evaluation-cases";
import type { EvaluationCaseResult, EvaluationStatus } from "@/types/evaluation";

type StatusFilter = "all" | EvaluationStatus;

const statusStyles: Record<EvaluationStatus, string> = {
  passed: "bg-emerald-50 text-emerald-700",
  partial: "bg-amber-50 text-amber-700",
  failed: "bg-rose-50 text-rose-700",
};

const verdictStyles = {
  met: "bg-emerald-50 text-emerald-700",
  mostly_met: "bg-sky-50 text-sky-700",
  partial: "bg-amber-50 text-amber-700",
  mostly_failed: "bg-orange-50 text-orange-700",
  failed: "bg-rose-50 text-rose-700",
};

export function TestResults({ results }: { results: EvaluationCaseResult[] }) {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(results[0]?.testCase.id ?? null);
  const visible = useMemo(() => results.filter((result) => filter === "all" || result.status === filter), [filter, results]);

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-panel">
      <div className="flex flex-col gap-3 border-b border-zinc-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
        <div><h2 className="text-sm font-semibold text-zinc-800">Test results</h2><p className="mt-0.5 text-[10px] text-zinc-400">Expand a case to inspect expected behavior, output, and scoring evidence.</p></div>
        <div className="flex gap-1 rounded-lg bg-zinc-100 p-1">{(["all", "passed", "partial", "failed"] as const).map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-md px-2.5 py-1.5 text-[9px] font-semibold capitalize ${filter === item ? "bg-white text-zinc-800 shadow-sm" : "text-zinc-400"}`}>{item}</button>)}</div>
      </div>
      <div className="divide-y divide-zinc-100">
        {visible.map((result) => {
          const expanded = expandedId === result.testCase.id;
          return <article key={result.testCase.id}>
            <button type="button" onClick={() => setExpandedId(expanded ? null : result.testCase.id)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-zinc-50/70 md:px-5">
              <span className="text-zinc-300">{expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
              <span className="w-14 shrink-0 font-mono text-[9px] text-zinc-400">{result.testCase.id}</span>
              <span className="min-w-0 flex-1"><span className="block truncate text-xs font-medium text-zinc-700">{result.testCase.title}</span><span className="mt-0.5 block text-[8px] uppercase tracking-[0.1em] text-zinc-400">{result.testCase.category.replaceAll("_", " ")}</span></span>
              <span className="text-sm font-semibold text-zinc-700">{result.overallScore.toFixed(1)}</span>
              <span className={`w-14 rounded-md py-1 text-center text-[8px] font-semibold uppercase ${statusStyles[result.status]}`}>{result.status}</span>
            </button>
            {expanded && <div className="border-t border-zinc-100 bg-zinc-50/60 px-4 py-4 md:px-12">
              <div className="grid gap-3 lg:grid-cols-3">
                <Detail label="User input" value={result.testCase.userInput || "(Empty input)"} />
                <Detail label="Expected behavior" value={result.testCase.expectedBehavior} />
                <Detail label="Actual behavior" value={result.actualBehavior} />
              </div>
              <div className="mt-4 space-y-2">{result.assertions.map((assertion) => <div key={assertion.id} className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-3 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-[10px] font-medium text-zinc-700">{assertion.description}</span><span className="text-[8px] text-zinc-400">{metricDefinitions.find((metric) => metric.id === assertion.metric)?.label}</span></div><p className="mt-1 text-[9px] text-zinc-400">{assertion.evidence}</p></div><span className={`shrink-0 rounded-md px-2 py-1 text-[8px] font-semibold uppercase ${verdictStyles[assertion.verdict]}`}>{assertion.verdict.replaceAll("_", " ")} · {assertion.score}</span></div>)}</div>
            </div>}
          </article>;
        })}
      </div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-zinc-200 bg-white p-3"><p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-zinc-400">{label}</p><p className="mt-2 text-[10px] leading-relaxed text-zinc-600">{value}</p></div>;
}
