"use client";

import { useState } from "react";
import { evaluationSuite } from "@/data/evaluation-fixtures";
import { deterministicEvaluator } from "@/evaluation/evaluator";
import { EvaluationSummary } from "@/components/evaluation/evaluation-summary";
import { FailureCases } from "@/components/evaluation/failure-cases";
import { IterationComparison } from "@/components/evaluation/iteration-comparison";
import { MetricCard } from "@/components/evaluation/metric-card";
import { TestResults } from "@/components/evaluation/test-results";
import type { EvaluationRun } from "@/types/evaluation";

export function EvaluationDashboard({ initialRun }: { initialRun: EvaluationRun }) {
  const [run, setRun] = useState(initialRun);
  const [running, setRunning] = useState(false);

  async function rerun() {
    setRunning(true);
    const next = await deterministicEvaluator.evaluate(evaluationSuite);
    setRun(next);
    setRunning(false);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-5 py-7 md:px-8 md:py-9">
      <EvaluationSummary run={run} running={running} onRun={rerun} />
      <section>
        <div className="mb-3"><h2 className="text-sm font-semibold text-zinc-800">Experience metrics</h2><p className="mt-0.5 text-[10px] text-zinc-400">Seven equal-weighted dimensions, each scored from traceable assertions.</p></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{run.metricScores.map((metric) => <MetricCard key={metric.metric} metric={metric} />)}</div>
      </section>
      <TestResults results={run.results} />
      <div className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]"><FailureCases failures={run.failures} /><div className="space-y-6">{run.iterations.map((iteration) => <IterationComparison key={iteration.id} iteration={iteration} />)}</div></div>
      <p className="pb-2 text-center text-[9px] text-zinc-400">Fixture results are deterministic and read-only. Re-running does not change Tasks, Memory, or approvals.</p>
    </div>
  );
}
