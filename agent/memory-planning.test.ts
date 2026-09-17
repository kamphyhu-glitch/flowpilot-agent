import { describe, expect, it } from "vitest";
import { applyMemoryToScenario, enforceTimeFloor, inferHardConstraint, inferMemoryFromPrompt } from "@/agent/memory-planning";
import type { AgentScenario } from "@/types/agent";
import type { Memory } from "@/types/persistent";
import { mockTool } from "@/tools/mock-tools";

const base: AgentScenario = {
  id: "test-plan",
  label: "Test",
  shortLabel: "Test",
  prompt: "Plan",
  response: "Planning",
  steps: [{ id: "one", title: "Early task", description: "Test", tool: mockTool("create_task", { title: "Focus", time: "09:00–10:00" }, { task: "Created", time: "09:00–10:00" }, "Create Focus · 09:00–10:00") }],
  trace: { goal: "Test", constraints: [], tools: ["Task Tool"], decision: "Test", reasons: [], memoryInfluences: [] },
};

function memory(overrides: Partial<Memory> = {}): Memory {
  return { id: "memory-1", type: "preference", content: "不要安排10点前任务", isHardConstraint: true, source: "user", createdAt: "2026-01-01", updatedAt: "2026-01-01", ...overrides };
}

describe("memory planning", () => {
  it("classifies mandatory language but keeps ordinary dislike language soft", () => {
    expect(inferHardConstraint("不要安排10点前任务")).toBe(true);
    expect(inferHardConstraint("I must not work before 10 AM")).toBe(true);
    expect(inferHardConstraint("我不喜欢日程太满")).toBe(false);
  });

  it("preserves duration when enforcing a time floor", () => {
    expect(enforceTimeFloor("09:15–10:45", 10)).toBe("10:00–11:30");
  });

  it("corrects a violating plan and explains the hard constraint", () => {
    const result = applyMemoryToScenario(base, [memory()]);
    expect(result.steps[0].tool?.input.time).toBe("10:00–11:00");
    expect(result.trace.memoryInfluences[0]).toMatchObject({ mode: "hard_constraint" });
    expect(result.trace.memoryInfluences[0].effect).toContain("Shifted");
  });

  it("honors a user override that makes the same text a soft memory", () => {
    const result = applyMemoryToScenario(base, [memory({ isHardConstraint: false })]);
    expect(result.steps[0].tool?.input.time).toBe("09:00–10:00");
    expect(result.trace.memoryInfluences).toEqual([]);
  });

  it("infers the lighter-schedule demo preference as soft", () => {
    expect(inferMemoryFromPrompt("我不喜欢日程太满，请记住")).toMatchObject({ isHardConstraint: false, source: "agent_inferred" });
  });
});
