import { CircleHelp, Command } from "lucide-react";

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="flex items-start justify-between border-b border-zinc-200/80 bg-white/55 px-5 py-5 backdrop-blur md:px-7">
      <div>
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-violet">{eyebrow}</div>
        <h1 className="text-xl font-semibold tracking-[-0.03em] text-ink md:text-[22px]">{title}</h1>
        <p className="mt-1 text-xs text-zinc-500 md:text-sm">{description}</p>
      </div>
      <div className="hidden items-center gap-2 md:flex">
        <button className="flex h-8 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs text-zinc-500 shadow-sm">
          <Command size={12} /> K
        </button>
        <button aria-label="Help" className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 shadow-sm">
          <CircleHelp size={14} />
        </button>
      </div>
    </header>
  );
}
