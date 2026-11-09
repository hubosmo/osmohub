// Cria (ou confere) o bucket `modelos-3d` do Atlas 3D no Supabase. Idempotente: se já existe, só atualiza os limites.
// Uso: node --env-file=.env.local scripts/criar-bucket-modelos3d.mjs
// Leitura pública (o aluno baixa o GLB); escrita só pelo servidor, com a service role (URL assinada, ADR 0017).
import { createClient } from "@supabase/supabase-js";

const NOME = "modelos-3d";
const LIMITE_BYTES = 30 * 1024 * 1024;
const MIME = ["model/gltf-binary", "application/octet-stream"];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !chave) {
  console.error("Faltam NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (use --env-file=.env.local).");
  process.exit(1);
}

const supabase = createClient(url, chave, { auth: { autoRefreshToken: false, persistSession: false } });
const opcoes = { public: true, fileSizeLimit: LIMITE_BYTES, allowedMimeTypes: MIME };

const { data: existentes, error: erroLista } = await supabase.storage.listBuckets();
if (erroLista) {
  console.error("Não foi possível listar os buckets:", erroLista.message);
  process.exit(1);
}

const existe = existentes.some((b) => b.name === NOME);
const { error } = existe
  ? await supabase.storage.updateBucket(NOME, opcoes)
  : await supabase.storage.createBucket(NOME, opcoes);
if (error) {
  console.error(`Falha ao ${existe ? "atualizar" : "criar"} o bucket:`, error.message);
  process.exit(1);
}
console.log(`Bucket "${NOME}" ${existe ? "atualizado" : "criado"} (público, até ${LIMITE_BYTES / (1024 * 1024)} MB, GLB).`);
