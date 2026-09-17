import { describe, expect, it } from "vitest";
import { findEquivalentMemory } from "@/data/persistent-store";
import type { Memory } from "@/types/persistent";

describe("inferred memory deduplication", () => {
  it("finds equivalent content without case or surrounding-space differences", () => {
    const existing: Memory = { id: "one", type: "preference", content: "Prefers lighter schedules", isHardConstraint: false, source: "agent_inferred", createdAt: "2026-01-01", updatedAt: "2026-01-01" };
    expect(findEquivalentMemory([existing], { type: "preference", content: "  PREFERS LIGHTER SCHEDULES " })?.id).toBe("one");
    expect(findEquivalentMemory([existing], { type: "goal", content: "Prefers lighter schedules" })).toBeUndefined();
  });
});
