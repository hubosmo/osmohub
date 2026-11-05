import { notFound } from "next/navigation";
import { getQuizParaSessao } from "@/lib/db/quizzes";
import { QuizPlayer } from "@/components/student/QuizPlayer";
import { safeInternalPath } from "@/lib/safe-redirect";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ back?: string; time?: string; exclude?: string; attempts?: string }>;
}

export default async function QuizSessionPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { back, time, exclude, attempts } = await searchParams;

  const quiz = await getQuizParaSessao(id);

  if (!quiz || quiz.questoes.length === 0) notFound();

  const backUrl = safeInternalPath(back, "/cursos");
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
