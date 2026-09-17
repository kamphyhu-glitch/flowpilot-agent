"use client";

import { useAgentRun } from "@/agent/use-agent-run";
import { AgentTrace } from "@/components/agent/agent-trace";
import { ApprovalPanel } from "@/components/agent/approval-panel";
import { ChatPanel } from "@/components/agent/chat-panel";
import { PlanPanel } from "@/components/agent/plan-panel";
import { ToolActivity } from "@/components/agent/tool-activity";

export function AgentWorkspace() {
  const agent = useAgentRun();

  return (
    <div className="grid items-start gap-4 p-4 md:p-5 xl:grid-cols-[minmax(285px,0.84fr)_minmax(340px,1.05fr)_minmax(290px,0.86fr)]">
      <ChatPanel messages={agent.messages} isRunning={agent.isRunning} onSubmit={agent.startRun} />
      <PlanPanel steps={agent.steps} isRunning={agent.isRunning} progress={agent.progress} />
      <div className="space-y-4">
        <ApprovalPanel approvals={agent.approvals} onResolve={agent.resolveApproval} />
        <ToolActivity activities={agent.activities} />
        <AgentTrace trace={agent.scenario?.trace} />
      </div>
    </div>
  );
}
