import { CalendarDays, Check, CloudSun, ListTodo, Map, Wrench } from "lucide-react";
import type { ToolActivity as ToolActivityType, ToolName } from "@/types/agent";
import { PanelHeading } from "@/components/agent/panel-heading";

const icons: Record<ToolName, typeof CalendarDays> = {
  "Calendar Tool": CalendarDays,
  "Task Tool": ListTodo,
  "Weather Tool": CloudSun,
  "Route Tool": Map,
};

function KeyValues({ data }: { data: Record<string, string> }) {
  return (
    <div className="space-y-1">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="grid grid-cols-[70px_1fr] gap-2 text-[10px] leading-4">
          <span className="truncate text-zinc-400">{key.replaceAll("_", " ")}</span>
          <span className="text-zinc-600">{value}</span>
        </div>
      ))}
    </div>
  );
}

export function ToolActivity({ activities }: { activities: ToolActivityType[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-panel">
      <PanelHeading eyebrow="Observability" title="Tool activity" meta={activities.length ? <span className="rounded-full bg-zinc-100 px-2 py-1 text-[9px] font-semibold text-zinc-500">{activities.length} calls</span> : undefined} />
      <div className="max-h-[300px] overflow-y-auto p-3">
        {activities.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-zinc-200 p-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-50 text-zinc-300"><Wrench size={14} /></span>
            <div><p className="text-[11px] font-medium text-zinc-500">No tools called yet</p><p className="mt-0.5 text-[10px] text-zinc-400">Inputs and outputs will stay visible.</p></div>
          </div>
        ) : (
          <div className="space-y-2">
            {[...activities].reverse().map((activity) => {
              const Icon = icons[activity.toolName];
              return (
                <details key={activity.id} className="group rounded-xl border border-zinc-200 bg-white open:bg-zinc-50/60" open={activities.length <= 2}>
                  <summary className="flex cursor-pointer list-none items-center gap-2.5 p-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600"><Icon size={13} /></span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5"><span className="truncate text-[11px] font-semibold text-zinc-700">{activity.operation}</span><Check size={10} className="text-emerald-500" /></div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[9px] text-zinc-400"><span>{activity.toolName}</span><span>·</span><span>{activity.timestamp}</span></div>
                    </div>
                  </summary>
                  <div className="grid gap-3 border-t border-zinc-100 px-3 py-3">
                    <div><div className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Input</div><KeyValues data={activity.input} /></div>
                    <div><div className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Output</div><KeyValues data={activity.output} /></div>
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
