import type { AssertionVerdict, EvaluatedAssertion, EvaluationMetric, EvaluationStatus } from "@/types/evaluation";

export const verdictScores: Record<AssertionVerdict, number> = {
  met: 5,
  mostly_met: 4,
  partial: 3,
  mostly_failed: 2,
  failed: 1,
};

export function roundScore(value: number) {
  return Math.round(value * 10) / 10;
}

export function weightedScore(assertions: EvaluatedAssertion[]) {
  if (assertions.length === 0) return 0;
  const totalWeight = assertions.reduce((total, assertion) => total + (assertion.weight ?? 1), 0);
  if (totalWeight === 0) return 0;
  return roundScore(assertions.reduce((total, assertion) => total + assertion.score * (assertion.weight ?? 1), 0) / totalWeight);
}

export function scoreForMetric(assertions: EvaluatedAssertion[], metric: EvaluationMetric) {
  return weightedScore(assertions.filter((assertion) => assertion.metric === metric));
}

export function statusForScore(score: number, hasSevereFailure = false): EvaluationStatus {
  if (hasSevereFailure || score < 2.5) return "failed";
  if (score < 4) return "partial";
  return "passed";
}
