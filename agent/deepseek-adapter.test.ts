import { describe, expect, it } from "vitest";
import { runDeepSeekAgent } from "@/agent/deepseek-adapter";
import { runDeterministicAgent } from "@/agent/deterministic-adapter";
import type { AgentRunRequest } from "@/types/agent";

const request: AgentRunRequest = {
  userInput: "明天学习 SQL，但不要安排在 10 点前。",
  memories: [{
    id: "memory-hard-1",
    type: "preference",
    content: "Don't schedule anything before 10 AM.",
    isHardConstraint: true,
    source: "user",
    confidence: 1,
    createdAt: "2026-10-11T00:00:00.000Z",
    updatedAt: "2026-10-11T00:00:00.000Z",
  }],
  tasks: [],
  timezone: "Asia/Shanghai",
};

function jsonResponse(value: unknown) {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("DeepSeek agent adapter", () => {
  it("runs tool calls, synthesizes a plan, and enforces hard constraints", async () => {
    const responses = [
      {
        status: "completed",
        output: [
          { type: "function_call", call_id: "calendar-1", name: "get_calendar", arguments: "{\"date\":\"Tomorrow\"}" },
          { type: "function_call", call_id: "task-1", name: "create_task", arguments: "{\"title\":\"SQL Learning\",\"time\":\"09:30–10:30\"}" },
        ],
      },
      { status: "completed", output: [{ type: "message", content: [{ type: "output_text", text: "Tool review complete." }] }] },
      {
        status: "completed",
        output: [{
          type: "message",
          content: [{
            type: "output_text",
            text: JSON.stringify({
              id: "live-sql-plan",
              label: "SQL study plan",
              shortLabel: "SQL tomorrow",
              response: "I checked your calendar and prepared one SQL block for approval.",
              steps: [
                { id: "live-1", title: "Read scheduling context", description: "Check tomorrow's availability.", toolCallId: "calendar-1" },
                { id: "live-2", title: "Prepare SQL session", description: "Queue the study block for approval.", toolCallId: "task-1" },
              ],
              trace: {
                goal: "Study SQL tomorrow.",
                constraints: ["Do not schedule before 10 AM"],
                decision: "Use one focused morning block.",
                reasons: ["The calendar has an open morning window."],
                memoryInfluences: [{ memoryId: "memory-hard-1", effect: "Set the earliest allowed start to 10:00." }],
              },
            }),
          }],
        }],
      },
    ];
    const bodies: Array<Record<string, unknown>> = [];
    const fetchImpl = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      bodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
      return jsonResponse(responses.shift());
    }) as typeof fetch;
    const result = await runDeepSeekAgent(request, { apiKey: "test-key", fetchImpl });

    expect(result.runtime).toEqual({ mode: "live", provider: "deepseek", model: "deepseek-flash" });
    expect(result.scenario.steps[0].tool?.operation).toBe("get_calendar");
    expect(result.scenario.steps[1].tool?.input.time).toBe("10:00–11:00");
    expect(result.scenario.steps[1].tool?.requiresApproval).toBe(true);
    expect(result.scenario.trace.memoryInfluences[0].mode).toBe("hard_constraint");
    expect(JSON.stringify(bodies[1].input)).toContain("function_call_output");
    expect(bodies[2].text).toMatchObject({ format: { type: "json_schema" } });
  });

  it("rejects invalid structured output", async () => {
    const responses = [
      { status: "completed", output: [] },
      { status: "completed", output: [{ type: "message", content: [{ type: "output_text", text: "{}" }] }] },
    ];
    const fetchImpl = (async () => jsonResponse(responses.shift())) as typeof fetch;
    await expect(runDeepSeekAgent(request, { apiKey: "test-key", fetchImpl }))
      .rejects.toThrow("invalid_model_output");
  });
});

describe("deterministic adapter", () => {
  it("marks fallback mode and explains the reason", () => {
    const result = runDeterministicAgent(request, "Provider unavailable.");
    expect(result.runtime.mode).toBe("fallback");
    expect(result.scenario.trace.executionNotes).toContain("Fallback mode: Provider unavailable.");
  });
});
