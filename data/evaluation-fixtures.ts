import { evaluationCases } from "@/data/evaluation-cases";
import type { AssertionFixtureResult, EvaluationFixture, FailureCase, IterationCase } from "@/types/evaluation";

const actualBehaviors: Record<string, string> = {
  "EV-001": "Created one 10:00–11:00 SQL study proposal and placed create_task in Pending Approval.",
  "EV-002": "Separated interview preparation, SQL practice, and portfolio review into ordered blocks with 30-minute transitions.",
  "EV-003": "Kept the 15:00 Shenzhen interview fixed, estimated the route, and recommended leaving at 13:40 with buffer.",
  "EV-004": "Loaded the no-before-10 hard constraint, moved the draft from 09:30 to 10:00, and recorded the correction in Trace.",
  "EV-005": "Protected 12:00–13:30 and scheduled paper revision before lunch and SQL learning after it.",
  "EV-006": "Applied the lighter-schedule preference and left a 45-minute recovery block between preparation and SQL.",
  "EV-007": "Recalled the earlier lighter-schedule preference and kept Friday's plan intentionally sparse without prompting.",
  "EV-008": "Used the saved SQL goal to suggest a 90-minute practice block plus a 30-minute review buffer.",
  "EV-009": "Resolved the reference to interview preparation, moved it from 11:00 to 12:00, and staged the update for approval.",
  "EV-010": "Called Weather, Route, and Calendar reads before preparing Task and Calendar writes for approval.",
  "EV-011": "Prepared create_task with the requested context; the Tasks repository remained unchanged pending approval.",
  "EV-012": "Matched the existing SQL task and staged update_task for 16:00 without creating a duplicate.",
  "EV-013": "Displayed the conflict between 09:00 and the no-before-10 hard constraint, then requested an explicit override.",
  "EV-014": "Acknowledged the two-hour limit but compressed all three deliverables into short blocks instead of requesting a priority.",
  "EV-015": "Asked the user to provide a goal; no plan, approval, or tool activity was created.",
  "EV-016": "Asked what should be arranged and for which day; no tools or write actions were created.",
};

const overrides: Record<string, Record<string, Pick<AssertionFixtureResult, "verdict" | "evidence">>> = {
  "EV-009": {
    "EV-009-reference": { verdict: "mostly_met", evidence: "The previous task was resolved correctly, although the response did not quote its original time." },
  },
  "EV-014": {
    "EV-014-plan": { verdict: "mostly_failed", evidence: "The plan compressed five or more hours of estimated work into a two-hour window." },
    "EV-014-control": { verdict: "partial", evidence: "The agent mentioned prioritization but did not wait for the user's choice before proposing tasks." },
  },
};

export const evaluationFixtures: EvaluationFixture[] = evaluationCases.map((testCase) => ({
  testCaseId: testCase.id,
  actualBehavior: actualBehaviors[testCase.id],
  assertionResults: testCase.assertions.map((assertion) => ({
    assertionId: assertion.id,
    verdict: overrides[testCase.id]?.[assertion.id]?.verdict ?? "met",
    evidence: overrides[testCase.id]?.[assertion.id]?.evidence ?? `Observed: ${assertion.description}`,
  })),
}));

export const historicalFailures: FailureCase[] = [
  {
    id: "FAIL-HIST-001",
    sourceTestCaseId: "EV-004",
    userInput: "帮我安排明天的学习任务。",
    expectedBehavior: "Respect the stored hard constraint and schedule no task before 10:00.",
    actualBehavior: "Created SQL Learning at 09:30 despite the stored no-before-10 constraint.",
    failureType: "Constraint Violation",
    severity: "High",
    rootCause: "The draft plan reached Pending Approval without passing through the hard-constraint validator.",
    suggestedFix: "Validate every scheduled write against hard memories before creating approvals, then record any correction in Trace.",
    createdAt: "2026-09-10T09:30:00.000Z",
    status: "resolved",
  },
];

export const iterationCases: IterationCase[] = [
  {
    id: "ITER-001",
    failureCaseId: "FAIL-HIST-001",
    title: "Hard constraint validation before approval",
    before: { behavior: "SQL Learning created at 09:30.", score: 1 },
    rootCause: "The generated plan bypassed hard-constraint validation before entering Pending Approval.",
    fix: "Insert a validator between draft planning and approval. Auto-correct the time and expose the adjustment in Agent Trace.",
    after: { behavior: "SQL Learning moved to 10:00; the correction and influencing memory are visible in Trace.", score: 5 },
    affectedMetrics: ["memory_compliance", "constraint_compliance", "user_control"],
  },
];

export const evaluationSuite = {
  suiteVersion: "fixture-suite-v1",
  evaluatedAt: "2026-09-17T09:00:00.000Z",
  cases: evaluationCases,
  fixtures: evaluationFixtures,
  historicalFailures,
  iterations: iterationCases,
};
