import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { AgentWorkspace } from "@/components/agent/agent-workspace";

export default function Home() {
  return (
    <AppShell>
      <PageHeader eyebrow="AI task collaboration" title="Agent workspace" description="Plan clearly. See every tool. Approve every action." />
      <AgentWorkspace />
    </AppShell>
  );
}
