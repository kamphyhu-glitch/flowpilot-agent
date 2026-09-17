import type { EvaluationCaseResult, FailureCase } from "@/types/evaluation";

export function failuresFromResult(result: EvaluationCaseResult, createdAt: string): FailureCase[] {
  return result.assertions.flatMap((assertion) => {
    if (assertion.score > 2 || !assertion.failure) return [];
    return [{
      id: `FAIL-${result.testCase.id}-${assertion.id}`,
      sourceTestCaseId: result.testCase.id,
      userInput: result.testCase.userInput,
      expectedBehavior: result.testCase.expectedBehavior,
      actualBehavior: result.actualBehavior,
      ...assertion.failure,
      createdAt,
      status: "open" as const,
    }];
  });
}
