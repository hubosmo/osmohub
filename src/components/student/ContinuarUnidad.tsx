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

  const src = (!isDark && topic.thumbnailLight) ? topic.thumbnailLight : topic.thumbnail;

  return (
    <div
      className="rounded-xl border overflow-hidden flex"
      style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)", minHeight: 96 }}
    >
      {/* Imagem — ocupa toda a altura à esquerda */}
      <div className="shrink-0 w-20 sm:w-32" style={{ backgroundColor: "var(--bg-elevated)" }}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <BookOpen className="h-7 w-7" style={{ color: "var(--text-muted)" }} />
          </div>
        )}
      </div>

      {/* Lado direito: dois blocos empilhados */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Bloco 1: breadcrumb */}
        <div
          className="flex items-center gap-1 px-3 py-2 border-b text-[10px] shrink-0"
          style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          <span className="truncate">{topic.areaNome}</span>
          <span>›</span>
          <span className="font-semibold truncate" style={{ color: "var(--accent)" }}>
            {topic.disciplinaNome}
          </span>
        </div>

        {/* Bloco 2: título + descrição + botão */}
        <div className="flex items-center gap-2 px-3 py-2.5 flex-1">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold leading-snug line-clamp-2" style={{ color: "var(--accent)" }}>
              {topic.titulo}
            </p>
            {topic.descricao && (
              <p className="text-[10px] mt-0.5 line-clamp-1 hidden sm:block" style={{ color: "var(--text-muted)" }}>
                {topic.descricao}
              </p>
            )}
          </div>
          <Link
            href={topic.path}
            className="shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white uppercase tracking-wide transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--accent)" }}
          >
            Continuar
          </Link>
        </div>
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
