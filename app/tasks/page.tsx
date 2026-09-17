import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { TaskWorkspace } from "@/components/tasks/task-workspace";

export default function TasksPage() {
  return <AppShell><PageHeader eyebrow="Workspace" title="Tasks" description="Everything FlowPilot has created—with source, schedule, and status." /><TaskWorkspace /></AppShell>;
}
