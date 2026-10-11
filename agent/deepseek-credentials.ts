export const DEEPSEEK_KEY_HEADER = "X-FlowPilot-DeepSeek-Key";
export const DEEPSEEK_SESSION_KEY = "flowpilot.deepseek.session-key";

type SessionStorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function normalizeDeepSeekApiKey(value: string | null | undefined) {
  if (!value) return null;
  const normalized = value.trim();
  if (normalized.length < 8 || normalized.length > 256) return null;
  if (!/^[\x21-\x7e]+$/.test(normalized)) return null;
  return normalized;
}

export function readSessionApiKey(storage: SessionStorageLike) {
  try {
    return normalizeDeepSeekApiKey(storage.getItem(DEEPSEEK_SESSION_KEY));
  } catch {
    return null;
  }
}

export function saveSessionApiKey(storage: SessionStorageLike, value: string) {
  const normalized = normalizeDeepSeekApiKey(value);
  if (!normalized) return false;
  try {
    storage.setItem(DEEPSEEK_SESSION_KEY, normalized);
    return true;
  } catch {
    return false;
  }
}

export function clearSessionApiKey(storage: SessionStorageLike) {
  try {
    storage.removeItem(DEEPSEEK_SESSION_KEY);
  } catch {
    // A blocked storage API is equivalent to an already-cleared session.
  }
}

export function resolveDeepSeekCredential(
  visitorValue: string | null,
  deploymentValue: string | undefined,
): { apiKey?: string; source: "visitor" | "deployment" | "invalid_visitor" | "none" } {
  if (visitorValue !== null) {
    const visitorKey = normalizeDeepSeekApiKey(visitorValue);
    return visitorKey
      ? { apiKey: visitorKey, source: "visitor" }
      : { source: "invalid_visitor" };
  }
  const deploymentKey = normalizeDeepSeekApiKey(deploymentValue);
  return deploymentKey
    ? { apiKey: deploymentKey, source: "deployment" }
    : { source: "none" };
}
