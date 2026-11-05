"use client";

import { useCallback, useSyncExternalStore } from "react";

type Kind = "local" | "session";

// Só guarda valores que não puderam ser gravados (storage bloqueado), para o estado ainda funcionar na sessão.
const fallback = new Map<string, string>();
const listeners = new Set<() => void>();

function readStorage(kind: Kind, key: string): string | null {
  try {
    return (kind === "local" ? window.localStorage : window.sessionStorage).getItem(key);
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function useStoredValue(kind: Kind, key: string): [string | null, (value: string) => void] {
  const id = `${kind}:${key}`;
  // No servidor e na hidratação o valor é sempre null: evita divergência de HTML.
  const value = useSyncExternalStore(
    subscribe,
    () => readStorage(kind, key) ?? fallback.get(id) ?? null,
    () => null,
  );

  const set = useCallback((next: string) => {
    try {
      (kind === "local" ? window.localStorage : window.sessionStorage).setItem(key, next);
      fallback.delete(id);
    } catch {
      fallback.set(id, next);
    }
    listeners.forEach((notify) => notify());
  }, [kind, key, id]);

  return [value, set];
}

export const useLocalStorageValue = (key: string) => useStoredValue("local", key);
export const useSessionStorageValue = (key: string) => useStoredValue("session", key);
