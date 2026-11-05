"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// false no servidor e na hidratação, true depois: para UI que só existe no navegador.
export function useIsClient(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
