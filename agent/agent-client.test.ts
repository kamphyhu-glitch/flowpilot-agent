import { describe, expect, it, vi } from "vitest";
import { requestAgentRun } from "@/agent/agent-client";
import { runDeterministicAgent } from "@/agent/deterministic-adapter";
import type { AgentRunRequest } from "@/types/agent";

const request: AgentRunRequest = {
  userInput: "Plan one SQL study block tomorrow.",
  memories: [],
  tasks: [],
  timezone: "Asia/Shanghai",
};

describe("agent client", () => {
  it("sends a visitor key in a request header rather than the JSON body", async () => {
    const fetchImpl = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const body = String(init?.body);
      expect(body).not.toContain("sk-visitor-example-123");
      expect(new Headers(init?.headers).get("X-FlowPilot-DeepSeek-Key"))
        .toBe("sk-visitor-example-123");
      return Response.json(runDeterministicAgent(request, "Test response."));
    }) as typeof fetch;

    await requestAgentRun(request, "sk-visitor-example-123", fetchImpl);

    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it("omits the credential header when no visitor key is connected", async () => {
    const fetchImpl = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      expect(new Headers(init?.headers).has("X-FlowPilot-DeepSeek-Key")).toBe(false);
      return Response.json(runDeterministicAgent(request, "Test response."));
    }) as typeof fetch;

    await requestAgentRun(request, null, fetchImpl);
  });
});
