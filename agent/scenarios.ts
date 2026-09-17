import { demoCases } from "@/data/demo-cases";
import { mockTool } from "@/tools/mock-tools";
import type { AgentScenario } from "@/types/agent";

const interview: AgentScenario = {
  id: "interview",
  label: "Interview day",
  shortLabel: "Interview + SQL",
  prompt: demoCases[0].prompt,
  response: "I’ll protect your energy, check the practical constraints first, then propose only the actions that need your approval.",
  steps: [
    { id: "i-1", title: "Understand the goal", description: "Extract the interview time, location, study goal, and pacing preference." },
    { id: "i-2", title: "Check tomorrow’s calendar", description: "Find open focus blocks without crowding the day.", tool: mockTool("get_calendar", { date: "Tomorrow" }, { availability: "09:30–13:20 open", conflicts: "None" }, "Calendar availability checked") },
    { id: "i-3", title: "Check Shenzhen weather", description: "Use weather risk to size the travel buffer.", tool: mockTool("get_weather", { city: "Shenzhen", time: "Tomorrow afternoon" }, { forecast: "Light rain", risk: "Medium", temperature: "24°C" }, "Rain risk assessed") },
    { id: "i-4", title: "Estimate travel time", description: "Calculate travel plus a calm arrival buffer.", tool: mockTool("estimate_route", { destination: "Shenzhen interview", arrival: "14:30" }, { travel: "45 min", buffer: "35 min", leave: "13:10" }, "Route and buffer estimated") },
    { id: "i-5", title: "Add SQL focus session", description: "Reserve one focused hour in the morning.", tool: mockTool("create_task", { title: "SQL Learning", time: "10:00–11:00" }, { task: "Created", id: "task_sql_01" }, "Create SQL Learning · 10:00–11:00") },
    { id: "i-6", title: "Add interview preparation", description: "Create a focused preparation block with a recovery gap.", tool: mockTool("create_task", { title: "Interview Preparation", time: "11:30–12:30" }, { task: "Created", id: "task_interview_01" }, "Create Interview Preparation · 11:30–12:30") },
    { id: "i-7", title: "Block travel time", description: "Hold travel time while preserving a relaxed buffer.", tool: mockTool("create_event", { title: "Travel to interview", time: "13:10–14:30" }, { event: "Created", id: "event_travel_01" }, "Create Travel to interview · 13:10–14:30") },
  ],
  trace: {
    goal: "Prepare for a 15:00 Shenzhen interview while making progress on SQL.",
    constraints: ["Interview at 15:00", "Shenzhen", "Avoid a packed schedule"],
    tools: ["Calendar Tool", "Weather Tool", "Route Tool", "Task Tool"],
    decision: "Use two focused morning blocks and leave at 13:10.",
    reasons: ["45 min estimated travel", "35 min rain and arrival buffer", "30 min break between deep-work blocks"],
  },
};

const paper: AgentScenario = {
  id: "paper",
  label: "Weekly focus",
  shortLabel: "Paper + SQL",
  prompt: demoCases[1].prompt,
  response: "I’ll spread the work across the week, keep daily SQL compact, and preserve one intentionally light evening.",
  steps: [
    { id: "p-1", title: "Break down weekly goals", description: "Separate the paper milestone from the recurring SQL habit." },
    { id: "p-2", title: "Scan this week’s calendar", description: "Find sustainable focus windows and existing commitments.", tool: mockTool("get_calendar", { range: "This week" }, { focus_windows: "6", busy_days: "Tuesday, Thursday" }, "Weekly capacity checked") },
    { id: "p-3", title: "Set a workload ceiling", description: "Limit planned deep work to two blocks per day." },
    { id: "p-4", title: "Create paper milestones", description: "Draft, revise, and final-review checkpoints.", tool: mockTool("create_task", { title: "Paper milestones", schedule: "Mon / Wed / Fri" }, { tasks: "3 created", final_review: "Friday 16:00" }, "Create three paper milestones") },
    { id: "p-5", title: "Create SQL routine", description: "Use one hour on lighter days and a shorter block on busy days.", tool: mockTool("create_task", { title: "SQL practice", cadence: "Daily, adaptive" }, { tasks: "5 created", total: "4 hours" }, "Create adaptive SQL study routine") },
    { id: "p-6", title: "Protect recovery time", description: "Keep Thursday evening free and leave gaps between blocks." },
  ],
  trace: {
    goal: "Finish the paper this week and maintain daily SQL practice.",
    constraints: ["No overloaded days", "Daily learning habit", "Paper due this week"],
    tools: ["Calendar Tool", "Task Tool"],
    decision: "Plan three paper milestones and adaptive SQL blocks across five days.",
    reasons: ["Tuesday and Thursday are already busy", "Two deep-work blocks per day maximum", "Thursday evening stays open"],
  },
};

const recovery: AgentScenario = {
  id: "recovery",
  label: "Low-energy evening",
  shortLabel: "Re-plan tonight",
  prompt: demoCases[2].prompt,
  response: "I’ll keep the one important task, defer lower-priority work, and give you a real stopping point tonight.",
  steps: [
    { id: "r-1", title: "Recognize today’s capacity", description: "Treat low energy as a planning constraint, not a failure." },
    { id: "r-2", title: "Review tonight’s tasks", description: "Identify priority, effort, and deadlines.", tool: mockTool("get_calendar", { date: "Today", window: "18:00–22:00" }, { events: "SQL review, portfolio copy, inbox", load: "High" }, "Evening workload reviewed") },
    { id: "r-3", title: "Choose the minimum win", description: "Keep a short, low-friction SQL review." },
    { id: "r-4", title: "Shorten SQL review", description: "Reduce the study block to a manageable 25 minutes.", tool: mockTool("update_task", { title: "SQL review", from: "60 min", to: "25 min" }, { task: "Updated", time: "19:30–19:55" }, "Shorten SQL review to 25 minutes") },
    { id: "r-5", title: "Move portfolio work", description: "Reschedule the high-focus task to tomorrow morning.", tool: mockTool("reschedule_event", { title: "Portfolio copy", from: "Tonight", to: "Tomorrow 10:00" }, { event: "Rescheduled", time: "Tomorrow 10:00–11:00" }, "Move portfolio copy to tomorrow at 10:00") },
    { id: "r-6", title: "Set a stopping point", description: "Leave the rest of the evening unplanned after 20:00." },
  ],
  trace: {
    goal: "Reduce tonight’s workload while preserving meaningful progress.",
    constraints: ["Low energy today", "Avoid losing important work", "Keep the evening light"],
    tools: ["Calendar Tool", "Task Tool"],
    decision: "Do a 25-minute SQL review, then stop; move portfolio work to tomorrow.",
    reasons: ["SQL review has low activation energy", "Portfolio writing needs stronger focus", "An explicit stopping point prevents over-planning"],
  },
};

export const scenarios = [interview, paper, recovery];

export function getScenario(prompt: string): AgentScenario {
  if (/论文|paper|每天|daily/i.test(prompt)) return paper;
  if (/累|晚上|疲|tired|evening/i.test(prompt)) return recovery;
  return interview;
}
