"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getScenario } from "@/agent/scenarios";
import type { AgentScenario, Approval, ChatMessage, PlanStep, ToolActivity } from "@/types/agent";

const STEP_DELAY = 720;

function makeTimestamp() {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());
}

export function useAgentRun() {
  const [scenario, setScenario] = useState<AgentScenario | null>(null);
  const [steps, setSteps] = useState<PlanStep[]>([]);
  const [activities, setActivities] = useState<ToolActivity[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const runId = useRef(0);

  const startRun = useCallback((prompt: string) => {
    const selected = getScenario(prompt);
    runId.current += 1;
    setScenario(selected);
    setSteps(selected.steps.map((step) => ({ ...step, status: "pending" })));
    setActivities([]);
    setApprovals([]);
    setMessages([
      { id: `${runId.current}-user`, role: "user", content: prompt },
      { id: `${runId.current}-assistant`, role: "assistant", content: selected.response },
    ]);
    setActiveIndex(0);
    setIsRunning(true);
  }, []);

  useEffect(() => {
    if (!isRunning || !scenario || activeIndex < 0) return;
    const currentRun = runId.current;

    if (activeIndex >= scenario.steps.length) {
      setIsRunning(false);
      setActiveIndex(-1);
      return;
    }

    setSteps((current) =>
      current.map((step, index) => (index === activeIndex ? { ...step, status: "running" } : step)),
    );

    const timer = window.setTimeout(() => {
      if (runId.current !== currentRun) return;
      const sourceStep = scenario.steps[activeIndex];
      setSteps((current) =>
        current.map((step, index) => (index === activeIndex ? { ...step, status: "completed" } : step)),
      );

      if (sourceStep.tool) {
        if (sourceStep.tool.requiresApproval) {
          setApprovals((current) => [
            ...current,
            { ...sourceStep.tool!, id: `approval-${sourceStep.id}`, status: "pending" },
          ]);
        } else {
          setActivities((current) => [
            ...current,
            {
              ...sourceStep.tool!,
              id: `activity-${sourceStep.id}`,
              timestamp: makeTimestamp(),
              status: "executed",
            },
          ]);
        }
      }
      setActiveIndex((index) => index + 1);
    }, STEP_DELAY);

    return () => window.clearTimeout(timer);
  }, [activeIndex, isRunning, scenario]);

  const resolveApproval = useCallback((id: string, status: "approved" | "declined") => {
    const target = approvals.find((approval) => approval.id === id);
    if (!target || target.status !== "pending") return;

    if (status === "approved") {
      setActivities((activity) => [
        ...activity,
        { ...target, id: `activity-${target.id}`, timestamp: makeTimestamp(), status: "executed" },
      ]);
    }
    setApprovals((current) =>
      current.map((approval) => (approval.id === id ? { ...approval, status } : approval)),
    );
  }, [approvals]);

  const progress = useMemo(() => {
    if (!steps.length) return 0;
    const completed = steps.filter((step) => step.status === "completed").length;
    return Math.round((completed / steps.length) * 100);
  }, [steps]);

  return {
    scenario,
    steps,
    activities,
    approvals,
    messages,
    isRunning,
    progress,
    startRun,
    resolveApproval,
  };
}
