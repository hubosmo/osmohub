"use client";

import { useEffect } from "react";
import { salvarUltimoTopico } from "@/lib/actions/content-ultimo-topico";

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
  const serialized = JSON.stringify(data);
  const { topicoId } = data;

  useEffect(() => {
    try {
      localStorage.setItem("osmo_last_topic", serialized);
    } catch {}
  }, [serialized]);

  useEffect(() => {
    salvarUltimoTopico(topicoId).catch(() => {});
  }, [topicoId]);

  return null;
}
