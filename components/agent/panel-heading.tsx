import type { ReactNode } from "react";

export function PanelHeading({
  eyebrow,
  title,
  meta,
}: {
  eyebrow: string;
  title: string;
  meta?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3.5">
      <div>
        <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-400">{eyebrow}</div>
        <h2 className="mt-0.5 text-sm font-semibold tracking-[-0.01em] text-zinc-800">{title}</h2>
      </div>
      {meta}
    </div>
  );
}
