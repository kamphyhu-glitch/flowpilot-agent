import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { MemoryWorkspace } from "@/components/memory/memory-workspace";

export default function MemoryPage() {
  return <AppShell><PageHeader eyebrow="Context" title="Memory" description="Preferences, constraints, goals, and habits that shape every plan." /><MemoryWorkspace /></AppShell>;
}
