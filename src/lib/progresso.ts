// Pontuação mínima para considerar um quiz aprovado (o mesmo limiar da tela de resultado: confete e anel verde)
export const PONTUACAO_APROVACAO = 70;

export type StatusTopico = "incompleta" | "em-progresso" | "completa";

export type PartesTopico = {
  temArtigo: boolean;
  artigoLido: boolean;
  temQuiz: boolean;
  quizAprovado: boolean;
};

// Um tópico tem até duas partes mensuráveis: o artigo lido e o quiz aprovado. Vídeo, atlas e tabelas não entram
// porque não há como medir se o aluno os viu. Devolve null se o tópico não tem nenhuma parte mensurável.
export function calcularStatusTopico(p: PartesTopico): StatusTopico | null {
  const partes: boolean[] = [];
  if (p.temArtigo) partes.push(p.artigoLido);
  if (p.temQuiz) partes.push(p.quizAprovado);

  if (partes.length === 0) return null;
  const feitas = partes.filter(Boolean).length;
  if (feitas === 0) return "incompleta";
  return feitas === partes.length ? "completa" : "em-progresso";
}

export const ROTULO_STATUS: Record<StatusTopico, string> = {
  "incompleta": "Incompleta",
  "em-progresso": "En progreso",
  "completa": "Completa",
};
