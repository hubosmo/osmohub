"use server";

import { prisma } from "@/lib/db/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/admin";

// ── Imagens do Quiz ────────────────────────────────────

export async function uploadImagemQuiz(
  quizId: string,
  fd: FormData
): Promise<{ url: string }> {
  await requireAdmin();
  const file = fd.get("file") as File | null;
  if (!file || file.size === 0) throw new Error("Arquivo inválido");

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const storagePath = `quizzes/${quizId}/${Date.now()}.${ext}`;
  const bytes = await file.arrayBuffer();

  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from("capas")
    .upload(storagePath, bytes, { contentType: file.type, upsert: false });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("capas").getPublicUrl(storagePath);
  return { url: data.publicUrl };
}

export async function listarImagensQuiz(
  quizId: string
): Promise<{ id: string; url: string; nome: string }[]> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from("capas")
    .list(`quizzes/${quizId}`, { limit: 200 });

  if (error) return [];
  if (!data) return [];

  return data
    .filter((f) => f.name !== ".emptyFolderPlaceholder")
    .map((f) => ({
      id: f.id ?? f.name,
      nome: f.name,
      url: supabase.storage.from("capas").getPublicUrl(`quizzes/${quizId}/${f.name}`).data.publicUrl,
    }));
}

export async function listarImagensGaleria(): Promise<{
  quiz: { id: string; url: string; nome: string }[];
  atlas: { id: string; url: string; nome: string }[];
}> {
  await requireAdmin();
  const [opcoes, questoes, quizCaps, atlasImgs] = await Promise.all([
    prisma.opcao.findMany({
      where: { imagem_url: { not: null } },
      select: { id: true, imagem_url: true, texto: true },
      take: 300,
    }),
    prisma.questao.findMany({
      where: { imagem_url: { not: null } },
      select: { id: true, imagem_url: true, enunciado: true },
      take: 200,
    }),
    prisma.quiz.findMany({
      where: { capa_url: { not: null } },
      select: { id: true, capa_url: true, titulo: true },
    }),
    prisma.imagemTopico.findMany({
      select: { id: true, url: true, legenda: true },
      take: 500,
    }),
  ]);

  const seenQuiz = new Set<string>();
  const quiz: { id: string; url: string; nome: string }[] = [];

  for (const o of opcoes) {
    if (o.imagem_url && !seenQuiz.has(o.imagem_url)) {
      seenQuiz.add(o.imagem_url);
      quiz.push({ id: `opc-${o.id}`, url: o.imagem_url, nome: o.texto || "Opción" });
    }
  }
  for (const q of questoes) {
    if (q.imagem_url && !seenQuiz.has(q.imagem_url)) {
      seenQuiz.add(q.imagem_url);
      quiz.push({ id: `q-${q.id}`, url: q.imagem_url, nome: q.enunciado.slice(0, 40) });
    }
  }
  for (const q of quizCaps) {
    if (q.capa_url && !seenQuiz.has(q.capa_url)) {
      seenQuiz.add(q.capa_url);
      quiz.push({ id: `quiz-${q.id}`, url: q.capa_url, nome: q.titulo });
    }
  }

  const seenAtlas = new Set<string>();
  const atlas = atlasImgs
    .filter(i => {
      if (!i.url || seenAtlas.has(i.url)) return false;
      seenAtlas.add(i.url);
      return true;
    })
    .map(i => ({
      id: `atlas-${i.id}`,
      url: i.url,
      nome: i.legenda?.replace(/<[^>]+>/g, "").slice(0, 50) || "Imagen",
    }));

  return { quiz, atlas };
}
