import { EvaluationDashboard } from "@/components/evaluation/evaluation-dashboard";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { evaluationSuite } from "@/data/evaluation-fixtures";
import { deterministicEvaluator } from "@/evaluation/evaluator";

export default async function EvaluationPage() {
  const initialRun = await deterministicEvaluator.evaluate(evaluationSuite);
  return <AppShell><PageHeader eyebrow="Quality" title="Evaluation" description="Reproducible experience scoring, failure analysis, and iteration evidence." /><EvaluationDashboard initialRun={initialRun} /></AppShell>;
}
