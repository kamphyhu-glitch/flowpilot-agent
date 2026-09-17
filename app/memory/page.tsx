import { Brain } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export default function MemoryPage() {
  return <PlaceholderPage eyebrow="Context" title="Memory" description="Preferences, goals, and habits that make plans more personal." icon={Brain} items={["User preferences", "Goals and habits", "Recent context"]} />;
}
