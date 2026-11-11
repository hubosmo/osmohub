export type ProvedorVideo = "youtube" | "vimeo" | "bunny";

// Provedores cujo player informa o progresso de reprodução (usado para contar o vídeo como assistido).
// Outras URLs continuam sendo exibidas, mas não entram no progresso do tópico.
export function provedorDoVideo(url: string | null | undefined): ProvedorVideo | null {
  if (!url) return null;
  if (/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))[a-zA-Z0-9_-]{11}/.test(url)) return "youtube";
  if (/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)\d+/.test(url)) return "vimeo";
  if (/(?:iframe|player)\.mediadelivery\.net\/(?:embed|play)\/\d+\/[0-9a-fA-F-]{36}/.test(url)) return "bunny";
  return null;
}
