import { metricDefinitions } from "@/data/evaluation-cases";
import { failuresFromResult } from "@/evaluation/failure-mapper";
import { roundScore, scoreForMetric, statusForScore, verdictScores, weightedScore } from "@/evaluation/scoring";
import type {
  EvaluatedAssertion,
  EvaluationCaseResult,
  EvaluationMetric,
  EvaluationRun,
  EvaluationRunInput,
  EvaluatorAdapter,
  FailureCase,
} from "@/types/evaluation";

function evaluateCase(input: EvaluationRunInput, testCase: EvaluationRunInput["cases"][number]): EvaluationCaseResult {
  const fixture = input.fixtures.find((candidate) => candidate.testCaseId === testCase.id);
  const fixtureResults = new Map(fixture?.assertionResults.map((result) => [result.assertionId, result]));
  const assertions: EvaluatedAssertion[] = testCase.assertions.map((assertion) => {
    const fixtureResult = fixtureResults.get(assertion.id) ?? {
      assertionId: assertion.id,
      verdict: "failed" as const,
      evidence: "No fixture evidence was provided for this assertion.",
    };
    return { ...assertion, ...fixtureResult, score: verdictScores[fixtureResult.verdict] };
  });
  const metricScores = testCase.applicableMetrics.map((metric) => ({
    metric,
    score: scoreForMetric(assertions, metric),
    assertionCount: assertions.filter((assertion) => assertion.metric === metric).length,
  }));
  const overallScore = roundScore(metricScores.reduce((total, metric) => total + metric.score, 0) / Math.max(metricScores.length, 1));
  const hasSevereFailure = assertions.some(
    (assertion) => assertion.score <= 2 && (assertion.failure?.severity === "High" || assertion.failure?.severity === "Critical"),
  );

  return {
    testCase,
    actualBehavior: fixture?.actualBehavior ?? "No fixture output was provided.",
    assertions,
    metricScores,
    overallScore,
    status: statusForScore(overallScore, hasSevereFailure),
  };
}

function aggregateMetric(results: EvaluationCaseResult[], metric: EvaluationMetric) {
  const assertions = results.flatMap((result) => result.assertions.filter((assertion) => assertion.metric === metric));
  return {
    metric,
    score: weightedScore(assertions),
    assertionCount: assertions.length,
    caseCount: results.filter((result) => result.testCase.applicableMetrics.includes(metric)).length,
  };
}

export function runDeterministicEvaluation(input: EvaluationRunInput): EvaluationRun {
  const results = input.cases.map((testCase) => evaluateCase(input, testCase));
  const generatedFailures = results.flatMap((result) => failuresFromResult(result, input.evaluatedAt));
  const historical = input.historicalFailures ?? [];
  const failures: FailureCase[] = [...generatedFailures, ...historical];
  const metricScores = metricDefinitions.map(({ id }) => aggregateMetric(results, id));
  const overallScore = roundScore(metricScores.reduce((total, metric) => total + metric.score, 0) / metricScores.length);
  const statusCounts = results.reduce(
    (counts, result) => ({ ...counts, [result.status]: counts[result.status] + 1 }),
    { passed: 0, partial: 0, failed: 0 },
  );

  return {
    adapterId: "deterministic-v1",
    adapterLabel: "Deterministic Evaluator",
    suiteVersion: input.suiteVersion,
    evaluatedAt: input.evaluatedAt,
    overallScore,
    testCount: results.length,
    statusCounts,
    metricScores,
    results,
    failures,
    iterations: input.iterations ?? [],
  };
}

export const deterministicEvaluator: EvaluatorAdapter = {
  id: "deterministic-v1",
  label: "Deterministic Evaluator",
  async evaluate(input) {
    return runDeterministicEvaluation(input);
  },
};
