"use client";

import { useState } from "react";
import { ArrowUp, Bot, RotateCcw, Sparkles } from "lucide-react";
import { demoCases } from "@/data/demo-cases";
import type { ChatMessage } from "@/types/agent";
import { PanelHeading } from "@/components/agent/panel-heading";

export function ChatPanel({
  messages,
  isRunning,
  onSubmit,
}: {
  messages: ChatMessage[];
  isRunning: boolean;
  onSubmit: (prompt: string) => void;
}) {
  const [input, setInput] = useState("");

  function submit(prompt: string) {
    const value = prompt.trim();
    if (!value) return;
    onSubmit(value);
    setInput("");
  }

  return (
    <section className="flex min-h-[560px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-panel lg:h-[calc(100vh-145px)]">
      <PanelHeading
        eyebrow="Conversation"
        title="What are we working on?"
        meta={<span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Ready</span>}
      />

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col">
            <div className="mb-6 rounded-2xl bg-zinc-50 p-4">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-violet shadow-sm ring-1 ring-zinc-200">
                <Sparkles size={15} />
              </div>
              <h3 className="text-sm font-semibold tracking-[-0.01em]">Turn a complex goal into a clear plan.</h3>
              <p className="mt-1.5 text-xs leading-5 text-zinc-500">I’ll plan the work, use the right tools, and ask before changing anything.</p>
            </div>

            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Try an example</span>
              <span className="text-[10px] text-zinc-400">3 scenarios</span>
            </div>
            <div className="space-y-2">
              {demoCases.map((demo) => (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => submit(demo.prompt)}
                  className="group w-full rounded-xl border border-zinc-200 p-3 text-left transition hover:border-zinc-300 hover:bg-zinc-50"
                >
                  <div className="flex items-start gap-3">
                    <span className="pt-0.5 text-[10px] font-semibold tracking-[0.12em] text-zinc-400">{demo.number}</span>
                    <div>
                      <div className="text-xs font-semibold text-zinc-700 group-hover:text-zinc-950">{demo.title}</div>
                      <p className="mt-1 text-[11px] leading-4 text-zinc-500">{demo.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-2.5 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" && (
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink text-white"><Bot size={13} /></span>
                )}
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-5 ${message.role === "user" ? "rounded-br-md bg-ink text-white" : "rounded-bl-md bg-zinc-100 text-zinc-700"}`}>
                  {message.content}
                </div>
              </div>
            ))}
            {isRunning && (
              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink text-white"><Bot size={13} /></span>
                <span className="animate-soft-pulse">Working through the plan…</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-zinc-100 p-3">
        {messages.length > 0 && (
          <button type="button" onClick={() => submit(messages[0]?.content ?? demoCases[0].prompt)} className="mb-2 flex items-center gap-1 text-[10px] font-medium text-zinc-400 hover:text-zinc-700">
            <RotateCcw size={11} /> Run again
          </button>
        )}
        <div className="rounded-xl border border-zinc-200 bg-white p-2 shadow-sm transition focus-within:border-zinc-400">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit(input);
              }
            }}
            rows={2}
            placeholder="Describe a goal or task…"
            className="w-full resize-none border-0 bg-transparent px-1 text-xs leading-5 text-zinc-800 outline-none placeholder:text-zinc-400"
          />
          <div className="flex items-center justify-between px-1 pt-1">
            <span className="text-[9px] text-zinc-400">Enter to send · Shift + Enter for new line</span>
            <button type="button" onClick={() => submit(input)} disabled={!input.trim()} aria-label="Send message" className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-200">
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
