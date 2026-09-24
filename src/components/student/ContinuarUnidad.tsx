"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import type { LastTopicData } from "./LastTopicTracker";

export function ContinuarUnidad() {
  const [topic, setTopic] = useState<LastTopicData | null>(null);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem("osmo_last_topic");
      if (raw) setTopic(JSON.parse(raw) as LastTopicData);
    } catch {}
  }, []);

  if (!mounted) return <ContinuarSkeleton />;

  if (!topic) {
    return (
      <div
        className="flex items-center gap-4 rounded-xl border p-5"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
      >
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: "var(--bg-elevated)" }}
        >
          <BookOpen className="h-5 w-5" style={{ color: "var(--text-muted)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            Todavía no has empezado a estudiar.
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Explora los temas disponibles y comienza tu primera unidad.
          </p>
        </div>
        <Link
          href="/cursos"
          className="shrink-0 px-4 py-2 rounded-lg text-xs font-bold text-white uppercase tracking-wide transition-colors"
          style={{ backgroundColor: "var(--accent)" }}
        >
          Explorar
        </Link>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
    >
      {/* Breadcrumb + contador */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b text-xs"
        style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-1.5 min-w-0" style={{ color: "var(--text-muted)" }}>
          <span className="truncate">{topic.areaNome}</span>
          <span>›</span>
          <span className="font-medium truncate" style={{ color: "var(--accent)" }}>
            {topic.disciplinaNome}
          </span>
        </div>
        <span className="shrink-0 ml-3 tabular-nums" style={{ color: "var(--text-muted)" }}>
          {topic.totalTopicos} {topic.totalTopicos === 1 ? "unidad" : "unidades"}
        </span>
      </div>

      {/* Conteúdo principal */}
      <div className="flex items-center gap-4 p-4">
        {/* Thumbnail */}
        <div
          className="shrink-0 h-16 w-20 rounded-lg overflow-hidden"
          style={{ backgroundColor: "var(--bg-elevated)" }}
        >
          {(() => {
            const src = (!isDark && topic.thumbnailLight) ? topic.thumbnailLight : topic.thumbnail;
            return src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <BookOpen className="h-6 w-6" style={{ color: "var(--text-muted)" }} />
              </div>
            );
          })()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-snug truncate" style={{ color: "var(--accent)" }}>
            {topic.titulo}
          </p>
          {topic.descricao && (
            <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "var(--text-muted)" }}>
              {topic.descricao}
            </p>
          )}
        </div>

        {/* Botão */}
        <Link
          href={topic.path}
          className="shrink-0 px-4 py-2 rounded-lg text-xs font-bold text-white uppercase tracking-wide transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--accent)" }}
        >
          Continuar
        </Link>
      </div>
    </div>
  );
}

function ContinuarSkeleton() {
  return (
    <div
      className="rounded-xl border h-[100px] animate-pulse"
      style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border)" }}
    />
  );
}
