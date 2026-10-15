import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { QuizPlayer } from "@/components/student/QuizPlayer";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ back?: string; time?: string; exclude?: string; attempts?: string }>;
}

export default async function QuizSessionPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { back, time, exclude, attempts } = await searchParams;

  const quiz = await prisma.quiz.findUnique({
    where: { id, publicado: true },
    select: {
      id: true,
      titulo: true,
      capa_url: true,
      questoes: {
        orderBy: { ordem: "asc" },
        select: {
          id: true,
          enunciado: true,
          tipo: true,
          imagem_url: true,
          explicacao: true,
          termo: true,
          opcoes: {
            orderBy: { ordem: "asc" },
            select: { id: true, texto: true, imagem_url: true, correta: true },
          },
        },
      },
    },
  });

  if (!quiz || quiz.questoes.length === 0) notFound();

  const backUrl = back ?? "/cursos";
  const initialTime     = time     ? parseInt(time)     : undefined;
  const initialExclude  = exclude  ? exclude.split("|") : undefined;
  const initialAttempts = attempts ? parseInt(attempts) : undefined;

  return (
    <QuizPlayer
      quiz={quiz}
      backUrl={backUrl}
      initialTime={initialTime}
      initialExclude={initialExclude}
      initialAttempts={initialAttempts}
    />
  );
}
