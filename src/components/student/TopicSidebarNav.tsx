"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";

interface Section {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface Props {
  sections: Section[];
}

export function TopicSidebarNav({ sections }: Props) {
  const [activeId, setActiveId] = useState<string>("");
  const programmingScrollRef = useRef(false);
  const suppressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const allIds = [...sections.map(s => s.id), "continua"];

    function updateActive() {
      if (programmingScrollRef.current) return;
      const threshold = Math.max(100, window.innerHeight * 0.5);
      let currentId = "";
      for (const id of allIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= threshold) {
          currentId = id;
        }
      }
      setActiveId(currentId || (allIds[0] ?? ""));
    }

    window.addEventListener("scroll", updateActive, { passive: true });
    updateActive();
    return () => window.removeEventListener("scroll", updateActive);
  }, [sections]);

  const isActive = (id: string) => activeId === id;

  function scrollTo(id: string) {
    // Lock scroll-event updates for the duration of the smooth scroll
    // so the optimistic highlight doesn't flicker mid-animation.
    programmingScrollRef.current = true;
    if (suppressTimerRef.current) clearTimeout(suppressTimerRef.current);
    suppressTimerRef.current = setTimeout(() => {
      programmingScrollRef.current = false;
    }, 700);

    setActiveId(id);
    const el = document.getElementById(id);
    if (!el) return;
    const top = window.scrollY + el.getBoundingClientRect().top - 64;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    window.history.replaceState(null, "", `#${id}`);
  }

  return (
    <>
      {sections.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => scrollTo(s.id)}
          className="flex items-center gap-2 text-sm py-2 px-2 rounded-md transition-colors text-left w-full"
          style={{
            color: isActive(s.id) ? "var(--accent)" : "var(--text-secondary)",
            backgroundColor: isActive(s.id) ? "color-mix(in srgb, var(--accent) 10%, transparent)" : "transparent",
            fontWeight: isActive(s.id) ? 600 : 400,
          }}
        >
          <span style={{ color: isActive(s.id) ? "var(--accent)" : "var(--text-muted)" }}>
            {s.icon}
          </span>
          {s.label}
        </button>
      ))}

      {sections.length > 0 && (
        <div className="my-2 border-t" style={{ borderColor: "var(--border)" }} />
      )}

      <button
        type="button"
        onClick={() => scrollTo("continua")}
        className="flex items-center gap-2 text-sm py-2 px-2 rounded-md transition-colors text-left w-full"
        style={{
          color: isActive("continua") ? "var(--accent)" : "var(--text-secondary)",
          backgroundColor: isActive("continua") ? "color-mix(in srgb, var(--accent) 10%, transparent)" : "transparent",
          fontWeight: isActive("continua") ? 600 : 400,
        }}
      >
        <ChevronRight
          className="h-4 w-4 shrink-0"
          style={{ color: isActive("continua") ? "var(--accent)" : "var(--text-muted)" }}
        />
        Continúa tu aprendizaje
      </button>
    </>
  );
}
