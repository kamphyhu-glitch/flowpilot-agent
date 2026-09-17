import { describe, expect, it } from "vitest";
import { executeTaskTool, type TaskStore } from "@/agent/task-execution";
import { mockTool } from "@/tools/mock-tools";
import type { NewTask, Task } from "@/types/persistent";

function makeStore(initial: Task[] = []) {
  const tasks = [...initial];
  const store: TaskStore = {
    list: () => tasks,
    add(input: NewTask) {
      const task: Task = { ...input, id: `task-${tasks.length + 1}`, createdAt: "2026-01-01", updatedAt: "2026-01-01" };
      tasks.push(task);
      return task;
    },
    update(id, update) {
      const index = tasks.findIndex((task) => task.id === id);
      if (index < 0) return undefined;
      tasks[index] = { ...tasks[index], ...update, updatedAt: "2026-01-02" };
      return tasks[index];
    },
  };
  return { store, tasks };
}

describe("task tool execution", () => {
  it("creates a sourced task only when execution is invoked", () => {
    const { store, tasks } = makeStore();
    const tool = mockTool("create_task", { title: "SQL Learning", time: "10:00–11:00" }, { task: "Created" }, "Create SQL Learning");
    expect(tasks).toHaveLength(0);
    const result = executeTaskTool(tool, "run-1", store);
    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({ title: "SQL Learning", scheduleLabel: "10:00–11:00", source: "agent", sourceRunId: "run-1", status: "todo" });
    expect(result.outcome).toBe("created");
  });

  it("updates a matching task", () => {
    const original: Task = { id: "one", title: "SQL review", scheduleLabel: "60 min", status: "todo", source: "user", createdAt: "2026-01-01", updatedAt: "2026-01-01" };
    const { store, tasks } = makeStore([original]);
    const result = executeTaskTool(mockTool("update_task", { title: "SQL review", to: "25 min" }, { task: "Updated" }, "Shorten SQL"), "run-2", store);
    expect(result.outcome).toBe("updated");
    expect(tasks).toHaveLength(1);
    expect(tasks[0].scheduleLabel).toBe("25 min");
  });

  it("creates a task and records fallback when an update target is missing", () => {
    const { store, tasks } = makeStore();
    const result = executeTaskTool(mockTool("reschedule_event", { title: "Portfolio copy", to: "Tomorrow 10:00" }, { event: "Rescheduled" }, "Move portfolio"), "run-3", store);
    expect(tasks).toHaveLength(1);
    expect(result).toMatchObject({ outcome: "created", fallback: "Original task not found; created a new task." });
  });
});
