import Link from "next/link";
import { ChevronDown, Settings } from "lucide-react";

type QuizCard = {
  id: string;
  titulo: string;
  capa_url: string | null;
  publicado: boolean;
  _count: { questoes: number };
  questoes: { termo: string | null }[];
};

interface Props {
  quizzes: QuizCard[];
  backUrl: string;
}

export function TopicQuizSection({ quizzes, backUrl }: Props) {
  const publicados = quizzes.filter((q) => q.publicado);

  if (publicados.length === 0) {
    return (
      <div
        className="rounded-xl p-6 flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)", minHeight: 120 }}
      >
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Cuestionario disponible próximamente.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {publicados.map((quiz) => <QuizCardView key={quiz.id} quiz={quiz} backUrl={backUrl} />)}
    </div>
  );
}

function QuizCardView({ quiz, backUrl }: { quiz: QuizCard; backUrl: string }) {
  const sessionUrl = `/quizzes/${quiz.id}/session?back=${encodeURIComponent(backUrl)}`;
  const minEst = Math.max(1, Math.ceil((quiz._count.questoes * 30) / 60));
  const termos = [...new Set(quiz.questoes.map(q => q.termo).filter((t): t is string => !!t?.trim()))];

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid var(--border)" }}
    >
      {/* Cover com overlay */}
      <div
        className="relative h-36"
        style={{ backgroundColor: quiz.capa_url ? undefined : "var(--bg-elevated)" }}
      >
        {quiz.capa_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={quiz.capa_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "brightness(0.55)" }}
          />
        )}

        {/* Engrenagem — config */}
        <Link
          href={sessionUrl}
          className="absolute top-3 right-3 h-8 w-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
          style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
          aria-label="Configurar sesión"
        >
          <Settings className="h-4 w-4 text-white" />
        </Link>

        {/* Badge + título */}
        <div className="absolute bottom-3 left-3 right-3">
          <span
            className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded mb-1.5"
            style={{ backgroundColor: "var(--accent)", color: "#fff" }}
          >
            Cuestionario
          </span>
          <p className="text-sm font-semibold text-white leading-snug">{quiz.titulo}</p>
        </div>
      </div>

      {/* Botão Comenzar */}
      <Link
        href={sessionUrl}
        className="flex items-center justify-center gap-2 py-3 text-sm font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: "var(--accent)" }}
      >
        Comenzar a estudiar ▶ {minEst} min
      </Link>

      {/* Lo que aprenderás */}
      {termos.length > 0 && (
        <details
          className="group"
          style={{ borderTop: "1px solid var(--border)", backgroundColor: "var(--bg-surface)" }}
        >
          <summary
            className="flex items-center gap-2 px-4 py-2.5 cursor-pointer text-sm select-none list-none"
            style={{ color: "var(--text-secondary)" }}
          >
            <span className="flex-1">Lo que aprenderás</span>
            <ChevronDown className="h-4 w-4 shrink-0" style={{ color: "var(--text-muted)" }} />
          </summary>

          <div className="px-4 pb-4 pt-2">
            <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
              Haz clic para quitar contenido de la sesión de estudio:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {termos.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                  style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                >
                  <span
                    className="h-3 w-3 rounded-full border flex items-center justify-center shrink-0"
                    style={{ borderColor: "var(--text-muted)", fontSize: 8 }}
                  >
                    ●
                  </span>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </details>
      )}
    </div>
  );
}
