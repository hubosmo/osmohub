"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { marcarArtigoLido } from "@/lib/actions/progresso";

// O fim do artigo precisa ficar visível por este tempo, para um artigo curto não contar como lido só por abrir a página
const TEMPO_VISIVEL_MS = 2000;

// Vai logo depois do artigo: marca o artigo como lido quando o aluno chega ao fim e permanece ali.
export function ArtigoLidoTracker({ topicoId, jaLido }: { topicoId: string; jaLido: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const el = ref.current;
    if (jaLido || !el) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !timer) {
        timer = setTimeout(async () => {
          observer.disconnect();
          if (await marcarArtigoLido(topicoId)) router.refresh();
        }, TEMPO_VISIVEL_MS);
      } else if (!entry.isIntersecting && timer) {
        clearTimeout(timer);
        timer = null;
      }
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [topicoId, jaLido, router]);

  return <div ref={ref} aria-hidden="true" style={{ height: 1 }} />;
}
