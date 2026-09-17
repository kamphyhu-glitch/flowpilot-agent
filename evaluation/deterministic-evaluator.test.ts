import { describe, expect, it } from "vitest";
import { evaluationSuite } from "@/data/evaluation-fixtures";
import { runDeterministicEvaluation } from "@/evaluation/deterministic-evaluator";
import { statusForScore, verdictScores, weightedScore } from "@/evaluation/scoring";
import type { EvaluatedAssertion, EvaluationRunInput } from "@/types/evaluation";

function assertion(score: number, weight = 1): EvaluatedAssertion {
  return {
    id: `score-${score}`,
    assertionId: `score-${score}`,
    metric: "task_planning",
    description: "Fixture assertion",
    verdict: "met",
    evidence: "Fixture evidence",
    score,
    weight,
  };
}

describe("deterministic evaluation scoring", () => {
  it("maps every verdict to the five-point scale", () => {
    expect(verdictScores).toEqual({ met: 5, mostly_met: 4, partial: 3, mostly_failed: 2, failed: 1 });
  });

  it("calculates weighted scores and rounds to one decimal", () => {
    expect(weightedScore([assertion(5, 2), assertion(2)])).toBe(4);
    expect(weightedScore([assertion(5), assertion(4), assertion(4)])).toBe(4.3);
  });

  it("applies the documented status boundaries", () => {
    expect(statusForScore(4)).toBe("passed");
    expect(statusForScore(3.9)).toBe("partial");
    expect(statusForScore(2.4)).toBe("failed");
    expect(statusForScore(5, true)).toBe("failed");
  });

  it("scores only the metrics applicable to each case", () => {
    const run = runDeterministicEvaluation(evaluationSuite);
    const singleTask = run.results.find((result) => result.testCase.id === "EV-001");
    expect(singleTask?.metricScores.map((metric) => metric.metric)).toEqual([
      "intent_understanding",
      "task_planning",
      "user_control",
    ]);
    expect(singleTask?.overallScore).toBe(5);
  });

  it("uses an equal-weighted average of the seven dashboard metrics", () => {
    const run = runDeterministicEvaluation(evaluationSuite);
    const expected = Math.round((run.metricScores.reduce((total, metric) => total + metric.score, 0) / 7) * 10) / 10;
    expect(run.metricScores).toHaveLength(7);
    expect(run.overallScore).toBe(expected);
  });

  it("generates open failures from failed assertions and retains resolved history", () => {
    const run = runDeterministicEvaluation(evaluationSuite);
    expect(run.failures).toEqual(expect.arrayContaining([
      expect.objectContaining({ sourceTestCaseId: "EV-014", failureType: "Planning Error", status: "open" }),
      expect.objectContaining({ sourceTestCaseId: "EV-004", failureType: "Constraint Violation", status: "resolved" }),
    ]));
  });

  it("is deterministic across repeated runs", () => {
    expect(runDeterministicEvaluation(evaluationSuite)).toEqual(runDeterministicEvaluation(evaluationSuite));
  });

  it("does not mutate evaluator input", () => {
    const input = structuredClone(evaluationSuite) as EvaluationRunInput;
    const before = structuredClone(input);
    runDeterministicEvaluation(input);
    expect(input).toEqual(before);
  });

  it("fails safely when assertion fixture evidence is missing", () => {
    const input = structuredClone(evaluationSuite) as EvaluationRunInput;
    input.fixtures[0].assertionResults = [];
    const result = runDeterministicEvaluation(input).results[0];
    expect(result.assertions.every((item) => item.score === 1)).toBe(true);
    expect(result.status).toBe("failed");
  });
});
