import { CheckSquare2 } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export default function TasksPage() {
  return <PlaceholderPage eyebrow="Workspace" title="Tasks" description="Everything FlowPilot has proposed or created." icon={CheckSquare2} items={["Create and edit tasks", "Complete work", "View Agent-created schedule"]} />;
}
