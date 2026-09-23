import {
  getFullTreeAdmin,
  getCursoAdmin,
  getDisciplinaAdmin,
  getAreaAdmin,
  getTopicoAdmin,
} from "@/lib/db/admin";
import { ContentTree } from "@/components/admin/ContentTree";
import { EmptyPanel } from "@/components/admin/panels/EmptyPanel";
import { CursoPanel } from "@/components/admin/panels/CursoPanel";
import { DisciplinaPanel } from "@/components/admin/panels/DisciplinaPanel";
import { AreaPanel } from "@/components/admin/panels/AreaPanel";
import { TopicoPanel } from "@/components/admin/panels/TopicoPanel";

export const metadata = { title: "Contenido | Admin Osmo" };

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{
    curso?: string;
    disciplina?: string;
    area?: string;
    topico?: string;
  }>;
}) {
  const sp = await searchParams;
  const tree = await getFullTreeAdmin();

  let panel: React.ReactNode = <EmptyPanel />;
  let selectedId: string | undefined;
  let selectedType: string | undefined;

  if (sp.topico) {
    const data = await getTopicoAdmin(sp.topico);
    if (data) {
      panel = <TopicoPanel data={data} />;
      selectedId = sp.topico;
      selectedType = "topico";
    }
  } else if (sp.area) {
    const data = await getAreaAdmin(sp.area);
    if (data) {
      panel = <AreaPanel data={data} />;
      selectedId = sp.area;
      selectedType = "area";
    }
  } else if (sp.disciplina) {
    const data = await getDisciplinaAdmin(sp.disciplina);
    if (data) {
      panel = <DisciplinaPanel data={data} />;
      selectedId = sp.disciplina;
      selectedType = "disciplina";
    }
  } else if (sp.curso) {
    const data = await getCursoAdmin(sp.curso);
    if (data) {
      panel = <CursoPanel data={data} />;
      selectedId = sp.curso;
      selectedType = "curso";
    }
  }

  return (
    <div className="flex -m-6 overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
      <ContentTree tree={tree} selectedId={selectedId} selectedType={selectedType} />
      <div className="flex-1 overflow-y-auto p-6">{panel}</div>
    </div>
  );
}
