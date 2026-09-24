"use client";

import { useEffect } from "react";

export type LastTopicData = {
  path: string;
  titulo: string;
  descricao: string | null;
  areaNome: string;
  disciplinaNome: string;
  cursoNome: string;
  thumbnail: string | null;
  totalTopicos: number;
};

export function LastTopicTracker({ data }: { data: LastTopicData }) {
  useEffect(() => {
    try {
      localStorage.setItem("osmo_last_topic", JSON.stringify(data));
    } catch {}
  }, [data]);

  return null;
}
