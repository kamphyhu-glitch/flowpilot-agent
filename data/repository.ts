export type StorageAdapter = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

type RepositoryOptions<T extends { id: string }> = {
  key: string;
  getStorage: () => StorageAdapter | null;
  isValid: (value: unknown) => value is T;
};

export type PersistentRepository<T extends { id: string }> = {
  getSnapshot: () => readonly T[];
  getServerSnapshot: () => readonly T[];
  subscribe: (listener: () => void) => () => void;
  create: (item: T) => T;
  update: (id: string, update: Partial<T>) => T | undefined;
  remove: (id: string) => void;
  replace: (items: readonly T[]) => void;
  refresh: () => void;
};

const EMPTY_SNAPSHOT: readonly never[] = Object.freeze([]);

export function createPersistentRepository<T extends { id: string }>({
  key,
  getStorage,
  isValid,
}: RepositoryOptions<T>): PersistentRepository<T> {
  let snapshot: readonly T[] | undefined;
  const listeners = new Set<() => void>();

  function read(): readonly T[] {
    const storage = getStorage();
    if (!storage) return EMPTY_SNAPSHOT;
    try {
      const raw = storage.getItem(key);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(isValid) : [];
    } catch {
      return [];
    }
  }

  function getSnapshot() {
    if (!getStorage()) return EMPTY_SNAPSHOT;
    snapshot ??= read();
    return snapshot;
  }

  function emit() {
    listeners.forEach((listener) => listener());
  }

  function persist(items: readonly T[]) {
    const storage = getStorage();
    if (!storage) throw new Error("Persistent storage is unavailable.");
    storage.setItem(key, JSON.stringify(items));
    snapshot = [...items];
    emit();
  }

  return {
    getSnapshot,
    getServerSnapshot: () => EMPTY_SNAPSHOT,
    subscribe(listener) {
      listeners.add(listener);
      const handleStorage = (event: StorageEvent) => {
        if (event.key !== key) return;
        snapshot = undefined;
        listener();
      };
      if (typeof window !== "undefined") window.addEventListener("storage", handleStorage);
      return () => {
        listeners.delete(listener);
        if (typeof window !== "undefined") window.removeEventListener("storage", handleStorage);
      };
    },
    create(item) {
      persist([...getSnapshot(), item]);
      return item;
    },
    update(id, update) {
      const current = getSnapshot();
      const existing = current.find((item) => item.id === id);
      if (!existing) return undefined;
      const next = { ...existing, ...update };
      persist(current.map((item) => (item.id === id ? next : item)));
      return next;
    },
    remove(id) {
      persist(getSnapshot().filter((item) => item.id !== id));
    },
    replace(items) {
      persist(items);
    },
    refresh() {
      snapshot = undefined;
      emit();
    },
  };
}
