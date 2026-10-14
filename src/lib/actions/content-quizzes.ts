"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { createAdminClient } from "@/lib/supabase/admin";

function revalidate() {
  revalidatePath("/admin/quizzes", "layout");
  revalidatePath("/admin/content", "layout");
}

// ── Quiz ───────────────────────────────────────────────

export async function criarQuiz(fd: FormData) {
  const titulo = (fd.get("titulo") as string | null)?.trim();
  if (!titulo) throw new Error("Título obrigatório");

  const quiz = await prisma.quiz.create({
    data: { titulo },
  });
  revalidate();
  return quiz.id;
}

export async function atualizarQuiz(quizId: string, fd: FormData) {
  const titulo = (fd.get("titulo") as string | null)?.trim();
  const descricao = (fd.get("descricao") as string | null)?.trim() || null;
  const capa_url = (fd.get("capa_url") as string | null)?.trim() || null;
  const publicado = fd.get("publicado") === "on";

  await prisma.quiz.update({
    where: { id: quizId },
    data: { titulo: titulo ?? undefined, descricao, capa_url, publicado },
  });
  revalidate();
  revalidatePath(`/admin/quizzes/${quizId}`);
}

export async function deletarQuiz(quizId: string) {
  await prisma.quiz.delete({ where: { id: quizId } });
  revalidatePath("/admin/quizzes");
}

// ── Questão ────────────────────────────────────────────

export async function criarQuestao(quizId: string, fd: FormData) {
  const enunciado = (fd.get("enunciado") as string | null)?.trim();
  if (!enunciado) throw new Error("Enunciado obrigatório");

  const tipo = (fd.get("tipo") as string) || "MULTIPLA_ESCOLHA";
  const imagem_url = (fd.get("imagem_url") as string | null)?.trim() || null;

  const last = await prisma.questao.findFirst({
    where: { quiz_id: quizId },
    orderBy: { ordem: "desc" },
    select: { ordem: true },
  });

  const questao = await prisma.questao.create({
    data: {
      quiz_id: quizId,
      enunciado,
      tipo: tipo as "MULTIPLA_ESCOLHA" | "VERDADEIRO_FALSO" | "ESCOLHA_IMAGEM",
      imagem_url,
      ordem: (last?.ordem ?? -1) + 1,
    },
  });

  // Para VERDADEIRO_FALSO cria as opções automaticamente
  if (tipo === "VERDADEIRO_FALSO") {
    await prisma.opcao.createMany({
      data: [
        { questao_id: questao.id, texto: "Verdadero", correta: false, ordem: 0 },
        { questao_id: questao.id, texto: "Falso", correta: false, ordem: 1 },
      ],
    });
  }

  revalidatePath(`/admin/quizzes/${quizId}`);
  return questao.id;
}

export async function atualizarQuestao(questaoId: string, quizId: string, fd: FormData) {
  const enunciado = (fd.get("enunciado") as string | null)?.trim();
  const explicacao = (fd.get("explicacao") as string | null)?.trim() || null;
  const imagem_url = (fd.get("imagem_url") as string | null)?.trim() || null;
  const termo = (fd.get("termo") as string | null)?.trim() || null;

  await prisma.questao.update({
    where: { id: questaoId },
    data: { enunciado: enunciado ?? undefined, explicacao, imagem_url, termo },
  });
  revalidatePath(`/admin/quizzes/${quizId}`);
}

export async function deletarQuestao(questaoId: string, quizId: string) {
  await prisma.questao.delete({ where: { id: questaoId } });
  revalidatePath(`/admin/quizzes/${quizId}`);
}

export async function reordenarQuestoes(quizId: string, ids: string[]) {
  await Promise.all(
    ids.map((id, ordem) => prisma.questao.update({ where: { id }, data: { ordem } }))
  );
  revalidatePath(`/admin/quizzes/${quizId}`);
}

// ── Opção ──────────────────────────────────────────────

export async function criarOpcao(questaoId: string, quizId: string, fd: FormData) {
  const texto = (fd.get("texto") as string | null)?.trim() || "";
  const imagem_url = (fd.get("imagem_url") as string | null)?.trim() || null;
  const correta = fd.get("correta") === "on";

  const last = await prisma.opcao.findFirst({
    where: { questao_id: questaoId },
    orderBy: { ordem: "desc" },
    select: { ordem: true },
  });

  await prisma.opcao.create({
    data: {
      questao_id: questaoId,
      texto,
      imagem_url,
      correta,
      ordem: (last?.ordem ?? -1) + 1,
    },
  });
  revalidatePath(`/admin/quizzes/${quizId}`);
}

export async function atualizarOpcao(opcaoId: string, quizId: string, fd: FormData) {
  const texto = (fd.get("texto") as string | null)?.trim() || "";
  const imagem_url = (fd.get("imagem_url") as string | null)?.trim() || null;
  const correta = fd.get("correta") === "on";

  await prisma.opcao.update({
    where: { id: opcaoId },
    data: { texto, imagem_url, correta },
  });
  revalidatePath(`/admin/quizzes/${quizId}`);
}

export async function marcarOpcaoCorreta(opcaoId: string, questaoId: string, quizId: string) {
  // Desmarca todas e marca só essa
  await prisma.opcao.updateMany({
    where: { questao_id: questaoId },
    data: { correta: false },
  });
  await prisma.opcao.update({
    where: { id: opcaoId },
    data: { correta: true },
  });
  revalidatePath(`/admin/quizzes/${quizId}`);
}

export async function deletarOpcao(opcaoId: string, quizId: string) {
  await prisma.opcao.delete({ where: { id: opcaoId } });
  revalidatePath(`/admin/quizzes/${quizId}`);
}

// ── Vínculo Tópico ↔ Quiz ──────────────────────────────

export async function vincularQuizAoTopico(topicoId: string, fd: FormData) {
  const quizId = fd.get("quizId") as string;
  if (!quizId) return;

  const last = await prisma.topicoQuiz.findFirst({
    where: { topico_id: topicoId },
    orderBy: { ordem: "desc" },
    select: { ordem: true },
  });

  await prisma.topicoQuiz.upsert({
    where: { topico_id_quiz_id: { topico_id: topicoId, quiz_id: quizId } },
    create: { topico_id: topicoId, quiz_id: quizId, ordem: (last?.ordem ?? -1) + 1 },
    update: {},
  });
  revalidatePath("/admin/content");
}

export async function desvincularQuizDoTopico(topicoId: string, quizId: string) {
  await prisma.topicoQuiz.delete({
    where: { topico_id_quiz_id: { topico_id: topicoId, quiz_id: quizId } },
  });
  revalidatePath("/admin/content");
}

// ── Imagens do Quiz ────────────────────────────────────

export async function uploadImagemQuiz(
  quizId: string,
  fd: FormData
): Promise<{ url: string }> {
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
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from("capas")
    .list(`quizzes/${quizId}`, { limit: 200, sortBy: { column: "created_at", order: "desc" } });

  if (error || !data) return [];

  return data
    .filter((f) => f.name !== ".emptyFolderPlaceholder" && (f.metadata?.size ?? 0) > 0)
    .map((f) => ({
      id: f.id ?? f.name,
      nome: f.name,
      url: supabase.storage.from("capas").getPublicUrl(`quizzes/${quizId}/${f.name}`).data.publicUrl,
    }));
}
