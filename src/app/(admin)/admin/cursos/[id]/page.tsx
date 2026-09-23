import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { getCursoAdmin } from "@/lib/db/admin";
import { atualizarCurso, deletarCurso, criarDisciplina } from "@/lib/actions/admin";

export default async function EditarCursoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const curso = await getCursoAdmin(id);
  if (!curso) notFound();

  const saveAction = atualizarCurso.bind(null, id);
  const deleteAction = deletarCurso.bind(null, id);
  const createDisciplinaAction = criarDisciplina.bind(null, id);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs mb-6" style={{ color: "var(--text-muted)" }}>
        <Link href="/admin/cursos" className="hover:underline" style={{ color: "var(--accent)" }}>
          Cursos
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>{curso.nome}</span>
      </div>

      {/* Editar curso */}
      <div
        className="rounded-xl p-6 mb-6"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--text-primary)" }}>
          Editar curso
        </h2>
        <form id="form-curso" action={saveAction} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Nombre *</label>
              <input
                name="nome"
                required
                defaultValue={curso.nome}
                className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Ícono</label>
              <input
                name="icone"
                defaultValue={curso.icone ?? ""}
                placeholder="🧬"
                className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Descripción</label>
              <input
                name="descricao"
                defaultValue={curso.descricao ?? ""}
                className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Color (hex)</label>
              <input
                name="cor_destaque"
                defaultValue={curso.cor_destaque ?? ""}
                placeholder="#00A6FF"
                className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              />
            </div>
          </div>
        </form>
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="publicado"
              form="form-curso"
              defaultChecked={curso.publicado}
              className="w-4 h-4 accent-[var(--accent)]"
            />
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Publicado</span>
          </label>
          <div className="flex gap-2">
            <form action={deleteAction}>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-medium"
                style={{ backgroundColor: "var(--bg-elevated)", color: "var(--error)", border: "1px solid var(--error)" }}
              >
                Eliminar
              </button>
            </form>
            <button
              type="submit"
              form="form-curso"
              className="px-5 py-2 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: "var(--accent)" }}
            >
              Guardar
            </button>
          </div>
        </div>
      </div>

      {/* Materias */}
      <div
        className="rounded-xl overflow-hidden mb-6"
        style={{ border: "1px solid var(--border)" }}
      >
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ backgroundColor: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}
        >
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Materias ({curso.disciplinas.length})
          </span>
        </div>
        <div style={{ backgroundColor: "var(--bg-surface)" }}>
          {curso.disciplinas.length === 0 ? (
            <p className="text-xs text-center py-6" style={{ color: "var(--text-muted)" }}>
              Sin materias aún
            </p>
          ) : (
            curso.disciplinas.map((d, i) => (
              <div
                key={d.id}
                className="flex items-center justify-between px-5 py-3"
                style={{ borderBottom: i < curso.disciplinas.length - 1 ? "1px solid var(--border)" : "none" }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {d.icone && <span className="text-base">{d.icone}</span>}
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{d.nome}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {d._count.areas} unidades ·{" "}
                      <span style={{ color: d.publicado ? "var(--success)" : "var(--warning)" }}>
                        {d.publicado ? "Publicado" : "Borrador"}
                      </span>
                    </p>
                  </div>
                </div>
                <Link
                  href={`/admin/disciplinas/${d.id}`}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg shrink-0 ml-4"
                  style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
                >
                  Editar <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Nueva materia */}
      <div
        className="rounded-xl p-6"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--text-primary)" }}>
          Nueva materia en <span style={{ color: "var(--accent)" }}>{curso.nome}</span>
        </h2>
        <form action={createDisciplinaAction} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Nombre *</label>
              <input
                name="nome"
                required
                placeholder="ej. Anatomía"
                className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Ícono</label>
              <input
                name="icone"
                placeholder="🦴"
                className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Descripción</label>
              <input
                name="descricao"
                placeholder="Descripción corta"
                className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Color (hex)</label>
              <input
                name="cor_destaque"
                placeholder="#6C63FF"
                className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: "var(--accent)" }}
            >
              Crear materia
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
