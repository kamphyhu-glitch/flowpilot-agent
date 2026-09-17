"use client";

import { useSyncExternalStore } from "react";
import { memoryRepository, taskRepository } from "@/data/persistent-store";

export function useTasks() {
  return useSyncExternalStore(
    taskRepository.subscribe,
    taskRepository.getSnapshot,
    taskRepository.getServerSnapshot,
  );
}

export function useMemories() {
  return useSyncExternalStore(
    memoryRepository.subscribe,
    memoryRepository.getSnapshot,
    memoryRepository.getServerSnapshot,
  );
}
