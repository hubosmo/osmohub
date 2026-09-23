import { notFound } from "next/navigation";
import { getAreaPorSlug } from "@/lib/db/cursos";
import { AreaTopicos } from "@/components/student/AreaTopicos";

interface PageProps {
  params: Promise<{ curso: string; disciplina: string; area: string }>;
}

export default async function AreaPage({ params }: PageProps) {
  const { curso: cursoSlug, disciplina: disciplinaSlug, area: areaSlug } = await params;
  const area = await getAreaPorSlug(cursoSlug, disciplinaSlug, areaSlug).catch(() => null);
  if (!area) notFound();

  const { disciplina } = area;

  return (
    <div className="-mx-4 lg:-mx-8 -mt-6">
      <AreaTopicos
        cursoSlug={cursoSlug}
        disciplinaSlug={disciplinaSlug}
        areaSlug={areaSlug}
        cursoNome={disciplina.curso.nome}
        disciplinaNome={disciplina.nome}
        areaNome={area.nome}
        accentColor={disciplina.cor_destaque ?? "#00A6FF"}
        areaDescricao={area.descricao ?? null}
        capaUrl={area.capa_url ?? null}
        capaUrlLight={area.capa_url_light ?? null}
        topicos={area.topicos.map((t) => ({
          id: t.id,
          slug: t.slug,
          titulo: t.titulo,
          descricao_curta: t.descricao_curta ?? null,
          duracao_estimada_min: t.duracao_estimada_min ?? null,
          video: t.video ? { id: t.video.id } : null,
          artigo: t.artigo ? { id: t.artigo.id } : null,
        }))}
      />
    </div>
  );
}
