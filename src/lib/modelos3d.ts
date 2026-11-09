import { z } from "zod";

// Atlas 3D (ADR 0017). Regras puras compartilhadas entre as actions e a interface.
export const BUCKET_MODELOS_3D = "modelos-3d";
export const MAX_BYTES_MODELO = 30 * 1024 * 1024;
export const TITULO_MAX = 120;
export const DESCRICAO_MAX = 500;
export const LICENCA_MAX = 80;
export const CREDITOS_MAX = 300;

// Licenças sugeridas no formulário (o campo continua livre). NC (uso não comercial) fica de fora de propósito.
export const LICENCAS_SUGERIDAS = ["CC0 / Dominio público", "CC BY 4.0", "CC BY-SA 4.0", "Propio / con permiso"] as const;

export function extensaoValida(nomeArquivo: string): boolean {
  return /\.glb$/i.test(nomeArquivo.trim());
}

// Caminho no bucket: uma pasta por modelo; o nome do arquivo é gerado (nunca o enviado pelo usuário)
export function caminhoDoArquivo(modeloId: string, agora: number = Date.now()): string {
  return `${modeloId}/${agora}.glb`;
}

export function urlPublicaDoArquivo(supabaseUrl: string, caminho: string): string {
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET_MODELOS_3D}/${caminho}`;
}

export function formatarTamanho(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const dadosModeloSchema = z.object({
  titulo: z.string().trim().min(1, "Escribe un título.").max(TITULO_MAX, `El título admite hasta ${TITULO_MAX} caracteres.`),
  descricao: z.string().trim().max(DESCRICAO_MAX).optional().transform((v) => (v ? v : null)),
  licenca: z.string().trim().max(LICENCA_MAX).optional().transform((v) => (v ? v : null)),
  creditos: z.string().trim().max(CREDITOS_MAX).optional().transform((v) => (v ? v : null)),
  publicado: z.boolean(),
});

export type DadosModelo = z.output<typeof dadosModeloSchema>;
