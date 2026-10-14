import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getQuizAdmin } from "@/lib/db/quizzes";
import { QuizPanel } from "@/components/admin/panels/QuizPanel";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function QuizEditPage({ params }: Props) {
  const { id } = await params;
  const quiz = await getQuizAdmin(id);
  if (!quiz) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 py-8">
      {/* Back */}
      <Link
        href="/admin/quizzes"
        className="inline-flex items-center gap-1.5 text-sm mb-6 transition-colors"
        style={{ color: "var(--text-muted)" }}
      >
        <ChevronLeft className="h-4 w-4" />
        Cuestionarios
      </Link>

      <QuizPanel data={{
        id: quiz.id,
        titulo: quiz.titulo,
        descricao: quiz.descricao,
        capa_url: quiz.capa_url,
        publicado: quiz.publicado,
        questoes: quiz.questoes.map(q => ({
          id: q.id,
          enunciado: q.enunciado,
          tipo: q.tipo,
          imagem_url: q.imagem_url,
          explicacao: q.explicacao,
          termo: q.termo,
          ordem: q.ordem,
          opcoes: q.opcoes.map(o => ({
            id: o.id,
            texto: o.texto,
            imagem_url: o.imagem_url,
            correta: o.correta,
            ordem: o.ordem,
          })),
        })),
      }} />
    </div>
  );
}
