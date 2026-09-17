import { addTask, taskRepository, updateTask } from "@/data/persistent-store";
import type { TaskExecutionResult, ToolInvocation } from "@/types/agent";
import type { NewTask, Task } from "@/types/persistent";

export type TaskStore = {
  list: () => readonly Task[];
  add: (task: NewTask) => Task;
  update: (id: string, update: Partial<Omit<Task, "id" | "createdAt">>) => Task | undefined;
};

const defaultStore: TaskStore = {
  list: taskRepository.getSnapshot,
  add: addTask,
  update: updateTask,
};

function normalize(value: string) {
  return value.trim().toLocaleLowerCase();
}

function scheduleFromTool(tool: ToolInvocation) {
  return tool.input.time ?? tool.input.to ?? tool.input.schedule ?? tool.input.cadence;
}

function newAgentTask(tool: ToolInvocation, runId: string): NewTask {
  return {
    title: tool.input.title ?? tool.summary,
    description: tool.operation.replaceAll("_", " "),
    scheduleLabel: scheduleFromTool(tool),
    status: "todo",
    source: "agent",
    sourceRunId: runId,
  };
}

export function executeTaskTool(
  tool: ToolInvocation,
  runId: string,
  store: TaskStore = defaultStore,
): TaskExecutionResult {
  if (tool.operation === "create_task" || tool.operation === "create_event") {
    const task = store.add(newAgentTask(tool, runId));
    return { taskId: task.id, outcome: "created" };
  }

  const title = tool.input.title;
  const existing = title
    ? store.list().find((task) => normalize(task.title) === normalize(title))
    : undefined;

  if (!existing && (tool.operation === "update_task" || tool.operation === "reschedule_event")) {
    const task = store.add(newAgentTask(tool, runId));
    return {
      taskId: task.id,
      outcome: "created",
      fallback: "Original task not found; created a new task.",
    };
  }

  if (!existing) return { outcome: "no_change" };

  if (tool.operation === "complete_task") {
    store.update(existing.id, { status: "completed", completedAt: new Date().toISOString() });
    return { taskId: existing.id, outcome: "completed" };
  }

  store.update(existing.id, {
    scheduleLabel: scheduleFromTool(tool) ?? existing.scheduleLabel,
    description: tool.operation.replaceAll("_", " "),
    sourceRunId: runId,
  });
  return { taskId: existing.id, outcome: "updated" };
}
