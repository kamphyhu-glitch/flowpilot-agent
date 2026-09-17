import { metricDefinitions } from "@/data/evaluation-cases";
import type { MetricScore } from "@/types/evaluation";

function tone(score: number) {
  if (score >= 4) return { text: "text-emerald-600", bar: "bg-emerald-500", badge: "bg-emerald-50" };
  if (score >= 2.5) return { text: "text-amber-700", bar: "bg-amber-500", badge: "bg-amber-50" };
  return { text: "text-rose-600", bar: "bg-rose-500", badge: "bg-rose-50" };
}

export function MetricCard({ metric }: { metric: MetricScore }) {
  const definition = metricDefinitions.find((item) => item.id === metric.metric);
  const colors = tone(metric.score);
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-panel">
      <div className="flex items-start justify-between gap-3"><div><h3 className="text-xs font-semibold text-zinc-800">{definition?.label}</h3><p className="mt-1 min-h-8 text-[9px] leading-relaxed text-zinc-400">{definition?.description}</p></div><span className={`rounded-lg px-2 py-1 text-sm font-semibold ${colors.badge} ${colors.text}`}>{metric.score.toFixed(1)}</span></div>
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-zinc-100"><div className={`h-full rounded-full ${colors.bar}`} style={{ width: `${metric.score * 20}%` }} /></div>
      <p className="mt-2 text-[8px] uppercase tracking-[0.1em] text-zinc-400">{metric.caseCount} cases · {metric.assertionCount} assertions</p>
    </article>
  );
}
