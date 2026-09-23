import { notFound } from "next/navigation";
import { getDisciplinaPorSlug } from "@/lib/db/cursos";
import { DisciplinaAreas } from "@/components/student/DisciplinaAreas";

interface PageProps {
  params: Promise<{ curso: string; disciplina: string }>;
}

export default async function DisciplinaPage({ params }: PageProps) {
  const { curso: cursoSlug, disciplina: disciplinaSlug } = await params;
  const disciplina = await getDisciplinaPorSlug(cursoSlug, disciplinaSlug).catch(() => null);
  if (!disciplina) notFound();

  return (
    <div className="-mx-4 lg:-mx-8 -mt-6">
      <DisciplinaAreas
        cursoSlug={cursoSlug}
        disciplinaSlug={disciplinaSlug}
        cursoNome={disciplina.curso.nome}
        disciplinaNome={disciplina.nome}
        disciplinaDescricao={disciplina.descricao ?? null}
        disciplinaIcone={disciplina.icone ?? null}
        accentColor={disciplina.cor_destaque ?? "#00A6FF"}
        areas={disciplina.areas}
      />
    </div>
  );
}
