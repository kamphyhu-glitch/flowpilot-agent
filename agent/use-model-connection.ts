"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clearSessionApiKey,
  readSessionApiKey,
  saveSessionApiKey,
} from "@/agent/deepseek-credentials";

export function useModelConnection() {
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    setApiKey(readSessionApiKey(window.sessionStorage));
  }, []);

  const connect = useCallback((value: string) => {
    if (!saveSessionApiKey(window.sessionStorage, value)) return false;
    setApiKey(readSessionApiKey(window.sessionStorage));
    return true;
  }, []);

  const disconnect = useCallback(() => {
    clearSessionApiKey(window.sessionStorage);
    setApiKey(null);
  }, []);

  return {
    apiKey,
    isConnected: Boolean(apiKey),
    connect,
    disconnect,
  };
}
