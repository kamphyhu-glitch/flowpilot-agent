"use client";

import { createPersistentRepository } from "@/data/repository";
import type { Memory, NewMemory, NewTask, Task } from "@/types/persistent";

const TASKS_KEY = "flowpilot.tasks.v1";
const MEMORIES_KEY = "flowpilot.memories.v1";

function getBrowserStorage() {
  return typeof window === "undefined" ? null : window.localStorage;
}

function isTask(value: unknown): value is Task {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Task>;
  return typeof item.id === "string" && typeof item.title === "string" &&
    (item.status === "todo" || item.status === "completed") &&
    (item.source === "agent" || item.source === "user") &&
    typeof item.createdAt === "string" && typeof item.updatedAt === "string";
}

function isMemory(value: unknown): value is Memory {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Memory>;
  return typeof item.id === "string" && typeof item.content === "string" &&
    ["preference", "goal", "habit", "recent_context"].includes(item.type ?? "") &&
    typeof item.isHardConstraint === "boolean" &&
    ["user", "agent_inferred", "demo_seed"].includes(item.source ?? "") &&
    typeof item.createdAt === "string" && typeof item.updatedAt === "string";
}

export const taskRepository = createPersistentRepository<Task>({
  key: TASKS_KEY,
  getStorage: getBrowserStorage,
  isValid: isTask,
});

export const memoryRepository = createPersistentRepository<Memory>({
  key: MEMORIES_KEY,
  getStorage: getBrowserStorage,
  isValid: isMemory,
});

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function addTask(input: NewTask) {
  const now = new Date().toISOString();
  return taskRepository.create({ ...input, id: createId("task"), createdAt: now, updatedAt: now });
}

export function updateTask(id: string, update: Partial<Omit<Task, "id" | "createdAt">>) {
  return taskRepository.update(id, { ...update, updatedAt: new Date().toISOString() });
}

export function addMemory(input: NewMemory) {
  const now = new Date().toISOString();
  return memoryRepository.create({ ...input, id: createId("memory"), createdAt: now, updatedAt: now });
}

export function updateMemory(id: string, update: Partial<Omit<Memory, "id" | "createdAt">>) {
  return memoryRepository.update(id, { ...update, updatedAt: new Date().toISOString() });
}

export function upsertInferredMemory(input: NewMemory) {
  const existing = findEquivalentMemory(memoryRepository.getSnapshot(), input);
  if (existing) return updateMemory(existing.id, { ...input });
  return addMemory(input);
}

export function findEquivalentMemory(memories: readonly Memory[], input: Pick<NewMemory, "type" | "content">) {
  const normalized = input.content.trim().toLocaleLowerCase();
  return memories.find(
    (memory) => memory.type === input.type && memory.content.trim().toLocaleLowerCase() === normalized,
  );
}
