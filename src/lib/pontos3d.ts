import { z } from "zod";

// Pontos numerados do Atlas 3D (ADR 0017). Os valores seguem o formato do <model-viewer> e são guardados como texto.
export const MAX_PONTOS_POR_MODELO = 50;
export const TITULO_PONTO_MAX = 80;
export const TEXTO_PONTO_MAX = 1500;

const NUM = "-?(?:\\d+\\.?\\d*|\\.\\d+)(?:e[-+]?\\d+)?";
// "x y z", com "m" opcional em cada valor (posição, normal e alvo da câmera)
const VETOR3 = new RegExp(`^${NUM}m?(?:\\s+${NUM}m?){2}$`, "i");
// "theta phi raio": os dois primeiros em rad/deg, o raio em m ou %
const ORBITA = new RegExp(`^${NUM}(?:rad|deg)\\s+${NUM}(?:rad|deg)\\s+${NUM}(?:m|%)$`, "i");

export const vetor3Valido = (v: string): boolean => VETOR3.test(v.trim());
export const orbitaValida = (v: string): boolean => ORBITA.test(v.trim());

const opcional = (regex: RegExp, mensagem: string) =>
  z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((v) => (v ? v : null))
    .refine((v) => v === null || regex.test(v), mensagem);

export const dadosPontoSchema = z.object({
  titulo: z.string().trim().min(1, "Escribe un título.").max(TITULO_PONTO_MAX, `El título admite hasta ${TITULO_PONTO_MAX} caracteres.`),
  texto: z
    .string()
    .trim()
    .max(TEXTO_PONTO_MAX, `El texto admite hasta ${TEXTO_PONTO_MAX} caracteres.`)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
  posicao: z.string().trim().refine((v) => VETOR3.test(v), "Posición inválida."),
  normal: opcional(VETOR3, "Normal inválida."),
  orbita: opcional(ORBITA, "Vista de cámara inválida."),
  alvo: opcional(VETOR3, "Objetivo de cámara inválido."),
});

export type DadosPonto = z.output<typeof dadosPontoSchema>;
export type EntradaPonto = z.input<typeof dadosPontoSchema>;

const casas = (n: number) => (Number.isFinite(n) ? n.toFixed(5) : "0");

export function vetorParaTexto(v: { x: number; y: number; z: number }): string {
  return `${casas(v.x)}m ${casas(v.y)}m ${casas(v.z)}m`;
}

export function orbitaParaTexto(o: { theta: number; phi: number; radius: number }): string {
  return `${casas(o.theta)}rad ${casas(o.phi)}rad ${casas(o.radius)}m`;
}
