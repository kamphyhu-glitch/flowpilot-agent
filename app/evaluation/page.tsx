import { FlaskConical } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export default function EvaluationPage() {
  return <PlaceholderPage eyebrow="Quality" title="Evaluation" description="Measure Agent experience quality and capture failure cases." icon={FlaskConical} items={["Experience scorecard", "Failure cases", "Improvement suggestions"]} />;
}
