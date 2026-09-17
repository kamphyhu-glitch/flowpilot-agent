export type TaskStatus = "todo" | "completed";
export type TaskSource = "agent" | "user";

export type Task = {
  id: string;
  title: string;
  description?: string;
  scheduleLabel?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  status: TaskStatus;
  source: TaskSource;
  sourceRunId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
};

export type MemoryType = "preference" | "goal" | "habit" | "recent_context";
export type MemorySource = "user" | "agent_inferred" | "demo_seed";

export type Memory = {
  id: string;
  type: MemoryType;
  content: string;
  isHardConstraint: boolean;
  source: MemorySource;
  confidence?: number;
  createdAt: string;
  updatedAt: string;
};

export type NewTask = Pick<Task, "title" | "status" | "source"> &
  Partial<Pick<Task, "description" | "scheduleLabel" | "scheduledStart" | "scheduledEnd" | "sourceRunId">>;

export type NewMemory = Pick<Memory, "type" | "content" | "isHardConstraint" | "source"> &
  Partial<Pick<Memory, "confidence">>;
