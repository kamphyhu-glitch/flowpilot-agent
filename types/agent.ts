export type PlanStatus = "pending" | "running" | "completed";
export type ApprovalStatus = "pending" | "approved" | "declined";

export type ToolName = "Calendar Tool" | "Task Tool" | "Weather Tool" | "Route Tool";
export type ToolOperation =
  | "get_calendar"
  | "create_event"
  | "reschedule_event"
  | "create_task"
  | "update_task"
  | "complete_task"
  | "get_weather"
  | "estimate_route";

export type ToolInvocation = {
  toolName: ToolName;
  operation: ToolOperation;
  input: Record<string, string>;
  output: Record<string, string>;
  requiresApproval: boolean;
  summary: string;
};

export type PlanStep = {
  id: string;
  title: string;
  description: string;
  status: PlanStatus;
  tool?: ToolInvocation;
};

export type ToolActivity = ToolInvocation & {
  id: string;
  timestamp: string;
  status: "executed";
};

export type Approval = ToolInvocation & {
  id: string;
  status: ApprovalStatus;
};

export type AgentTrace = {
  goal: string;
  constraints: string[];
  tools: ToolName[];
  decision: string;
  reasons: string[];
};

export type AgentScenario = {
  id: string;
  label: string;
  prompt: string;
  shortLabel: string;
  response: string;
  steps: Omit<PlanStep, "status">[];
  trace: AgentTrace;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};
