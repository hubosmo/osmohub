// Redução de imagens no navegador do admin, antes do envio (o corpo de uma requisição na Vercel é limitado a 4,5 MB
// e o aluno não precisa de fotos de vários MB). Só roda no cliente: usa canvas.

export type TipoSaida = "image/webp" | "image/jpeg";

export type OpcoesCompressao = {
  // Maior lado (largura ou altura) em pixels; imagens menores não são ampliadas
  ladoMax: number;
  tipo: TipoSaida;
  qualidade: number;
};

export type ResultadoCompressao = {
  arquivo: File;
  antes: number;
  depois: number;
  // false quando o arquivo original foi mantido (formato que não se comprime ou resultado maior que o original)
  reduziu: boolean;
};

// Imagens do atlas e dos questionários: o aluno amplia com a lupa (2,8×), então fica mais alta que as capas
export const COMPRESSAO_ATLAS: OpcoesCompressao = { ladoMax: 1600, tipo: "image/webp", qualidade: 0.82 };

// Formatos que passam pelo canvas. GIF (pode ser animado) e SVG (vetorial) seguem intactos.
const COMPRIMIVEIS = ["image/jpeg", "image/png", "image/webp"];

const EXTENSAO: Record<TipoSaida, string> = { "image/webp": "webp", "image/jpeg": "jpg" };

function nomeNovo(nome: string, tipo: TipoSaida): string {
  const base = nome.replace(/\.[^.]+$/, "") || "imagen";
  return `${base}.${EXTENSAO[tipo]}`;
}

function paraBlob(canvas: HTMLCanvasElement, tipo: TipoSaida, qualidade: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, tipo, qualidade));
}

// Nunca lança: em qualquer falha devolve o arquivo original, para o envio seguir como antes
export async function comprimirImagem(arquivo: File, opcoes: OpcoesCompressao): Promise<ResultadoCompressao> {
  const original: ResultadoCompressao = { arquivo, antes: arquivo.size, depois: arquivo.size, reduziu: false };
  if (!COMPRIMIVEIS.includes(arquivo.type) || typeof createImageBitmap !== "function") return original;

  try {
    // createImageBitmap respeita a orientação EXIF (fotos de celular não saem deitadas)
    const bitmap = await createImageBitmap(arquivo);
    const razao = Math.min(1, opcoes.ladoMax / Math.max(bitmap.width, bitmap.height));
    const largura = Math.max(1, Math.round(bitmap.width * razao));
    const altura = Math.max(1, Math.round(bitmap.height * razao));

    const canvas = document.createElement("canvas");
    canvas.width = largura;
    canvas.height = altura;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return original;
    }
    // JPEG não tem transparência: sem fundo, as áreas transparentes de um PNG sairiam pretas
    if (opcoes.tipo === "image/jpeg") {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, largura, altura);
    }
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, largura, altura);
    bitmap.close();

    const blob = await paraBlob(canvas, opcoes.tipo, opcoes.qualidade);
    // Se o resultado não ficou menor, vale mais manter o arquivo original do que o recomprimido.
    // Navegador sem suporte ao formato devolve PNG em vez do tipo pedido: também mantém o original.
    if (!blob || blob.type !== opcoes.tipo || blob.size >= arquivo.size) return original;

    const novo = new File([blob], nomeNovo(arquivo.name, opcoes.tipo), { type: opcoes.tipo });
    return { arquivo: novo, antes: arquivo.size, depois: novo.size, reduziu: true };
  } catch {
    return original;
  }
}
