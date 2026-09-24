import { getDashboardCursos } from "@/lib/db/cursos";
import { DashboardWelcome } from "@/components/student/DashboardWelcome";
import { DashboardCursos } from "@/components/student/DashboardCursos";
import { TopicSearch } from "@/components/student/TopicSearch";
import { ContinuarUnidad } from "@/components/student/ContinuarUnidad";

export const metadata = { title: "Mi panel" };

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
          <ContinuarUnidad />
        </section>

      </div>

      {/* Cursos disponibles — full-width para as capas respira */}
      <div className="border-t" style={{ borderColor: "var(--border)" }}>
        <DashboardCursos cursos={cursos} />
      </div>

    </div>
  );
}
