import { isToolOperation, mockTool, mutatingOperations } from "@/tools/mock-tools";
import type { ToolInvocation, ToolOperation } from "@/types/agent";

export type RecordedToolCall = {
  callId: string;
  invocation: ToolInvocation;
};

export type ModelToolCall = {
  callId: string;
  name: string;
  arguments: string;
};

type ToolDefinition = {
  type: "function";
  name: ToolOperation;
  description: string;
  parameters: Record<string, unknown>;
};

const descriptions: Record<ToolOperation, string> = {
  get_calendar: "Read mock calendar availability for a date or date range.",
  create_event: "Propose creating a calendar event. This always requires user approval.",
  reschedule_event: "Propose rescheduling a calendar event. This always requires user approval.",
  create_task: "Propose creating a task. This always requires user approval.",
  update_task: "Propose updating an existing task. This always requires user approval.",
  complete_task: "Propose completing an existing task. This always requires user approval.",
  get_weather: "Read a mock weather forecast for a city and time.",
  estimate_route: "Read a mock travel estimate for a destination and desired arrival time.",
};

const requiredFields: Partial<Record<ToolOperation, string[]>> = {
  create_event: ["title", "time"],
  reschedule_event: ["title", "to"],
  create_task: ["title", "time"],
  update_task: ["title"],
  complete_task: ["title"],
  get_weather: ["city"],
  estimate_route: ["destination"],
};

export const agentToolDefinitions: ToolDefinition[] = Object.keys(descriptions).map((name) => ({
  type: "function",
  name: name as ToolOperation,
  description: descriptions[name as ToolOperation],
  parameters: {
    type: "object",
    properties: {
      title: { type: "string" },
      date: { type: "string" },
      range: { type: "string" },
      window: { type: "string" },
      time: { type: "string" },
      from: { type: "string" },
      to: { type: "string" },
      schedule: { type: "string" },
      cadence: { type: "string" },
      city: { type: "string" },
      destination: { type: "string" },
      arrival: { type: "string" },
    },
    required: requiredFields[name as ToolOperation] ?? [],
    additionalProperties: false,
  },
}));

function parseArguments(call: ModelToolCall): Record<string, string> {
  let value: unknown;
  try {
    value = JSON.parse(call.arguments);
  } catch {
    throw new Error("invalid_tool_arguments");
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("invalid_tool_arguments");
  const entries = Object.entries(value);
  if (entries.some(([, item]) => typeof item !== "string" || item.length > 300)) {
    throw new Error("invalid_tool_arguments");
  }
  return Object.fromEntries(entries) as Record<string, string>;
}

function readOutput(operation: ToolOperation, input: Record<string, string>): Record<string, string> {
  if (operation === "get_calendar") {
    return { availability: "10:00–13:30 open", conflicts: "None", source: "Mock calendar" };
  }
  if (operation === "get_weather") {
    return { forecast: "Light rain", risk: "Medium", temperature: "24°C", city: input.city };
  }
  if (operation === "estimate_route") {
    return { travel: "45 min", buffer: "30 min", recommended_leave: "13:15" };
  }
  return { status: "pending_approval", message: "No data was changed. User approval is required." };
}

function summaryFor(operation: ToolOperation, input: Record<string, string>) {
  const title = input.title ?? operation.replaceAll("_", " ");
  const schedule = input.time ?? input.to ?? input.schedule ?? input.cadence;
  if (mutatingOperations.has(operation)) return `${title}${schedule ? ` · ${schedule}` : ""}`;
  if (operation === "get_weather") return `Weather checked for ${input.city}`;
  if (operation === "estimate_route") return `Route estimated to ${input.destination}`;
  return "Calendar availability checked";
}

export function executeAgentToolCall(call: ModelToolCall): RecordedToolCall {
  if (!isToolOperation(call.name)) throw new Error("unknown_tool");
  const input = parseArguments(call);
  for (const field of requiredFields[call.name] ?? []) {
    if (!input[field]?.trim()) throw new Error("invalid_tool_arguments");
  }
  return {
    callId: call.callId,
    invocation: mockTool(call.name, input, readOutput(call.name, input), summaryFor(call.name, input)),
  };
}
