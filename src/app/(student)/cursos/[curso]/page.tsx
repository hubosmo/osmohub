import { notFound } from "next/navigation";
import { getCursoPorSlug } from "@/lib/db/cursos";
import { CursoDisciplinas } from "@/components/student/CursoDisciplinas";

interface PageProps {
  params: Promise<{ curso: string }>;
}

export default async function CursoPage({ params }: PageProps) {
  const { curso: cursoSlug } = await params;
  const curso = await getCursoPorSlug(cursoSlug).catch(() => null);
  if (!curso) notFound();

  return (
    <div className="-mx-4 lg:-mx-8 -mt-6">
      <CursoDisciplinas
        cursoSlug={curso.slug}
        cursoNome={curso.nome}
        accentColor={curso.cor_destaque ?? "#00A6FF"}
        disciplinas={curso.disciplinas}
      />
    </div>
  );
}
