# FlowPilot Phase One Design

## Goal

Build a polished, frontend-only product prototype that demonstrates how an AI-native task collaboration agent understands a goal, plans work, calls tools, explains decisions, and keeps the user in control.

Phase one prioritizes a complete, reliable demo experience over backend complexity. It does not integrate a real LLM API.

## Product Scope

Phase one delivers:

- A Next.js App Router project using React, TypeScript, and Tailwind CSS.
- A professional application shell with navigation for Agent, Tasks, Memory, and Evaluation.
- A complete Agent workspace.
- Three runnable example cases plus free-form task input.
- Visible, progressive task-planning execution.
- Mock calendar, task, weather, and route tool calls.
- A structured Agent Trace explaining goals, constraints, tools, decisions, and reasons.
- A mandatory approval flow for operations that would change user data.

Tasks, Memory, and Evaluation receive coherent page shells in phase one. Their full editing and persistence workflows belong to the next phase.

## Experience Architecture

The desktop Agent workspace uses three coordinated areas:

1. **Conversation** — natural-language input, assistant responses, and three example prompts.
2. **Execution** — a task plan whose steps visibly advance from `pending` to `running` to `completed`.
3. **Observability** — tool activity, pending approvals, executed actions, and an expandable decision trace.

On smaller screens, these areas stack without removing information or controls.

## Interaction Flow

1. The user submits a free-form prompt or selects an example.
2. The UI creates a deterministic mock plan appropriate to the prompt.
3. Plan steps appear immediately as pending.
4. A lightweight execution runner advances one step at a time. The active step receives a visible running treatment and progress indication.
5. Read-only tool calls may complete automatically and append structured activity records.
6. Mutating tool calls produce approval requests instead of executing immediately.
7. The user can approve or reject each proposed mutation.
8. Approved operations move from `Pending Approval` to `Executed`; rejected operations are recorded as declined.
9. The Agent Trace updates to summarize the decision and its supporting evidence.

The timing is intentionally short enough for a portfolio demo while still making the agent's work perceptible. Results must never appear as a single instantaneous dump.

## User-Control Rules

Read-only operations may execute without confirmation:

- `get_calendar`
- `get_weather`
- `estimate_route`

Mutating operations require explicit confirmation:

- `create_event`
- `reschedule_event`
- `create_task`
- `update_task`
- `complete_task`

Every approval card shows the intended operation and important parameters. No mutating activity may be labeled `Executed` before the user approves it.

## Component Boundaries

- `components/layout/` — sidebar, header, and shared page framing.
- `components/agent/` — chat, examples, plan timeline, tool activity, approval queue, and trace views.
- `agent/` — deterministic scenario selection, plan definitions, and execution orchestration.
- `tools/` — typed mock-tool registry and responses.
- `data/` — demo cases and display fixtures.
- `types/` — shared domain types for plans, tool calls, approvals, and traces.

UI components consume typed agent events and do not import tool fixtures directly. This keeps a future LLM/tool-runtime integration localized to the agent and tool layers.

## State and Persistence

Phase one uses React state for the active run. The model remains serializable so Tasks and Memory can adopt `localStorage` in phase two without changing the component contracts.

No authentication, database, server actions, or external API calls are introduced in phase one.

## Demo Cases

1. Shenzhen interview at 15:00 plus SQL study.
2. Finish a paper this week plus one hour of SQL daily without an overloaded schedule.
3. Re-plan evening tasks because the user feels tired.

Each case has a tailored plan, believable mock-tool records, at least one user-facing decision, and at least one mutation requiring approval.

## Visual Direction

- White and pale-gray surfaces with restrained borders.
- Black and neutral-gray typography.
- Blue-violet used only for active state, progress, and primary actions.
- Compact professional density inspired by Linear, Notion, OpenAI, and Apple.
- Minimal motion limited to meaningful progress and state transitions.
- No excessive gradients, decorative animation, or gamification.

## Error and Reset Behavior

- Empty prompts are not submitted.
- Starting another example cleanly resets the current run.
- Timer effects are cancelled on reset and component unmount.
- Approvals remain actionable after plan execution finishes.
- Mock-tool failures are outside phase-one scope; the tool interface will permit error states later.

## Verification

Phase one is complete when:

- The app installs and starts locally.
- The production build passes with no TypeScript errors.
- All three examples run end to end.
- Users can clearly see pending, running, and completed planning states.
- Tool activity shows tool name, input, output, and timestamp.
- Mutating actions enter `Pending Approval` and become `Executed` only after approval.
- The Agent Trace explains the goal, constraints, tools, decision, and reasons.
- The layout remains usable on desktop and mobile widths.

## Deferred Work

- Full Tasks CRUD and persistence.
- Editable and persistent Preference, Goal, Habit, and Recent Context memory.
- Evaluation scoring and failure-case management.
- Real LLM, calendar, weather, maps, or task integrations.
- Authentication, cloud sync, and multi-user support.
