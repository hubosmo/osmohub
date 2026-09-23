import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getDisciplinaAdmin } from "@/lib/db/admin";
import { atualizarDisciplina, deletarDisciplina, criarArea } from "@/lib/actions/admin";

export default async function EditarDisciplinaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const disciplina = await getDisciplinaAdmin(id);
  if (!disciplina) notFound();

  const saveAction = atualizarDisciplina.bind(null, id);
  const deleteAction = deletarDisciplina.bind(null, id, disciplina.curso.id);
  const createAreaAction = criarArea.bind(null, id);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs mb-6 flex-wrap" style={{ color: "var(--text-muted)" }}>
        <Link href="/admin/cursos" className="hover:underline" style={{ color: "var(--accent)" }}>Cursos</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/admin/cursos/${disciplina.curso.id}`} className="hover:underline" style={{ color: "var(--accent)" }}>
          {disciplina.curso.nome}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>{disciplina.nome}</span>
      </div>

      {/* Editar */}
      <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}>
        <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--text-primary)" }}>Editar materia</h2>
        <form id="form-disciplina" action={saveAction} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Nombre *</label>
              <input name="nome" required defaultValue={disciplina.nome}
                className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Ícono</label>
              <input name="icone" defaultValue={disciplina.icone ?? ""} placeholder="🦴"
                className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Descripción</label>
              <input name="descricao" defaultValue={disciplina.descricao ?? ""}
                className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Color (hex)</label>
              <input name="cor_destaque" defaultValue={disciplina.cor_destaque ?? ""} placeholder="#6C63FF"
                className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
          </div>
        </form>
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="publicado" form="form-disciplina" defaultChecked={disciplina.publicado} className="w-4 h-4 accent-[var(--accent)]" />
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Publicado</span>
          </label>
          <div className="flex gap-2">
            <form action={deleteAction}>
              <button type="submit" className="px-4 py-2 rounded-lg text-xs font-medium"
                style={{ backgroundColor: "var(--bg-elevated)", color: "var(--error)", border: "1px solid var(--error)" }}>
                Eliminar
              </button>
            </form>
            <button type="submit" form="form-disciplina" className="px-5 py-2 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: "var(--accent)" }}>
              Guardar
            </button>
          </div>
        </div>
      </div>

      {/* Unidades */}
      <div className="rounded-xl overflow-hidden mb-6" style={{ border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between px-5 py-3"
          style={{ backgroundColor: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Unidades ({disciplina.areas.length})
          </span>
        </div>
        <div style={{ backgroundColor: "var(--bg-surface)" }}>
          {disciplina.areas.length === 0 ? (
            <p className="text-xs text-center py-6" style={{ color: "var(--text-muted)" }}>Sin unidades aún</p>
          ) : (
            disciplina.areas.map((a, i) => (
              <div key={a.id} className="flex items-center justify-between px-5 py-3"
                style={{ borderBottom: i < disciplina.areas.length - 1 ? "1px solid var(--border)" : "none" }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{a.nome}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {a._count.topicos} tópicos ·{" "}
                    <span style={{ color: a.publicado ? "var(--success)" : "var(--warning)" }}>
                      {a.publicado ? "Publicado" : "Borrador"}
                    </span>
                  </p>
                </div>
                <Link href={`/admin/areas/${a.id}`}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg shrink-0 ml-4"
                  style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                  Editar <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Nueva unidad */}
      <div className="rounded-xl p-6" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}>
        <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--text-primary)" }}>
          Nueva unidad en <span style={{ color: "var(--accent)" }}>{disciplina.nome}</span>
        </h2>
        <form action={createAreaAction} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Nombre *</label>
              <input name="nome" required placeholder="ej. Nociones básicas"
                className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Descripción</label>
              <input name="descricao" placeholder="Descripción corta"
                className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-5 py-2 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: "var(--accent)" }}>
              Crear unidad
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
