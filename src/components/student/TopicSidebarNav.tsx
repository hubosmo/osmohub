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
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const allIds = [...sections.map(s => s.id), "continua"];

    const handleIntersect: IntersectionObserverCallback = (entries) => {
      // Find the topmost visible section (closest to top of viewport)
      let topmost: { id: string; top: number } | null = null;
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const top = entry.boundingClientRect.top;
          if (!topmost || top < topmost.top) {
            topmost = { id: entry.target.id, top };
          }
        }
      }
      if (topmost) setActiveId(topmost.id);
    };

    observerRef.current = new IntersectionObserver(handleIntersect, {
      // Trigger when section enters the zone between the sticky breadcrumb (48px) and 40% from bottom
      rootMargin: "-56px 0px -40% 0px",
      threshold: 0,
    });

    for (const id of allIds) {
      const el = document.getElementById(id);
      if (el) observerRef.current.observe(el);
    }

    return () => observerRef.current?.disconnect();
  }, [sections]);

  const isActive = (id: string) => activeId === id;

  return (
    <>
      {sections.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="flex items-center gap-2 text-sm py-2 px-2 rounded-md transition-colors"
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
        </a>
      ))}

      {sections.length > 0 && (
        <div className="my-2 border-t" style={{ borderColor: "var(--border)" }} />
      )}

      <a
        href="#continua"
        className="flex items-center gap-2 text-sm py-2 px-2 rounded-md transition-colors"
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
      </a>
    </>
  );
}
