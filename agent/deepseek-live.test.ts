import { describe, expect, it } from "vitest";
import { loadEnv } from "vite";
import { runDeepSeekAgent } from "@/agent/deepseek-adapter";

const localEnv = loadEnv("test", process.cwd(), "DEEPSEEK_");
const apiKey = process.env.DEEPSEEK_API_KEY ?? localEnv.DEEPSEEK_API_KEY;
const model = process.env.DEEPSEEK_MODEL ?? localEnv.DEEPSEEK_MODEL;
const describeLive = apiKey ? describe : describe.skip;

describeLive("DeepSeek live adapter", () => {
  it("returns a validated live planning result", async () => {
    const result = await runDeepSeekAgent({
      userInput: "Plan one hour of SQL study tomorrow after 10 AM.",
      memories: [],
      tasks: [],
      timezone: "Asia/Shanghai",
    }, {
      apiKey: apiKey!,
      model,
    });
    expect(result.runtime.mode).toBe("live");
    expect(result.scenario.steps.length).toBeGreaterThan(0);
  }, 60_000);
});
