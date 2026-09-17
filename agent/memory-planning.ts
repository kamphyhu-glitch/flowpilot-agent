import type { AgentScenario, MemoryInfluence, PlanStep } from "@/types/agent";
import type { Memory, NewMemory } from "@/types/persistent";

export function inferHardConstraint(content: string) {
  const normalized = content.trim().toLocaleLowerCase();
  if (/不喜欢/.test(normalized)) return false;
  return /不要|不能|禁止|必须|不得|不安排|\bnever\b|\bmust(?:\s+not)?\b|\bdo not\b|\bdon't\b|\bcannot\b/.test(normalized);
}

export function inferMemoryFromPrompt(prompt: string): NewMemory | null {
  if (/不喜欢.*(?:日程|安排).*(?:太满|排满)|(?:日程|安排).*(?:太满|排满).*不喜欢/.test(prompt)) {
    return {
      type: "preference",
      content: "Prefers lighter schedules with buffer time",
      isHardConstraint: false,
      source: "agent_inferred",
      confidence: 0.94,
    };
  }
  return null;
}

function getEarliestHour(memory: Memory) {
  const chinese = memory.content.match(/(\d{1,2})(?:点|:00)?前/);
  const english = memory.content.match(/before\s+(\d{1,2})(?::00)?\s*(?:am)?/i);
  const value = Number(chinese?.[1] ?? english?.[1]);
  return Number.isFinite(value) && value >= 0 && value <= 23 ? value : null;
}

function formatMinutes(total: number) {
  const hours = Math.floor(total / 60) % 24;
  const minutes = total % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

export function enforceTimeFloor(value: string, floorHour: number) {
  const range = value.match(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/);
  if (range) {
    const start = Number(range[1]) * 60 + Number(range[2]);
    const end = Number(range[3]) * 60 + Number(range[4]);
    const floor = floorHour * 60;
    if (start >= floor) return value;
    const replacement = `${formatMinutes(floor)}–${formatMinutes(floor + Math.max(end - start, 30))}`;
    return value.replace(range[0], replacement);
  }

  const single = value.match(/\b(\d{1,2}):(\d{2})\b/);
  if (!single) return value;
  const time = Number(single[1]) * 60 + Number(single[2]);
  return time < floorHour * 60 ? value.replace(single[0], `${floorHour.toString().padStart(2, "0")}:00`) : value;
}

function mapRecord(record: Record<string, string>, floorHour: number) {
  return Object.fromEntries(Object.entries(record).map(([key, value]) => [key, enforceTimeFloor(value, floorHour)]));
}

function applyFloorToSteps(steps: AgentScenario["steps"], floorHour: number) {
  let changed = false;
  const corrected = steps.map((step) => {
    if (!step.tool || !step.tool.requiresApproval) return step;
    const input = mapRecord(step.tool.input, floorHour);
    const output = mapRecord(step.tool.output, floorHour);
    const summary = enforceTimeFloor(step.tool.summary, floorHour);
    if (JSON.stringify(input) !== JSON.stringify(step.tool.input) || summary !== step.tool.summary) changed = true;
    return { ...step, tool: { ...step.tool, input, output, summary } };
  });
  return { steps: corrected, changed };
}

function addScheduleBuffer(steps: AgentScenario["steps"]) {
  if (!steps.some((step) => step.id.startsWith("m-"))) return { steps, changed: false };
  return {
    changed: true,
    steps: steps.map((step, index) => {
      if (index !== 3 || !step.tool) return step;
      return {
        ...step,
        tool: {
          ...step.tool,
          input: { ...step.tool.input, time: "11:30–12:30" },
          output: { ...step.tool.output, time: "11:30–12:30" },
          summary: step.tool.summary.replace("11:00–12:00", "11:30–12:30"),
        },
      };
    }),
  };
}

export function applyMemoryToScenario(base: AgentScenario, memories: readonly Memory[]): AgentScenario {
  let steps: AgentScenario["steps"] = base.steps.map((step) => ({
    ...step,
    ...(step.tool ? { tool: { ...step.tool, input: { ...step.tool.input }, output: { ...step.tool.output } } } : {}),
  }));
  const influences: MemoryInfluence[] = [];
  const constraints = [...base.trace.constraints];
  const reasons = [...base.trace.reasons];

  if (base.id === "memory-capture") {
    return { ...base, steps, trace: { ...base.trace, memoryInfluences: [], executionNotes: [] } };
  }

  for (const memory of memories) {
    if (memory.isHardConstraint) {
      const floorHour = getEarliestHour(memory);
      if (floorHour === null) continue;
      const result = applyFloorToSteps(steps, floorHour);
      steps = result.steps;
      constraints.push(memory.content);
      influences.push({
        memoryId: memory.id,
        content: memory.content,
        memoryType: memory.type,
        mode: "hard_constraint",
        effect: result.changed
          ? `Shifted proposed work to ${floorHour.toString().padStart(2, "0")}:00 or later before execution.`
          : `Validated that all proposed work begins at ${floorHour.toString().padStart(2, "0")}:00 or later.`,
      });
      continue;
    }

    if (memory.type === "preference" && /lighter schedules|buffer time|日程.*太满|安排.*太满/i.test(memory.content)) {
      const result = addScheduleBuffer(steps);
      steps = result.steps;
      reasons.push("Memory preference preserves recovery time between focused blocks");
      influences.push({
        memoryId: memory.id,
        content: memory.content,
        memoryType: memory.type,
        mode: "soft_preference",
        effect: result.changed
          ? "Added a 30-minute buffer between the two planned work blocks."
          : "Preserved existing gaps and avoided adding another dense work block.",
      });
    }
  }

  return {
    ...base,
    steps,
    trace: { ...base.trace, constraints, reasons, memoryInfluences: influences, executionNotes: [] },
  };
}
