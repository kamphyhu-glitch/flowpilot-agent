import { describe, expect, it } from "vitest";
import { createPersistentRepository, type StorageAdapter } from "@/data/repository";

type Item = { id: string; value: string; enabled: boolean };

class MemoryStorage implements StorageAdapter {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

function createStore(storage: MemoryStorage) {
  return createPersistentRepository<Item>({
    key: "test.items",
    getStorage: () => storage,
    isValid: (value): value is Item => Boolean(value && typeof value === "object" && typeof (value as Item).id === "string" && typeof (value as Item).value === "string"),
  });
}

describe("persistent repository", () => {
  it("creates, updates, removes, and hydrates items", () => {
    const storage = new MemoryStorage();
    const store = createStore(storage);
    store.create({ id: "one", value: "Original", enabled: false });
    store.update("one", { value: "Updated", enabled: true });

    const rehydrated = createStore(storage);
    expect(rehydrated.getSnapshot()).toEqual([{ id: "one", value: "Updated", enabled: true }]);

    rehydrated.remove("one");
    expect(rehydrated.getSnapshot()).toEqual([]);
  });

  it("recovers from malformed or invalid stored values", () => {
    const storage = new MemoryStorage();
    storage.setItem("test.items", "not-json");
    expect(createStore(storage).getSnapshot()).toEqual([]);

    storage.setItem("test.items", JSON.stringify([{ wrong: true }, { id: "valid", value: "Kept", enabled: true }]));
    expect(createStore(storage).getSnapshot()).toEqual([{ id: "valid", value: "Kept", enabled: true }]);
  });

  it("notifies subscribers after a write", () => {
    const storage = new MemoryStorage();
    const store = createStore(storage);
    let calls = 0;
    const unsubscribe = store.subscribe(() => { calls += 1; });
    store.create({ id: "one", value: "Saved", enabled: true });
    unsubscribe();
    expect(calls).toBe(1);
  });
});
