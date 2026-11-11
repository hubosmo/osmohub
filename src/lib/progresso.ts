// Pontuação mínima para considerar um quiz aprovado (o mesmo limiar da tela de resultado: confete e anel verde)
export const PONTUACAO_APROVACAO = 70;

export type StatusTopico = "incompleta" | "em-progresso" | "completa";

// Fração do vídeo que o aluno precisa ter reproduzido (tempo realmente assistido, não posição) para contar como assistido
export const FRACAO_VIDEO_ASSISTIDO = 0.8;

export type PartesTopico = {
  // Só conta se o vídeo está num player que informa o progresso (YouTube, Vimeo ou Bunny)
  temVideo: boolean;
  videoAssistido: boolean;
  temQuiz: boolean;
  quizAprovado: boolean;
  // Alternativa: só vale quando o tema não tem vídeo mensurável nem quiz publicado
  temArtigo: boolean;
  artigoLido: boolean;
};

export type ParteDoTopico = { id: "video" | "quiz" | "artigo"; texto: string; feita: boolean };

// O status depende do vídeo assistido e do quiz aprovado. Se o tema não tem nenhum dos dois, o artigo lido vale como
// alternativa; atlas e tabelas nunca entram. Os textos são os que o aluno lê para saber o que falta.
export function partesDoTopico(p: PartesTopico): ParteDoTopico[] {
  const partes: ParteDoTopico[] = [];
  if (p.temVideo) partes.push({ id: "video", texto: `Mira el video (al menos el ${Math.round(FRACAO_VIDEO_ASSISTIDO * 100)} %)`, feita: p.videoAssistido });
  if (p.temQuiz) partes.push({ id: "quiz", texto: `Aprueba un cuestionario con ${PONTUACAO_APROVACAO} % o más`, feita: p.quizAprovado });
  if (partes.length === 0 && p.temArtigo) partes.push({ id: "artigo", texto: "Lee el artículo hasta el final", feita: p.artigoLido });
  return partes;
}

// Devolve null se o tópico não tem nenhuma parte mensurável.
export function calcularStatusTopico(p: PartesTopico): StatusTopico | null {
  const partes = partesDoTopico(p);
  if (partes.length === 0) return null;
  const feitas = partes.filter((x) => x.feita).length;
  if (feitas === 0) return "incompleta";
  return feitas === partes.length ? "completa" : "em-progresso";
}

export const ROTULO_STATUS: Record<StatusTopico, string> = {
  "incompleta": "Incompleta",
  "em-progresso": "En progreso",
  "completa": "Completa",
};
