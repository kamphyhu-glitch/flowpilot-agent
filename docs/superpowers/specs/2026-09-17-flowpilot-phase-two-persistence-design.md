# FlowPilot Phase Two Persistence Design

## Goal

Complete the product loop from planning through approval, persistent task execution, memory-aware re-planning, and explainable memory influence.

Phase two adds persistent Tasks and Memory behavior without starting the Evaluation Dashboard or changing the established visual direction.

## Scope

Phase two delivers:

- A typed localStorage repository as the single data source for Tasks and Memory.
- Persistent task creation after Agent approval.
- Complete Tasks create, view, edit, complete, and delete interactions.
- Complete Memory create, view, edit, and delete interactions.
- Preference, Goal, Habit, and Recent Context memory types.
- Automatic hard-constraint suggestions plus an explicit user-controlled toggle.
- Memory reads before every Agent planning run.
- Hard-constraint validation and plan correction before execution.
- Memory Influence in Agent Trace.
- A two-step demo proving that a preference learned in one request affects a later plan.

Phase two does not add Evaluation Dashboard behavior, authentication, cloud storage, or real external APIs.

## Architecture

### Persistent Repository

Tasks and Memory use one typed repository module backed by versioned localStorage keys. UI components and Agent orchestration never call localStorage directly.

The repository provides:

- Safe client-side hydration.
- Schema-aware parsing with an empty-state fallback for invalid stored values.
- CRUD operations for Tasks and Memory.
- A subscription interface compatible with `useSyncExternalStore`.
- Same-tab notifications after repository writes.
- Cross-tab synchronization through browser `storage` events.

Repository snapshots are the only persistent source of truth. React state may hold form drafts and one active Agent run, but it must not duplicate the canonical Task or Memory collections.

## Data Structures

### Task

```ts
type Task = {
  id: string;
  title: string;
  description?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  status: "todo" | "completed";
  source: "agent" | "user";
  sourceRunId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
};
```

Agent-written tasks retain the run identifier that created or changed them. User-created tasks use `source: "user"`.

### Memory

```ts
type Memory = {
  id: string;
  type: "preference" | "goal" | "habit" | "recent_context";
  content: string;
  isHardConstraint: boolean;
  source: "user" | "agent_inferred" | "demo_seed";
  confidence?: number;
  createdAt: string;
  updatedAt: string;
};
```

`confidence` is a zero-to-one value when present. User-entered Memory defaults to `source: "user"` without a confidence score. Automatically captured demo Memory uses `source: "agent_inferred"` with a visible confidence score.

## Hard-Constraint Classification

The Memory editor suggests `isHardConstraint: true` for clear prohibitive or mandatory expressions, including patterns such as:

- Chinese: 不要、不能、禁止、必须、不得、不安排.
- English: never, must, must not, do not, don't, cannot.

Ordinary preference language, including “I prefer” and “I don't like packed schedules,” remains a soft Preference by default.

The toggle is always visible and editable. Automatic classification supplies only the initial value when a Memory is created; subsequent user changes are authoritative and are never overwritten by reclassification.

## Planning and Constraint Validation

Before every run, the Agent reads the current Memory repository snapshot. Planning follows this order:

1. Select a deterministic scenario from the prompt.
2. Capture scenario-specific inferred Memory when applicable.
3. Read the updated Memory snapshot.
4. Apply hard constraints to the proposed plan.
5. Apply soft Preferences as optimization guidance.
6. Produce plan steps, approval payloads, and Agent Trace from the corrected plan.

The phase-two validator supports the demonstrable scheduling constraint “do not schedule before 10:00,” including equivalent Chinese and English expressions. Any proposed task or event beginning before 10:00 is shifted to 10:00 or later before it appears in Task Planning or Pending Approval. Duration is preserved when both start and end times are available.

Hard constraints must be satisfied. Soft Preferences may influence spacing, workload, and explanation but do not block execution.

## Memory Influence

Each active scenario exposes the Memory records actually used during planning. The Trace displays:

- Memory content.
- Memory type.
- Whether it is a hard constraint or soft influence.
- Enforcement state: `Enforced` for hard constraints and `Optimized` for soft Preferences.
- A plain-language explanation of how the Memory changed or supported the final decision.

Unused Memory is not shown in Memory Influence. The explanation must match the plan transformation that actually occurred.

