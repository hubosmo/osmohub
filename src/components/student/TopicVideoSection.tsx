import { PlayCircle } from "lucide-react";
import { CollapsibleCaption } from "./CollapsibleCaption";

type VideoProps = {
  titulo: string;
  descricao: string | null;
  legenda: string | null;
  youtube_url: string | null;
  duracao_seg: number | null;
};

function toVideoEmbed(url: string): string {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?color=6C63FF&title=0&byline=0&portrait=0`;
  return url;
}

function formatDuration(seg: number) {
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function TopicVideoSection({ video, playerId }: { video: VideoProps | null; playerId?: string }) {
  const embedUrl = video?.youtube_url ? toVideoEmbed(video.youtube_url) : null;

  return (
    <div className="flex flex-col gap-5">
      {video?.descricao && (
        <div
          className="text-base leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
          dangerouslySetInnerHTML={{ __html: video.descricao }}
        />
      )}

      {embedUrl ? (
        <div id={playerId} className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          <div style={{ aspectRatio: "16/9" }}>
            <iframe
              src={embedUrl}
              className="w-full h-full block"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>

          {video?.legenda ? (
            <CollapsibleCaption
              html={video.legenda}
              title={video.titulo}
              meta={video.duracao_seg ? formatDuration(video.duracao_seg) : undefined}
            />
          ) : (
            <div
              className="flex items-center gap-3 px-4 py-2.5"
              style={{ borderTop: "1px solid var(--border)", backgroundColor: "var(--bg-elevated)" }}
            >
              <p className="flex-1 text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                {video!.titulo}
              </p>
              {video!.duracao_seg && (
                <span className="shrink-0 text-xs tabular-nums" style={{ color: "var(--text-muted)" }}>
                  {formatDuration(video!.duracao_seg)}
                </span>
              )}
            </div>
          )}
        </div>
      ) : (
        <div
          className="rounded-xl flex flex-col items-center justify-center gap-3 py-16"
          style={{ backgroundColor: "var(--bg-elevated)", border: "1px dashed var(--border)" }}
        >
          <PlayCircle className="h-10 w-10" style={{ color: "var(--text-muted)", opacity: 0.4 }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Video no disponible aún</p>
        </div>
      )}
    </div>
  );
}
