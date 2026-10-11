import { isAgentRunResponse } from "@/agent/runtime-contract";
import { DEEPSEEK_KEY_HEADER } from "@/agent/deepseek-credentials";
import type { AgentRunRequest, AgentRunResponse } from "@/types/agent";

const CLIENT_TIMEOUT_MS = 25_000;

export async function requestAgentRun(
  request: AgentRunRequest,
  visitorApiKey: string | null = null,
  fetchImpl: typeof fetch = fetch,
): Promise<AgentRunResponse> {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (visitorApiKey) headers.set(DEEPSEEK_KEY_HEADER, visitorApiKey);
  const response = await fetchImpl("/api/agent/run", {
    method: "POST",
    headers,
    body: JSON.stringify(request),
    signal: AbortSignal.timeout(CLIENT_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error("agent_request_failed");
  const result: unknown = await response.json();
  if (!isAgentRunResponse(result)) throw new Error("invalid_agent_response");
  return result;
}
