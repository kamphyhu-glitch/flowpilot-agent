# FlowPilot Phase 3 — Evaluation & Failure Analysis

## Scope

Phase 3 adds an isolated, reproducible evaluation domain without changing the existing Agent → Approval → Task Write → Memory Read → Re-plan loop.

The first evaluator uses versioned fixtures and deterministic assertions. It does not read or mutate the user's Tasks or Memory repositories and does not execute tools.

## Architecture

```text
Evaluation cases + fixtures
          ↓
EvaluatorAdapter
          ↓
DeterministicEvaluator
          ↓
EvaluationRun
          ↓
Evaluation Dashboard
```

`EvaluatorAdapter` is the stable boundary for future human-review, LLM-judge, or live-agent evaluators.

## Metrics

- Intent Understanding
- Task Planning
- Tool Use
- Context Consistency
- User Control
- Memory Compliance
- Constraint Compliance

Assertions use five deterministic verdicts: met = 5, mostly met = 4, partial = 3, mostly failed = 2, failed = 1.

A case score averages only its applicable metrics. Dashboard metric scores aggregate their associated assertions. Overall score is the equal-weighted average of the seven metric scores, so categories with more fixtures cannot dominate the result.

## Status rules

- Passed: score ≥ 4.0 and no High/Critical failure
- Partial: score 2.5–3.9
- Failed: score < 2.5 or a High/Critical failure exists

Failures are generated from failed assertion evidence and remain read-only. Historical resolved failures are supplied as versioned fixtures so before/after iterations remain reproducible.

## UI

The Evaluation page keeps the existing navigation and visual language. It contains:

1. Overall score, test count, status totals, and evaluator identity
2. Seven metric cards
3. Filterable, expandable test results with assertion evidence
4. Read-only failure cases with severity, root cause, and suggested fix
5. Before → Root Cause → Fix → After iteration comparison

## Test suite

The fixture suite contains 16 cases covering single and multi-task planning, time constraints, hard constraints, soft preferences, memory recall, multi-turn context, tool selection, approval boundaries, conflicting constraints, and abnormal inputs.

## Verification

Pure unit tests cover verdict mapping, weighted scoring, applicable-metric filtering, equal-weighted overall score, status thresholds, failure generation, determinism, and input immutability. Final verification runs `npm run lint`, `npm test`, and `npm run build`.
