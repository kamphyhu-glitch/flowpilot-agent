import { Check, CheckCircle2, ShieldCheck, X } from "lucide-react";
import type { Approval } from "@/types/agent";
import { PanelHeading } from "@/components/agent/panel-heading";

export function ApprovalPanel({ approvals, onResolve }: { approvals: Approval[]; onResolve: (id: string, status: "approved" | "declined") => void }) {
  const pendingCount = approvals.filter((approval) => approval.status === "pending").length;
  if (approvals.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-2xl border border-amber-200/70 bg-white shadow-panel">
      <PanelHeading eyebrow="User control" title="Pending approval" meta={<span className="rounded-full bg-amber-50 px-2 py-1 text-[9px] font-semibold text-amber-700">{pendingCount} pending</span>} />
      <div className="space-y-2 p-3">
        {approvals.map((approval) => (
          <div key={approval.id} className={`rounded-xl border p-3 ${approval.status === "pending" ? "border-amber-200 bg-amber-50/35" : "border-zinc-200 bg-zinc-50/50"}`}>
            <div className="flex items-start gap-2.5">
              <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${approval.status === "approved" ? "bg-emerald-50 text-emerald-600" : approval.status === "declined" ? "bg-zinc-100 text-zinc-400" : "bg-amber-100 text-amber-700"}`}>
                {approval.status === "approved" ? <CheckCircle2 size={14} /> : <ShieldCheck size={14} />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold text-zinc-800">{approval.summary}</p>
                  {approval.status !== "pending" && <span className={`text-[9px] font-semibold uppercase tracking-[0.1em] ${approval.status === "approved" ? "text-emerald-600" : "text-zinc-400"}`}>{approval.status === "approved" ? "Executed" : "Declined"}</span>}
                </div>
                <p className="mt-1 text-[9px] text-zinc-400">{approval.toolName} · {approval.operation}</p>
                {approval.status === "pending" && (
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => onResolve(approval.id, "approved")} className="flex h-7 items-center gap-1.5 rounded-lg bg-ink px-2.5 text-[10px] font-semibold text-white transition hover:bg-zinc-700"><Check size={11} /> Approve</button>
                    <button type="button" onClick={() => onResolve(approval.id, "declined")} className="flex h-7 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 text-[10px] font-medium text-zinc-500 hover:bg-zinc-50"><X size={11} /> Decline</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
