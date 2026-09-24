"use client";

import { useEffect } from "react";
import { salvarUltimoTopico } from "@/lib/actions/progresso";

export type LastTopicData = {
  topicoId: string;
  path: string;
  titulo: string;
  descricao: string | null;
  areaNome: string;
  disciplinaNome: string;
  cursoNome: string;
  thumbnail: string | null;
  thumbnailLight: string | null;
  totalTopicos: number;
};

export function LastTopicTracker({ data }: { data: LastTopicData }) {
  useEffect(() => {
    try {
      localStorage.setItem("osmo_last_topic", JSON.stringify(data));
    } catch {}
    salvarUltimoTopico(data.topicoId).catch(() => {});
  }, [data.topicoId]);

  return null;
}
