import { describe, expect, it } from "vitest";
import { executeAgentToolCall } from "@/tools/agent-tool-registry";

describe("agent tool registry", () => {
  it("executes read-only mock tools immediately", () => {
    const result = executeAgentToolCall({
      callId: "weather-1",
      name: "get_weather",
      arguments: JSON.stringify({ city: "Shenzhen" }),
    });
    expect(result.invocation.requiresApproval).toBe(false);
    expect(result.invocation.output.city).toBe("Shenzhen");
    expect(result.invocation.output.forecast).toBe("Light rain");
  });

  it("turns mutating calls into approval proposals without persistence", () => {
    const result = executeAgentToolCall({
      callId: "task-1",
      name: "create_task",
      arguments: JSON.stringify({ title: "SQL Learning", time: "10:00–11:00" }),
    });
    expect(result.invocation.requiresApproval).toBe(true);
    expect(result.invocation.output.status).toBe("pending_approval");
  });

  it("rejects unsupported tools and malformed arguments", () => {
    expect(() => executeAgentToolCall({ callId: "bad-1", name: "browse_web", arguments: "{}" }))
      .toThrow("unknown_tool");
    expect(() => executeAgentToolCall({ callId: "bad-2", name: "create_task", arguments: "{" }))
      .toThrow("invalid_tool_arguments");
  });
});
