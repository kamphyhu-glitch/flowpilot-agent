export type EvaluationMetric =
  | "intent_understanding"
  | "task_planning"
  | "tool_use"
  | "context_consistency"
  | "user_control"
  | "memory_compliance"
  | "constraint_compliance";

export type TestCategory =
  | "single_task"
  | "multi_task"
  | "time_constraint"
  | "hard_constraint"
  | "soft_preference"
  | "memory_recall"
  | "multi_turn_context"
  | "tool_use"
  | "conflicting_constraints"
  | "abnormal_input";

export type AssertionVerdict = "met" | "mostly_met" | "partial" | "mostly_failed" | "failed";
export type EvaluationStatus = "passed" | "partial" | "failed";
export type FailureType = "Intent Error" | "Planning Error" | "Tool Error" | "Memory Violation" | "Constraint Violation" | "Context Loss" | "UX Issue";
export type FailureSeverity = "Low" | "Medium" | "High" | "Critical";

export type EvaluationMemoryFixture = {
  type: "preference" | "goal" | "habit" | "recent_context";
  content: string;
  isHardConstraint: boolean;
};

export type EvaluationContextTurn = {
  role: "user" | "assistant";
  content: string;
};

export type FailureDefinition = {
  failureType: FailureType;
  severity: FailureSeverity;
  rootCause: string;
  suggestedFix: string;
};

export type EvaluationAssertion = {
  id: string;
  metric: EvaluationMetric;
  description: string;
  weight?: number;
  failure?: FailureDefinition;
};

export type EvaluationTestCase = {
  id: string;
  title: string;
  category: TestCategory;
  userInput: string;
  expectedBehavior: string;
  applicableMetrics: EvaluationMetric[];
  setup?: {
    memories?: EvaluationMemoryFixture[];
    previousTurns?: EvaluationContextTurn[];
    calendarEvents?: string[];
  };
  assertions: EvaluationAssertion[];
};

export type AssertionFixtureResult = {
  assertionId: string;
  verdict: AssertionVerdict;
  evidence: string;
};

export type EvaluationFixture = {
  testCaseId: string;
  actualBehavior: string;
  assertionResults: AssertionFixtureResult[];
};

export type EvaluatedAssertion = EvaluationAssertion & AssertionFixtureResult & { score: number };

export type CaseMetricScore = {
  metric: EvaluationMetric;
  score: number;
  assertionCount: number;
};

export type EvaluationCaseResult = {
  testCase: EvaluationTestCase;
  actualBehavior: string;
  assertions: EvaluatedAssertion[];
  metricScores: CaseMetricScore[];
  overallScore: number;
  status: EvaluationStatus;
};

export type MetricScore = CaseMetricScore & { caseCount: number };

export type FailureCase = {
  id: string;
  sourceTestCaseId: string;
  userInput: string;
  expectedBehavior: string;
  actualBehavior: string;
  failureType: FailureType;
  severity: FailureSeverity;
  rootCause: string;
  suggestedFix: string;
  createdAt: string;
  status: "open" | "resolved";
};

export type IterationCase = {
  id: string;
  failureCaseId: string;
  title: string;
  before: { behavior: string; score: number };
  rootCause: string;
  fix: string;
  after: { behavior: string; score: number };
  affectedMetrics: EvaluationMetric[];
};

export type EvaluationRun = {
  adapterId: string;
  adapterLabel: string;
  suiteVersion: string;
  evaluatedAt: string;
  overallScore: number;
  testCount: number;
  statusCounts: Record<EvaluationStatus, number>;
  metricScores: MetricScore[];
  results: EvaluationCaseResult[];
  failures: FailureCase[];
  iterations: IterationCase[];
};

export type EvaluationRunInput = {
  suiteVersion: string;
  evaluatedAt: string;
  cases: EvaluationTestCase[];
  fixtures: EvaluationFixture[];
  historicalFailures?: FailureCase[];
  iterations?: IterationCase[];
};

export interface EvaluatorAdapter {
  id: string;
  label: string;
  evaluate(input: EvaluationRunInput): Promise<EvaluationRun>;
}
