"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function TopLoader() {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef(0);
  const activeRef = useRef(false);

  function start() {
    const bar = barRef.current;
    if (!bar || activeRef.current) return;
    activeRef.current = true;
    progressRef.current = 0;
    bar.style.transition = "none";
    bar.style.width = "0%";
    bar.style.opacity = "1";

    // force reflow so the reset takes effect before we start animating
    bar.getBoundingClientRect();

    bar.style.transition = "width 0.2s ease";
    timerRef.current = setInterval(() => {
      progressRef.current = Math.min(progressRef.current + Math.random() * 12 + 3, 85);
      bar.style.width = progressRef.current + "%";
    }, 180);
  }

  function finish() {
    if (!activeRef.current) return;
    activeRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    const bar = barRef.current;
    if (!bar) return;
    bar.style.transition = "width 0.15s ease";
    bar.style.width = "100%";
    setTimeout(() => {
      bar.style.transition = "opacity 0.25s ease";
      bar.style.opacity = "0";
      setTimeout(() => {
        bar.style.transition = "none";
        bar.style.width = "0%";
      }, 280);
    }, 150);
  }

  // finish when pathname changes (navigation complete)
  useEffect(() => {
    finish();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // intercept link clicks to start the bar
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      // skip external, hash, mailto, tel links and same-page
      if (
        href.startsWith("http") ||
        href.startsWith("//") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) return;
      if (anchor.target === "_blank") return;
      // skip if ctrl/meta/middle click (opens new tab)
      if (e.ctrlKey || e.metaKey || e.button === 1) return;
      start();
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: 3,
        width: "0%",
        opacity: 0,
        backgroundColor: "#00a6ff",
        boxShadow: "0 0 8px #00a6ff88",
        zIndex: 99999,
        pointerEvents: "none",
      }}
    />
  );
}
