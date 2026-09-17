"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, Brain, CheckSquare2, FlaskConical, PanelLeftClose, Sparkles } from "lucide-react";

const navigation = [
  { href: "/", label: "Agent", icon: Bot },
  { href: "/tasks", label: "Tasks", icon: CheckSquare2 },
  { href: "/memory", label: "Memory", icon: Brain },
  { href: "/evaluation", label: "Evaluation", icon: FlaskConical },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-zinc-200/80 bg-white/90 px-3 py-3 backdrop-blur md:h-screen md:w-[216px] md:border-b-0 md:border-r md:px-3 md:py-4">
      <div className="flex items-center justify-between px-2 md:mb-7">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-ink text-white shadow-sm">
            <Sparkles size={15} strokeWidth={2.2} />
          </span>
          <div>
            <div className="text-sm font-semibold tracking-[-0.02em]">FlowPilot</div>
            <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-400">Agent workspace</div>
          </div>
        </Link>
        <PanelLeftClose className="hidden text-zinc-400 md:block" size={16} />
      </div>

      <nav className="mt-3 flex gap-1 overflow-x-auto md:mt-0 md:flex-col">
        {navigation.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-fit items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                active ? "bg-zinc-100 font-medium text-zinc-950" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
              }`}
            >
              <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 md:block">
        <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Demo mode
        </div>
        <p className="text-[11px] leading-relaxed text-zinc-500">Mock tools are active. Every change still requires your approval.</p>
      </div>
    </aside>
  );
}
