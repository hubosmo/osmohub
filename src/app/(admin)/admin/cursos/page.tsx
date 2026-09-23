import Link from "next/link";
import { ChevronRight, BookOpen } from "lucide-react";
import { listarCursosAdmin } from "@/lib/db/admin";
import { criarCurso } from "@/lib/actions/admin";

export const metadata = { title: "Cursos | Admin Osmo" };

export default async function CursosAdminPage() {
  const cursos = await listarCursosAdmin().catch(() => []);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Admin</p>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Cursos</h1>
        </div>
      </div>

      {/* Lista */}
      <div className="rounded-xl overflow-hidden mb-8" style={{ border: "1px solid var(--border)" }}>
        {cursos.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center" style={{ backgroundColor: "var(--bg-surface)" }}>
            <BookOpen className="h-8 w-8" style={{ color: "var(--text-muted)" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Sin cursos aún</p>
          </div>
        ) : (
          <div style={{ backgroundColor: "var(--bg-surface)" }}>
            {cursos.map((curso, i) => (
              <div
                key={curso.id}
                className="flex items-center justify-between px-5 py-4"
                style={{
                  borderBottom: i < cursos.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {curso.icone && <span className="text-xl shrink-0">{curso.icone}</span>}
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate" style={{ color: "var(--text-primary)" }}>
                      {curso.nome}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {curso._count.disciplinas} {curso._count.disciplinas === 1 ? "materia" : "materias"} ·{" "}
                      <span style={{ color: curso.publicado ? "var(--success)" : "var(--warning)" }}>
                        {curso.publicado ? "Publicado" : "Borrador"}
                      </span>
                    </p>
                  </div>
                </div>
                <Link
                  href={`/admin/cursos/${curso.id}`}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg shrink-0 ml-4"
                  style={{
                    backgroundColor: "var(--bg-elevated)",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  Editar <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Crear curso */}
      <div
        className="rounded-xl p-6"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--text-primary)" }}>
          Nuevo curso
        </h2>
        <form action={criarCurso} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>
                Nombre *
              </label>
              <input
                name="nome"
                required
                placeholder="ej. Ciencias Básicas"
                className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                style={{
                  backgroundColor: "var(--bg-base)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>
                Ícono (emoji)
              </label>
              <input
                name="icone"
                placeholder="🧬"
                className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                style={{
                  backgroundColor: "var(--bg-base)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>
                Descripción
              </label>
              <input
                name="descricao"
                placeholder="Descripción corta"
                className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                style={{
                  backgroundColor: "var(--bg-base)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>
                Color (hex)
              </label>
              <input
                name="cor_destaque"
                placeholder="#00A6FF"
                className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                style={{
                  backgroundColor: "var(--bg-base)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: "var(--accent)" }}
            >
              Crear curso
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
