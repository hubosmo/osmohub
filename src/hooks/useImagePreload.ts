"use client";

import { useEffect } from "react";
import { preloadImage } from "@/lib/image-preload";

export function useImagePreload(urls: string[]) {
  const key = urls.join("|");
  useEffect(() => {
    key.split("|").filter(Boolean).forEach((url) => { void preloadImage(url); });
  }, [key]);
}
