// Busca flexível de temas: compara o começo das palavras (o radical), sem acento e sem diferenciar maiúsculas,
// para que "anatomia" também ache "anatómicos". Função pura, usada pela busca do servidor.

export function semAcento(texto: string): string {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// Palavras curtas ficam inteiras; as longas perdem as 2 últimas letras (terminação), mantendo pelo menos 4.
// Ex.: anatomia → anatom, anatómicos → anatomi, músculos → muscul, huesos → hues, de → de.
export function radical(palavra: string): string {
  return palavra.length <= 4 ? palavra : palavra.slice(0, Math.max(4, palavra.length - 2));
}

// Lista de radicais da consulta (uma por palavra); o tema precisa conter todos. Só letras e números, o resto separa palavras.
export function radicaisDaBusca(consulta: string): string[] {
  const palavras = semAcento(consulta).split(/[^a-z0-9ñ]+/).filter(Boolean);
  return [...new Set(palavras.map(radical))];
}
