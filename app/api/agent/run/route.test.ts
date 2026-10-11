import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runDeepSeekAgent } from "@/agent/deepseek-adapter";
import { runDeterministicAgent } from "@/agent/deterministic-adapter";
import { POST } from "@/app/api/agent/run/route";
import type { AgentRunRequest } from "@/types/agent";

vi.mock("@/agent/deepseek-adapter", () => ({ runDeepSeekAgent: vi.fn() }));

const requestBody: AgentRunRequest = {
  userInput: "Plan one SQL block tomorrow.",
  memories: [],
  tasks: [],
  timezone: "Asia/Shanghai",
};

function agentRequest(visitorKey: string) {
  return new Request("http://localhost/api/agent/run", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Host: "localhost",
      Origin: "http://localhost",
      "X-FlowPilot-DeepSeek-Key": visitorKey,
    },
    body: JSON.stringify(requestBody),
  });
}

describe("visitor credential route", () => {
  beforeEach(() => {
    vi.stubEnv("DEEPSEEK_API_KEY", "sk-deployment-example-123");
    vi.mocked(runDeepSeekAgent).mockResolvedValue({
      scenario: runDeterministicAgent(requestBody, "Fixture scenario.").scenario,
      runtime: { mode: "live", provider: "deepseek", model: "deepseek-flash" },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("uses the visitor key for this request and labels its source", async () => {
    const response = await POST(agentRequest("sk-visitor-example-123"));
    const result = await response.json();

    expect(runDeepSeekAgent).toHaveBeenCalledWith(requestBody, expect.objectContaining({
      apiKey: "sk-visitor-example-123",
    }));
    expect(result.runtime).toMatchObject({
      mode: "live",
      credentialSource: "visitor",
    });
  });

  it("does not fall through to the deployment key when the visitor key is invalid", async () => {
    const response = await POST(agentRequest("invalid key"));
    const result = await response.json();

    expect(runDeepSeekAgent).not.toHaveBeenCalled();
    expect(result.runtime.mode).toBe("fallback");
    expect(result.runtime.fallbackReason).toContain("visitor DeepSeek key is invalid");
  });
});