## Approval and Task Side-Effect Boundary

Read-only tool calls continue to execute automatically.

Mutating operations remain side-effect free while pending. They may appear in Task Planning and Pending Approval, but they do not change the Task repository.

On approval:

- `create_task` and `create_event` create a persistent Task.
- `update_task` and `reschedule_event` update an existing Task matched by normalized title.
- `complete_task` marks a matched Task completed.
- The executed Tool Activity records the resulting Task identifier and persistence outcome.

If `update_task` or `reschedule_event` cannot find the original Task, the repository creates a new Agent Task. The Tool Activity output and Agent Trace explicitly record `Fallback: original task not found; created a new task`.

On decline, no repository write occurs.

Each approval can execute at most once. Re-rendering, Strict Mode, repeated clicks, or page navigation must not duplicate a Task.

## Tasks Page

The Tasks page replaces its phase-one placeholder with a persistent workspace that provides:

- A list with title, schedule, source, status, and creation time.
- Filters for all, open, and completed Tasks.
- User task creation.
- Inline or modal editing.
- Complete and reopen controls.
- Deletion with an in-product confirmation state before removal.
- A useful empty state.

Times are stored as ISO timestamps when a calendar date is known. Demo-relative schedules may retain a display schedule alongside optional normalized timestamps so their intended wording remains clear.

## Memory Page

The Memory page replaces its phase-one placeholder with four visible categories:

- Preference.
- Goal.
- Habit.
- Recent Context.

Users can add, edit, and delete Memory. The editor exposes type, content, Hard Constraint, source, and optional confidence. Source is visible but only user-created values may be selected manually; inferred and demo sources come from Agent flows.

Hard Constraints and ordinary Preferences receive distinct visual labels while preserving the existing FlowPilot card system.

## Memory Demo

The Agent example area adds a two-step Memory demo:

1. The first example input states “我不喜欢日程太满.” The Agent stores it as a soft Preference with `source: "agent_inferred"` and a confidence score.
2. A later planning request omits that preference. The Agent reads Memory, preserves buffer time, and explains the influence in Trace.

The example must work across a page refresh. It does not clear or overwrite unrelated user Memory. Repeating step one updates or reuses the equivalent Memory instead of creating duplicates.

## State Transitions

```text
Memory editor or Agent inference
  -> Memory Repository
  -> Agent reads snapshot before planning
  -> Hard Constraint Validator
  -> Soft Preference Optimizer
  -> Corrected Plan + Memory Influence
  -> Pending Approval
  -> Approve
  -> Task Repository
  -> Tasks page subscription updates
```

Task transitions:

```text
Draft -> Pending Approval -> Approved -> Persisted Todo -> Completed
                           -> Declined -> No Task write
```

## Error Handling

- Invalid localStorage data falls back to an empty collection without crashing the app.
- Repository writes surface a local error if storage is unavailable.
- Empty Task and Memory titles are rejected in the form.
- Duplicate inferred Memory is updated rather than appended.
- Approval execution uses a stable approval identifier and refuses a second execution.
- Unmatched update or reschedule operations use the documented fallback and expose it to the user.

## Testing and Verification

Automated tests cover:

- Task and Memory repository CRUD.
- Serialization and hydration recovery.
- Hard-constraint classification defaults.
- User override persistence.
- Before-10:00 constraint correction.
- Soft Preference influence without hard blocking.
- Approval boundary: no Task before approval and one Task after approval.
- Decline produces no Task.
- Update and reschedule fallback creation with explicit trace/activity metadata.
- Duplicate inferred Memory prevention.

Browser verification covers:

- Agent approval creates a Task visible on the Tasks page.
- Refresh preserves Tasks and Memory.
- Task edit, complete, reopen, and delete.
- Memory add, edit, toggle, and delete.
- Two-step Memory demo changes a later plan and Trace.
- Desktop and mobile layouts remain usable.

Completion requires `npm run lint`, the test command, `npm run build`, and `npm audit` to pass.

## Deferred Work

- Evaluation Dashboard and failure-case management.
- Broad natural-language constraint parsing beyond the demonstrated time-floor rule.
- Real LLM memory extraction or confidence calibration.
- Server persistence, authentication, and synchronization across users.
- Undo history and bulk Task or Memory operations.
