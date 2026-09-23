import Link from "next/link";
import { BookOpen } from "lucide-react";
import { getDashboardCursos } from "@/lib/db/cursos";
import { DashboardWelcome } from "@/components/student/DashboardWelcome";
import { DashboardCursos } from "@/components/student/DashboardCursos";
import { TopicSearch } from "@/components/student/TopicSearch";

export const metadata = { title: "Mi Osmo | Osmo" };

export default async function DashboardPage() {
  const cursos = await getDashboardCursos().catch(() => []);

  return (
    <div className="-mx-4 lg:-mx-8 -mt-6">

      {/* ── Bienvenida ─────────────────────────────────────── */}
      <div
        className="border-b"
        style={{
          height: 108,
          backgroundColor: "var(--bg-elevated)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-center justify-center h-full px-4 lg:px-8 max-w-5xl mx-auto w-full">
          <DashboardWelcome />
        </div>
      </div>

      {/* ── Contenido principal ─────────────────────────────── */}
      <div className="px-4 lg:px-8 py-8 max-w-5xl mx-auto space-y-10">

        {/* Buscador de temas */}
        <TopicSearch />

        {/* Continuar última unidad */}
        <section>
          <h2 className="text-base font-semibold mb-3" style={{ color: "var(--accent)" }}>
            Continuar tu última unidad de estudio...
          </h2>
          <div
            className="flex items-center gap-4 rounded-xl border p-5"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border)",
            }}
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: "var(--bg-elevated)" }}
            >
              <BookOpen className="h-5 w-5" style={{ color: "var(--text-muted)" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Todavía no has empezado a estudiar.
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                Explora los temas disponibles y comienza tu primera unidad.
              </p>
            </div>
            <Link
              href="/cursos"
              className="shrink-0 px-4 py-2 rounded-lg text-xs font-bold text-white uppercase tracking-wide transition-colors"
              style={{ backgroundColor: "var(--accent)" }}
            >
              Explorar
            </Link>
          </div>
        </section>

      </div>

      {/* Cursos disponibles — full-width para as capas respira */}
      <div className="border-t" style={{ borderColor: "var(--border)" }}>
        <DashboardCursos cursos={cursos} />
      </div>

    </div>
  );
}
