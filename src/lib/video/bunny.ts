import { env } from "@/lib/env";

// Link de incorporar (/embed/) ou de compartilhar (/play/) do Bunny Stream
const BUNNY_URL = /(?:iframe|player)\.mediadelivery\.net\/(?:embed|play)\/(\d+)\/([0-9a-fA-F-]{36})/;

export function parseBunnyUrl(url: string | null | undefined): { libraryId: string; videoId: string } | null {
  const m = url?.match(BUNNY_URL);
  return m ? { libraryId: m[1], videoId: m[2] } : null;
}

// A capa que o Bunny gera fica no domínio de entrega da biblioteca (ex.: vz-xxxx.b-cdn.net)
export function bunnyThumbnailUrl(videoId: string): string | null {
  const host = env.BUNNY_CDN_HOSTNAME?.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  return host ? `https://${host}/${videoId}/thumbnail.jpg` : null;
}

// Duração em segundos, consultada na API do Bunny (chave só no servidor). Null se não houver chave ou falhar.
export async function fetchBunnyDuration(libraryId: string, videoId: string): Promise<number | null> {
  const key = env.BUNNY_STREAM_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`, {
      headers: { AccessKey: key, accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { length?: number };
    return typeof data.length === "number" && data.length > 0 ? Math.round(data.length) : null;
  } catch {
    return null;
  }
}
