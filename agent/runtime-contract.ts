import type {
  AgentRunRequest,
  AgentRunResponse,
  AgentScenario,
  AgentTrace,
  MemoryInfluence,
  ToolInvocation,
  ToolName,
  ToolOperation,
} from "@/types/agent";
import type { Memory, Task } from "@/types/persistent";

const TOOL_NAMES = new Set<ToolName>(["Calendar Tool", "Task Tool", "Weather Tool", "Route Tool"]);
const TOOL_OPERATIONS = new Set<ToolOperation>([
  "get_calendar",
  "create_event",
  "reschedule_event",
  "create_task",
  "update_task",
  "complete_task",
  "get_weather",
  "estimate_route",
]);
const MEMORY_TYPES = new Set(["preference", "goal", "habit", "recent_context"]);
const MEMORY_SOURCES = new Set(["user", "agent_inferred", "demo_seed"]);
const TASK_STATUSES = new Set(["todo", "completed"]);
const TASK_SOURCES = new Set(["agent", "user"]);

const MAX_INPUT_LENGTH = 2_000;
const MAX_CONTEXT_ITEMS = 40;
const MAX_CONTEXT_TEXT = 500;

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isBoundedString(value: unknown, max = MAX_CONTEXT_TEXT): value is string {
  return typeof value === "string" && value.length <= max;
}

function isOptionalBoundedString(value: unknown, max = MAX_CONTEXT_TEXT) {
  return value === undefined || isBoundedString(value, max);
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return isObject(value) && Object.values(value).every((item) => typeof item === "string");
}

function isMemory(value: unknown): value is Memory {
  if (!isObject(value)) return false;
  return isBoundedString(value.id, 160) && isBoundedString(value.content) &&
    value.content.length <= MAX_CONTEXT_TEXT && MEMORY_TYPES.has(String(value.type)) &&
    typeof value.isHardConstraint === "boolean" && MEMORY_SOURCES.has(String(value.source)) &&
    isBoundedString(value.createdAt, 80) && isBoundedString(value.updatedAt, 80) &&
    (value.confidence === undefined || typeof value.confidence === "number");
}

function isTask(value: unknown): value is Task {
  if (!isObject(value)) return false;
  return isBoundedString(value.id, 160) && isBoundedString(value.title) &&
    TASK_STATUSES.has(String(value.status)) && TASK_SOURCES.has(String(value.source)) &&
    isOptionalBoundedString(value.description) && isOptionalBoundedString(value.scheduleLabel) &&
    isOptionalBoundedString(value.scheduledStart, 80) && isOptionalBoundedString(value.scheduledEnd, 80) &&
    isOptionalBoundedString(value.sourceRunId, 160) && isOptionalBoundedString(value.completedAt, 80) &&
    isBoundedString(value.createdAt, 80) && isBoundedString(value.updatedAt, 80);
}

function isToolInvocation(value: unknown): value is ToolInvocation {
  if (!isObject(value)) return false;
  return TOOL_NAMES.has(value.toolName as ToolName) && TOOL_OPERATIONS.has(value.operation as ToolOperation) &&
    isStringRecord(value.input) && isStringRecord(value.output) &&
    typeof value.requiresApproval === "boolean" && typeof value.summary === "string";
}

function isMemoryInfluence(value: unknown): value is MemoryInfluence {
  if (!isObject(value)) return false;
  return typeof value.memoryId === "string" && typeof value.content === "string" &&
    MEMORY_TYPES.has(String(value.memoryType)) &&
    ["hard_constraint", "soft_preference", "context"].includes(String(value.mode)) &&
    typeof value.effect === "string";
}

function isTrace(value: unknown): value is AgentTrace {
  if (!isObject(value)) return false;
  return typeof value.goal === "string" && Array.isArray(value.constraints) &&
    value.constraints.every((item) => typeof item === "string") && Array.isArray(value.tools) &&
    value.tools.every((item) => TOOL_NAMES.has(item as ToolName)) && typeof value.decision === "string" &&
    Array.isArray(value.reasons) && value.reasons.every((item) => typeof item === "string") &&
    Array.isArray(value.memoryInfluences) && value.memoryInfluences.every(isMemoryInfluence) &&
    (value.executionNotes === undefined ||
      (Array.isArray(value.executionNotes) && value.executionNotes.every((item) => typeof item === "string")));
}

export function parseAgentRunRequest(value: unknown): AgentRunRequest | null {
  if (!isObject(value) || typeof value.userInput !== "string") return null;
  const userInput = value.userInput.trim();
  if (!userInput || userInput.length > MAX_INPUT_LENGTH) return null;
  if (!Array.isArray(value.memories) || value.memories.length > MAX_CONTEXT_ITEMS ||
      !value.memories.every(isMemory)) return null;
  if (!Array.isArray(value.tasks) || value.tasks.length > MAX_CONTEXT_ITEMS || !value.tasks.every(isTask)) return null;
  if (typeof value.timezone !== "string" || value.timezone.length > 80) return null;
  return { userInput, memories: value.memories, tasks: value.tasks, timezone: value.timezone };
}

export function isAgentScenario(value: unknown): value is AgentScenario {
  if (!isObject(value)) return false;
  return typeof value.id === "string" && typeof value.label === "string" &&
    typeof value.prompt === "string" && typeof value.shortLabel === "string" &&
    typeof value.response === "string" && Array.isArray(value.steps) && value.steps.length > 0 &&
    value.steps.length <= 16 && value.steps.every((step) => {
      if (!isObject(step)) return false;
      return typeof step.id === "string" && typeof step.title === "string" &&
        typeof step.description === "string" && (step.tool === undefined || isToolInvocation(step.tool));
    }) && isTrace(value.trace);
}

export function isAgentRunResponse(value: unknown): value is AgentRunResponse {
  if (!isObject(value) || !isAgentScenario(value.scenario) || !isObject(value.runtime)) return false;
  return ["live", "fallback"].includes(String(value.runtime.mode)) &&
    ["deepseek", "deterministic"].includes(String(value.runtime.provider)) &&
    (value.runtime.model === undefined || typeof value.runtime.model === "string") &&
    (value.runtime.fallbackReason === undefined || typeof value.runtime.fallbackReason === "string");
}
