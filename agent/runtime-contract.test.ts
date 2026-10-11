import { describe, expect, it } from "vitest";
import { parseAgentRunRequest } from "@/agent/runtime-contract";

describe("agent runtime request contract", () => {
  it("accepts a bounded request", () => {
    expect(parseAgentRunRequest({
      userInput: "Plan SQL study tomorrow",
      memories: [],
      tasks: [],
      timezone: "Asia/Shanghai",
    })).toEqual({
      userInput: "Plan SQL study tomorrow",
      memories: [],
      tasks: [],
      timezone: "Asia/Shanghai",
    });
  });

  it("rejects blank and oversized prompts", () => {
    expect(parseAgentRunRequest({ userInput: " ", memories: [], tasks: [], timezone: "Asia/Shanghai" })).toBeNull();
    expect(parseAgentRunRequest({
      userInput: "x".repeat(2_001),
      memories: [],
      tasks: [],
      timezone: "Asia/Shanghai",
    })).toBeNull();
  });
});
