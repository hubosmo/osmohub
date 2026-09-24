import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";
import { ThemeAwareCapa } from "./ThemeAwareCapa";

type Curso = {
  id: string;
  slug: string;
  nome: string;
  descricao: string | null;
  capa_url: string | null;
  capa_url_light: string | null;
  cor_destaque: string | null;
  icone: string | null;
  _count: { disciplinas: number };
};

export function DashboardCursos({ cursos }: { cursos: Curso[] }) {
  if (cursos.length === 0) return null;

  return (
    <section className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
          Cursos disponibles
        </h2>
        <Link
          href="/cursos"
          className="flex items-center gap-1 text-sm font-medium"
          style={{ color: "var(--accent)" }}
        >
          Ver todos <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-5"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}
      >
        {cursos.map((curso) => {
          const hasCapa = !!(curso.capa_url || curso.capa_url_light);
          return (
            <Link
              key={curso.id}
              href={`/cursos/${curso.slug}`}
              className="group flex flex-col rounded-2xl overflow-hidden transition-transform duration-300 hover:-translate-y-1.5"
              style={{
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg-surface)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              }}
            >
              {/* Capa — proporção natural da imagem */}
              <div className="relative w-full overflow-hidden">
                {hasCapa ? (
                  <ThemeAwareCapa
                    capaUrlDark={curso.capa_url}
                    capaUrlLight={curso.capa_url_light}
                    alt={curso.nome}
                    className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div
                    className="w-full h-full flex flex-col items-center justify-center gap-3"
                    style={{
                      background: curso.cor_destaque
                        ? `linear-gradient(160deg, ${curso.cor_destaque}33 0%, ${curso.cor_destaque}99 100%)`
                        : "linear-gradient(160deg, var(--bg-elevated) 0%, var(--bg-surface) 100%)",
                    }}
                  >
                    {curso.icone ? (
                      <span className="text-5xl">{curso.icone}</span>
                    ) : (
                      <BookOpen
                        className="h-12 w-12 opacity-40"
                        style={{ color: curso.cor_destaque ?? "var(--accent)" }}
                      />
                    )}
                  </div>
                )}

                {/* Reflexo que varre a capa no hover */}
                <div
                  className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] transition-transform duration-700 ease-in-out group-hover:translate-x-[200%]"
                  style={{
                    background:
                      "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
                    width: "60%",
                  }}
                />

                {/* Contagem de materias no rodapé */}
                <div
                  className="absolute bottom-0 left-0 right-0 px-3 py-2"
                  style={{
                    background: "linear-gradient(to top, var(--capa-overlay) 0%, transparent 100%)",
                  }}
                >
                  <p className="text-white/70 text-xs">
                    {curso._count.disciplinas}{" "}
                    {curso._count.disciplinas === 1 ? "materia" : "materias"}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
