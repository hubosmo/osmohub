import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getAreaAdmin } from "@/lib/db/admin";
import { atualizarArea, deletarArea, criarTopico } from "@/lib/actions/admin";

export default async function EditarAreaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const area = await getAreaAdmin(id);
  if (!area) notFound();

  const { disciplina } = area;
  const saveAction = atualizarArea.bind(null, id);
  const deleteAction = deletarArea.bind(null, id, disciplina.id);
  const createTopicoAction = criarTopico.bind(null, id);

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
        <Link href={`/admin/disciplinas/${disciplina.id}`} className="hover:underline" style={{ color: "var(--accent)" }}>
          {disciplina.nome}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>{area.nome}</span>
      </div>

      {/* Editar */}
      <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}>
        <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--text-primary)" }}>Editar unidad</h2>
        <form id="form-area" action={saveAction} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Nombre *</label>
              <input name="nome" required defaultValue={area.nome}
                className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Descripción</label>
              <input name="descricao" defaultValue={area.descricao ?? ""}
                className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
          </div>
        </form>
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="publicado" form="form-area" defaultChecked={area.publicado} className="w-4 h-4 accent-[var(--accent)]" />
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Publicado</span>
          </label>
          <div className="flex gap-2">
            <form action={deleteAction}>
              <button type="submit" className="px-4 py-2 rounded-lg text-xs font-medium"
                style={{ backgroundColor: "var(--bg-elevated)", color: "var(--error)", border: "1px solid var(--error)" }}>
                Eliminar
              </button>
            </form>
            <button type="submit" form="form-area" className="px-5 py-2 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: "var(--accent)" }}>
              Guardar
            </button>
          </div>
        </div>
      </div>

      {/* Tópicos */}
      <div className="rounded-xl overflow-hidden mb-6" style={{ border: "1px solid var(--border)" }}>
        <div className="px-5 py-3" style={{ backgroundColor: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Tópicos ({area.topicos.length})
          </span>
        </div>
        <div style={{ backgroundColor: "var(--bg-surface)" }}>
          {area.topicos.length === 0 ? (
            <p className="text-xs text-center py-6" style={{ color: "var(--text-muted)" }}>Sin tópicos aún</p>
          ) : (
            area.topicos.map((t, i) => (
              <div key={t.id} className="flex items-center justify-between px-5 py-3"
                style={{ borderBottom: i < area.topicos.length - 1 ? "1px solid var(--border)" : "none" }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{t.titulo}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {t.duracao_estimada_min ? `${t.duracao_estimada_min} min · ` : ""}
                    <span style={{ color: t.publicado ? "var(--success)" : "var(--warning)" }}>
                      {t.publicado ? "Publicado" : "Borrador"}
                    </span>
                  </p>
                </div>
                <Link href={`/admin/topicos/${t.id}`}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg shrink-0 ml-4"
                  style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                  Editar <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Nuevo tópico */}
      <div className="rounded-xl p-6" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}>
        <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--text-primary)" }}>
          Nuevo tópico en <span style={{ color: "var(--accent)" }}>{area.nome}</span>
        </h2>
        <form action={createTopicoAction} className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Título *</label>
            <input name="titulo" required placeholder="ej. Términos direccionales"
              className="w-full h-9 px-3 rounded-lg text-sm outline-none"
              style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Objetivo (opcional)</label>
            <input name="objetivo" placeholder="Al finalizar, el alumno podrá..."
              className="w-full h-9 px-3 rounded-lg text-sm outline-none"
              style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-5 py-2 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: "var(--accent)" }}>
              Crear tópico
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
