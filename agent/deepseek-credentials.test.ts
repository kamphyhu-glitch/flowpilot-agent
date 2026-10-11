import { describe, expect, it } from "vitest";
import {
  clearSessionApiKey,
  readSessionApiKey,
  resolveDeepSeekCredential,
  saveSessionApiKey,
} from "@/agent/deepseek-credentials";

function createStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe("DeepSeek visitor credentials", () => {
  it("keeps a valid key in session storage and removes it on disconnect", () => {
    const storage = createStorage();

    expect(saveSessionApiKey(storage, "  sk-visitor-example-123  ")).toBe(true);
    expect(readSessionApiKey(storage)).toBe("sk-visitor-example-123");

    clearSessionApiKey(storage);
    expect(readSessionApiKey(storage)).toBeNull();
  });

  it("rejects blank, whitespace-containing, and oversized keys", () => {
    const storage = createStorage();

    expect(saveSessionApiKey(storage, "   ")).toBe(false);
    expect(saveSessionApiKey(storage, "sk-key with spaces")).toBe(false);
    expect(saveSessionApiKey(storage, `sk-${"x".repeat(300)}`)).toBe(false);
    expect(readSessionApiKey(storage)).toBeNull();
  });

  it("prefers a visitor key and never falls through to the deployment key when it is invalid", () => {
    expect(resolveDeepSeekCredential("sk-visitor-example-123", "sk-deployment-example-123"))
      .toEqual({ apiKey: "sk-visitor-example-123", source: "visitor" });
    expect(resolveDeepSeekCredential("invalid key", "sk-deployment-example-123"))
      .toEqual({ source: "invalid_visitor" });
    expect(resolveDeepSeekCredential(null, "sk-deployment-example-123"))
      .toEqual({ apiKey: "sk-deployment-example-123", source: "deployment" });
    expect(resolveDeepSeekCredential(null, undefined)).toEqual({ source: "none" });
  });
});
