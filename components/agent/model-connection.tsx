"use client";

import { useState } from "react";
import { Eye, EyeOff, KeyRound, ShieldCheck, Unplug } from "lucide-react";

export function ModelConnection({
  connected,
  disabled,
  onConnect,
  onDisconnect,
}: {
  connected: boolean;
  disabled: boolean;
  onConnect: (apiKey: string) => boolean;
  onDisconnect: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");

  function connect() {
    if (!onConnect(apiKey)) {
      setError("Enter a valid DeepSeek API key without spaces.");
      return;
    }
    setApiKey("");
    setError("");
    setShowKey(false);
    setIsOpen(false);
  }

  if (connected) {
    return (
      <div className="flex items-center justify-between gap-3 border-b border-zinc-100 bg-emerald-50/50 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2 text-[10px] text-emerald-800">
          <ShieldCheck size={13} className="shrink-0" />
          <span><strong>DeepSeek connected.</strong> The key stays in this browser session.</span>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={onDisconnect}
          className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Unplug size={11} /> Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="border-b border-zinc-100 bg-zinc-50/70 px-4 py-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 text-[10px] text-zinc-500">
          <KeyRound size={13} className="shrink-0 text-violet" />
          <span>Connect your own API key to try live planning.</span>
        </div>
        <button
          type="button"
          disabled={disabled}
          aria-expanded={isOpen}
          onClick={() => {
            setIsOpen((value) => !value);
            setError("");
          }}
          className="shrink-0 rounded-md bg-ink px-2.5 py-1.5 text-[10px] font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          Connect Model
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
          <label htmlFor="deepseek-api-key" className="label">DeepSeek API Key</label>
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <input
                id="deepseek-api-key"
                name="deepseek-api-key"
                type={showKey ? "text" : "password"}
                value={apiKey}
                autoComplete="off"
                spellCheck={false}
                placeholder="sk-…"
                onChange={(event) => {
                  setApiKey(event.target.value);
                  setError("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") connect();
                }}
                className="input pr-9"
              />
              <button
                type="button"
                aria-label={showKey ? "Hide API key" : "Show API key"}
                onClick={() => setShowKey((value) => !value)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <button
              type="button"
              onClick={connect}
              disabled={!apiKey.trim()}
              className="rounded-lg bg-violet px-3 text-[10px] font-semibold text-white transition hover:bg-violet/90 disabled:cursor-not-allowed disabled:bg-zinc-200"
            >
              Connect
            </button>
          </div>
          {error && <p role="alert" className="mt-2 text-[10px] text-rose-600">{error}</p>}
          <p className="mt-2 text-[9px] leading-4 text-zinc-400">
            Session only. FlowPilot sends this key through its server for DeepSeek requests and does not add it to Tasks, Memory, or localStorage.
          </p>
        </div>
      )}
    </div>
  );
}
