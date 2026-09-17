import type { LucideIcon } from "lucide-react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";

export function PlaceholderPage({
  eyebrow,
  title,
  description,
  icon: Icon,
  items,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  items: string[];
}) {
  return (
    <AppShell>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-16">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-panel">
          <div className="border-b border-zinc-100 px-6 py-7 md:px-8">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-violet/10 text-violet">
              <Icon size={20} />
            </div>
            <h2 className="text-lg font-semibold tracking-[-0.02em]">Designed for phase two</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">The workspace shell is ready. Phase one stays focused on proving the Agent planning and approval experience.</p>
          </div>
          <div className="grid gap-px bg-zinc-100 md:grid-cols-3">
            {items.map((item, index) => (
              <div key={item} className="bg-white p-6">
                <div className="mb-7 flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">0{index + 1}</span>
                  <LockKeyhole size={13} className="text-zinc-300" />
                </div>
                <p className="text-sm font-medium text-zinc-700">{item}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-zinc-50 px-6 py-4 text-xs text-zinc-500 md:px-8">
            Planned next <ArrowRight size={13} /> localStorage persistence and full editing
          </div>
        </div>
      </div>
    </AppShell>
  );
}
