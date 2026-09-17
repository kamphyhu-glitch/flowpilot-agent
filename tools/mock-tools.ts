import type { ToolInvocation, ToolName, ToolOperation } from "@/types/agent";

const toolNames: Record<ToolOperation, ToolName> = {
  get_calendar: "Calendar Tool",
  create_event: "Calendar Tool",
  reschedule_event: "Calendar Tool",
  create_task: "Task Tool",
  update_task: "Task Tool",
  complete_task: "Task Tool",
  get_weather: "Weather Tool",
  estimate_route: "Route Tool",
};

const mutatingOperations = new Set<ToolOperation>([
  "create_event",
  "reschedule_event",
  "create_task",
  "update_task",
  "complete_task",
]);

export function mockTool(
  operation: ToolOperation,
  input: Record<string, string>,
  output: Record<string, string>,
  summary: string,
): ToolInvocation {
  return {
    toolName: toolNames[operation],
    operation,
    input,
    output,
    requiresApproval: mutatingOperations.has(operation),
    summary,
  };
}
