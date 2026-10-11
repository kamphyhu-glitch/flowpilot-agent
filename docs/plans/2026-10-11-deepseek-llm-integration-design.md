# FlowPilot DeepSeek LLM Integration Design

Date: 2026-10-11  
Status: Approved

## Objective

Add a real DeepSeek-backed planning path without weakening FlowPilot's existing deterministic safety boundaries. The model may understand goals, select mock tools, use tool results, and draft an explainable plan. Hard constraints, approval-gated writes, and localStorage persistence remain controlled by application code.

## Architecture

The Agent page calls a server-only Next.js route. The route selects a `DeepSeekAgentAdapter` when `DEEPSEEK_API_KEY` is configured and falls back to the existing deterministic scenario adapter when the live request cannot produce a valid result.

```text
Agent UI
  -> POST /api/agent/run
  -> DeepSeekAgentAdapter | Deterministic fallback
  -> deterministic memory and hard-constraint validation
  -> existing animated planning UI
  -> pending approval
  -> existing task executor and localStorage repository
```

## Model and tool loop

- Use the DeepSeek Responses API through its OpenAI-compatible endpoint.
- Default to `deepseek-flash`; allow `DEEPSEEK_MODEL` to override it.
- Run at most three function-calling rounds.
- Execute read-only mock tools immediately and return their results to the model.
- Treat mutating tool calls as proposals. They return `pending_approval` to the model and never write data on the server.
- Finish with a JSON Schema constrained synthesis request that returns the plan, response, trace, and memory influence data.

## Safety boundaries

- Keep `DEEPSEEK_API_KEY` server-only.
- Validate request size, memory/task snapshots, tool names, tool arguments, and final model output at runtime.
- Allow only the existing FlowPilot mock tool registry.
- Apply the existing deterministic hard-constraint validator after model output and before approvals appear.
- Preserve idempotent approval handling and existing task repository behavior.
- Never expose hidden model reasoning; Agent Trace contains only a concise decision summary.

## User experience

The existing page layout and step animation stay intact. A compact runtime indicator distinguishes:

- `Live · DeepSeek`
- `Fallback · Deterministic`

Fallback reasons are visible and are also included in the trace execution notes.

## Failure handling

Fall back when the key is missing, the request times out, the provider rejects the request, tool arguments are invalid, the tool loop exceeds its limit, or the structured output fails validation. The original deterministic scenarios remain available so the public demo still works.

## Verification

Automated tests cover adapter mapping, tool execution/proposal behavior, structured result validation, hard-constraint enforcement, approval side-effect boundaries, and fallback paths. Live provider verification is opt-in and is not part of the default deterministic test suite.
