import { isAgentRunResponse } from "@/agent/runtime-contract";
import type { AgentRunRequest, AgentRunResponse } from "@/types/agent";

const CLIENT_TIMEOUT_MS = 25_000;

export async function requestAgentRun(request: AgentRunRequest): Promise<AgentRunResponse> {
  const response = await fetch("/api/agent/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal: AbortSignal.timeout(CLIENT_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error("agent_request_failed");
  const result: unknown = await response.json();
  if (!isAgentRunResponse(result)) throw new Error("invalid_agent_response");
  return result;
}
