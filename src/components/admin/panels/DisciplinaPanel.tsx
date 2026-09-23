import { Layers } from "lucide-react";
import { atualizarDisciplinaContent, deletarDisciplinaContent, uploadCapaDisciplina } from "@/lib/actions/content";
import { CapaUploadSection } from "./CapaUploadSection";
import { AdminSaveForm } from "@/components/admin/AdminSaveForm";

type DisciplinaData = {
  id: string;
  nome: string;
  descricao: string | null;
  icone: string | null;
  cor_destaque: string | null;
  capa_url: string | null;
  capa_url_light: string | null;
  publicado: boolean;
  areas: { id: string }[];
  curso: { id: string; nome: string };
};

export function DisciplinaPanel({ data }: { data: DisciplinaData }) {
  const saveAction = atualizarDisciplinaContent.bind(null, data.id);
  const deleteAction = deletarDisciplinaContent.bind(null, data.id, data.curso.id);

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: (data.cor_destaque ?? "#6C63FF") + "22" }}>
          {data.icone
            ? <span className="text-xl">{data.icone}</span>
            : <Layers className="h-5 w-5" style={{ color: data.cor_destaque ?? "#6C63FF" }} />}
        </div>
        <div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Materia · <span style={{ color: "var(--accent)" }}>{data.curso.nome}</span>
          </p>
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{data.nome}</h2>
        </div>
        <span className="ml-auto text-xs px-2.5 py-1 rounded-full"
          style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
          {data.areas.length} {data.areas.length === 1 ? "unidad" : "unidades"}
        </span>
      </div>

      <div className="rounded-xl p-5" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}>
        <AdminSaveForm id="form-disc-panel" action={saveAction} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Nombre *</label>
              <input name="nome" required defaultValue={data.nome}
                className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Ícono</label>
              <input name="icone" defaultValue={data.icone ?? ""} placeholder="🦴"
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
              <input name="cor_destaque" defaultValue={data.cor_destaque ?? ""} placeholder="#6C63FF"
                className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
          </div>
        </AdminSaveForm>

        <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="publicado" form="form-disc-panel"
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
            <button type="submit" form="form-disc-panel"
              className="px-5 py-2 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: "var(--accent)" }}>
              Guardar
            </button>
          </div>
        </div>
      </div>

      <CapaUploadSection entityId={data.id} capaUrlDark={data.capa_url} capaUrlLight={data.capa_url_light} uploadAction={uploadCapaDisciplina} aspectRatio="1/1" />
    </div>
  );
}
