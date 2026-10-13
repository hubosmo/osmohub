import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, HelpCircle, BookOpen, Link2 } from "lucide-react";
import { listarQuizzes } from "@/lib/db/quizzes";
import { criarQuiz } from "@/lib/actions/content-quizzes";

export default async function QuizzesAdminPage() {
  const quizzes = await listarQuizzes();

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Cuestionarios
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            Crea y gestiona cuestionarios independientes, luego vincúlalos a tópicos.
          </p>
        </div>
        <form action={async (fd) => {
          "use server";
          const id = await criarQuiz(fd);
          redirect(`/admin/quizzes/${id}`);
        }}>
          <input type="hidden" name="titulo" value="Nuevo cuestionario" />
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: "var(--accent)" }}
          >
            <Plus className="h-4 w-4" />
            Nuevo
          </button>
        </form>
      </div>

      {/* Lista */}
      {quizzes.length === 0 ? (
        <div
          className="rounded-xl p-12 flex flex-col items-center gap-3 text-center"
          style={{ border: "1px dashed var(--border)", backgroundColor: "var(--bg-surface)" }}
        >
          <HelpCircle className="h-10 w-10" style={{ color: "var(--text-muted)", opacity: 0.4 }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Ningún cuestionario creado aún.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {quizzes.map((q) => (
            <Link
              key={q.id}
              href={`/admin/quizzes/${q.id}`}
              className="flex items-center gap-4 px-4 py-3 rounded-xl transition-colors"
              style={{
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg-surface)",
              }}
            >
              {/* Icone */}
              <div
                className="h-10 w-10 rounded-lg shrink-0 flex items-center justify-center"
                style={{ backgroundColor: "color-mix(in srgb, var(--accent) 12%, var(--bg-elevated))" }}
              >
                <HelpCircle className="h-5 w-5" style={{ color: "var(--accent)" }} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                  {q.titulo}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    <BookOpen className="h-3 w-3" />
                    {q._count.questoes} pregunta{q._count.questoes !== 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    <Link2 className="h-3 w-3" />
                    {q._count.topicos} tópico{q._count.topicos !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Status */}
              <span
                className="text-[11px] px-2.5 py-1 rounded-full shrink-0"
                style={{
                  backgroundColor: q.publicado ? "#22C55E22" : "var(--bg-elevated)",
                  color: q.publicado ? "#22C55E" : "var(--text-muted)",
                  border: `1px solid ${q.publicado ? "#22C55E55" : "var(--border)"}`,
                }}
              >
                {q.publicado ? "Publicado" : "Borrador"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
