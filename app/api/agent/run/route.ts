import { runDeepSeekAgent } from "@/agent/deepseek-adapter";
import { runDeterministicAgent } from "@/agent/deterministic-adapter";
import { parseAgentRunRequest } from "@/agent/runtime-contract";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 100_000;

const fallbackMessages: Record<string, string> = {
  missing_api_key: "DeepSeek is not configured on this deployment.",
  provider_request_failed: "DeepSeek was unavailable for this run.",
  empty_model_output: "DeepSeek returned an empty response.",
  invalid_model_output: "DeepSeek returned an invalid structured plan.",
  invalid_tool_arguments: "A model tool call failed argument validation.",
  unknown_tool: "The model requested an unsupported tool.",
  tool_loop_limit: "The live tool loop reached its safety limit.",
  tool_call_limit: "The live plan requested too many tool calls.",
  request_timeout: "The live planning request timed out.",
};

function safeFallbackReason(error: unknown) {
  if (error instanceof DOMException && error.name === "TimeoutError") return fallbackMessages.request_timeout;
  const code = error instanceof Error ? error.message : "";
  return fallbackMessages[code] ?? "Live planning could not complete safely.";
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return Response.json({ error: "Agent run request is too large." }, { status: 413 });
  }
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) return Response.json({ error: "Origin is not allowed." }, { status: 403 });
    } catch {
      return Response.json({ error: "Origin is not allowed." }, { status: 403 });
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON request." }, { status: 400 });
  }
  const input = parseAgentRunRequest(body);
  if (!input) return Response.json({ error: "Invalid agent run request." }, { status: 400 });

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return Response.json(runDeterministicAgent(input, fallbackMessages.missing_api_key));
  }

  try {
    const result = await runDeepSeekAgent(input, {
      apiKey,
      model: process.env.DEEPSEEK_MODEL,
    });
    return Response.json(result);
  } catch (error) {
    return Response.json(runDeterministicAgent(input, safeFallbackReason(error)));
  }
}
