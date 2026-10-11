import { getScenario } from "@/agent/scenarios";
import type { AgentRunRequest, AgentRunResponse } from "@/types/agent";

export function runDeterministicAgent(
  request: AgentRunRequest,
  fallbackReason: string,
): AgentRunResponse {
  const scenario = getScenario(request.userInput, request.memories);
  return {
    scenario: {
      ...scenario,
      trace: {
        ...scenario.trace,
        executionNotes: [
          ...(scenario.trace.executionNotes ?? []),
          `Fallback mode: ${fallbackReason}`,
        ],
      },
    },
    runtime: {
      mode: "fallback",
      provider: "deterministic",
      fallbackReason,
    },
  };
}
