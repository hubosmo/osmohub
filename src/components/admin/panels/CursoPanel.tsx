import { BookOpen } from "lucide-react";
import { atualizarCursoContent, deletarCursoContent, uploadCapaCurso } from "@/lib/actions/content";
import { CapaUploadSection } from "./CapaUploadSection";
import { AdminSaveForm } from "@/components/admin/AdminSaveForm";

type CursoData = {
  id: string;
  nome: string;
  descricao: string | null;
  icone: string | null;
  cor_destaque: string | null;
  capa_url: string | null;
  capa_url_light: string | null;
  publicado: boolean;
  disciplinas: { id: string }[];
};

export function CursoPanel({ data }: { data: CursoData }) {
  const saveAction = atualizarCursoContent.bind(null, data.id);
  const deleteAction = deletarCursoContent.bind(null, data.id);

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: (data.cor_destaque ?? "#00A6FF") + "22" }}>
          {data.icone
            ? <span className="text-xl">{data.icone}</span>
            : <BookOpen className="h-5 w-5" style={{ color: data.cor_destaque ?? "var(--accent)" }} />}
        </div>
        <div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Curso</p>
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{data.nome}</h2>
        </div>
        <span className="ml-auto text-xs px-2.5 py-1 rounded-full"
          style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
          {data.disciplinas.length} {data.disciplinas.length === 1 ? "materia" : "materias"}
        </span>
      </div>

      <div className="rounded-xl p-5" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}>
        <AdminSaveForm id="form-curso-panel" action={saveAction} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Nombre *</label>
              <input name="nome" required defaultValue={data.nome}
                className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Ícono</label>
              <input name="icone" defaultValue={data.icone ?? ""} placeholder="🧬"
                className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Descripción</label>
              <input name="descricao" defaultValue={data.descricao ?? ""}
                className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Color (hex)</label>
              <input name="cor_destaque" defaultValue={data.cor_destaque ?? ""} placeholder="#00A6FF"
                className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
          </div>
        </AdminSaveForm>

        <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="publicado" form="form-curso-panel"
              defaultChecked={data.publicado} className="w-4 h-4 accent-[var(--accent)]" />
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Publicado</span>
          </label>
          <div className="flex gap-2">
            <form action={deleteAction}>
              <button type="submit" className="px-4 py-2 rounded-lg text-xs font-medium"
                style={{ backgroundColor: "var(--bg-elevated)", color: "var(--error)", border: "1px solid var(--error)" }}>
                Eliminar
              </button>
            </form>
            <button type="submit" form="form-curso-panel"
              className="px-5 py-2 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: "var(--accent)" }}>
              Guardar
            </button>
          </div>
        </div>
      </div>

      <CapaUploadSection entityId={data.id} capaUrlDark={data.capa_url} capaUrlLight={data.capa_url_light} uploadAction={uploadCapaCurso} />
    </div>
  );
}
