import { bunnyThumbnailUrl, parseBunnyUrl } from "./bunny";

export async function resolveVideoThumbnail(url: string | null | undefined, saved: string | null | undefined): Promise<string | null> {
  if (saved) return saved;
  if (!url) return null;
  // YouTube
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/);
  if (yt) return `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`;
  // Vimeo
  const vimeo = url.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/);
  if (vimeo) {
    try {
      const res = await fetch(`https://vimeo.com/api/v2/video/${vimeo[1]}.json`, { next: { revalidate: 86400 } });
      const data = await res.json() as Array<{ thumbnail_large?: string }>;
      return data[0]?.thumbnail_large ?? null;
    } catch { return null; }
  }
  // Bunny Stream
  const bunny = parseBunnyUrl(url);
  if (bunny) return bunnyThumbnailUrl(bunny.videoId);
  return null;
}
