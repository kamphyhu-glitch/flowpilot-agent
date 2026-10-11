"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { requestAgentRun } from "@/agent/agent-client";
import { runDeterministicAgent } from "@/agent/deterministic-adapter";
import { executeTaskTool } from "@/agent/task-execution";
import { inferMemoryFromPrompt } from "@/agent/memory-planning";
import { useModelConnection } from "@/agent/use-model-connection";
import { memoryRepository, taskRepository, upsertInferredMemory } from "@/data/persistent-store";
import type {
  AgentRuntime,
  AgentScenario,
  Approval,
  ChatMessage,
  PlanStep,
  ToolActivity,
} from "@/types/agent";

const STEP_DELAY = 720;

function makeTimestamp() {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());
}

export function useAgentRun() {
  const modelConnection = useModelConnection();
  const [scenario, setScenario] = useState<AgentScenario | null>(null);
  const [steps, setSteps] = useState<PlanStep[]>([]);
  const [activities, setActivities] = useState<ToolActivity[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [runtime, setRuntime] = useState<AgentRuntime | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const runId = useRef(0);
  const activeRunId = useRef("");
  const resolvedApprovals = useRef(new Set<string>());

  const startRun = useCallback(async (prompt: string) => {
    runId.current += 1;
    const currentRun = runId.current;
    activeRunId.current = `run_${Date.now()}_${runId.current}`;
    resolvedApprovals.current.clear();
    const inferredMemory = inferMemoryFromPrompt(prompt);
    if (inferredMemory) upsertInferredMemory(inferredMemory);
    const request = {
      userInput: prompt,
      memories: [...memoryRepository.getSnapshot()],
      tasks: [...taskRepository.getSnapshot()],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Shanghai",
    };
    setScenario(null);
    setRuntime(null);
    setSteps([
      {
        id: "live-connect",
        title: "Connect to planning model",
        description: "Send the goal and bounded local context through the server adapter.",
        status: "running",
      },
      {
        id: "live-memory",
        title: "Read saved memory",
        description: "Load preferences and hard constraints before planning.",
        status: "pending",
      },
      {
        id: "live-tools",
        title: "Select tools and build plan",
        description: "Use approved mock tools and prepare write actions for review.",
        status: "pending",
      },
    ]);
    setActivities([]);
    setApprovals([]);
    setMessages([{ id: `${currentRun}-user`, role: "user", content: prompt }]);
    setActiveIndex(-1);
    setIsRunning(true);

    let result;
    try {
      result = await requestAgentRun(request, modelConnection.apiKey);
    } catch {
      result = runDeterministicAgent(request, "The live Agent endpoint could not be reached.");
    }
    if (runId.current !== currentRun) return;

    setRuntime(result.runtime);
    setScenario(result.scenario);
    setSteps(result.scenario.steps.map((step) => ({ ...step, status: "pending" })));
    setMessages([
      { id: `${currentRun}-user`, role: "user", content: prompt },
      { id: `${currentRun}-assistant`, role: "assistant", content: result.scenario.response },
    ]);
    setActiveIndex(0);
  }, [modelConnection.apiKey]);

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
    if (!target || target.status !== "pending" || resolvedApprovals.current.has(id)) return;
    resolvedApprovals.current.add(id);

    if (status === "approved") {
      const result = executeTaskTool(target, activeRunId.current);
      const executedTool = {
        ...target,
        output: {
          ...target.output,
          persistence: result.outcome,
          ...(result.taskId ? { task_id: result.taskId } : {}),
          ...(result.fallback ? { fallback: result.fallback } : {}),
        },
      };
      setActivities((activity) => [
        ...activity,
        { ...executedTool, id: `activity-${target.id}`, timestamp: makeTimestamp(), status: "executed" },
      ]);
      const fallback = result.fallback;
      if (fallback) {
        setScenario((current) => current ? {
          ...current,
          trace: {
            ...current.trace,
            executionNotes: [...(current.trace.executionNotes ?? []), fallback],
          },
        } : current);
      }
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
    runtime,
    steps,
    activities,
    approvals,
    messages,
    isRunning,
    progress,
    modelConnection,
    startRun,
    resolveApproval,
  };
}
