export const demoCases = [
  {
    id: "interview",
    number: "01",
    title: "Interview day",
    description: "Balance preparation, SQL study, travel, and buffer time.",
    prompt: "我明天下午3点在深圳面试，还要学习SQL，帮我安排一下。",
  },
  {
    id: "paper",
    number: "02",
    title: "Weekly focus",
    description: "Finish a paper and keep a sustainable SQL habit.",
    prompt: "我这周要完成论文，还想每天学习1小时SQL，但不要把日程排得太满。",
  },
  {
    id: "recovery",
    number: "03",
    title: "Low-energy evening",
    description: "Re-plan tonight without losing the important work.",
    prompt: "今天有点累，帮我重新安排晚上的任务。",
  },
  {
    id: "memory-loop",
    number: "04",
    title: "Memory-aware planning",
    description: "Teach a preference, then plan again without repeating it.",
    prompt: "我不喜欢日程太满，请记住这个偏好。",
    followUpPrompt: "根据我的偏好，帮我安排明天的SQL学习和作品集修改。",
  },
] as const;
