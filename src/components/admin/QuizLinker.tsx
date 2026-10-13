"use client";

import { useState, useTransition } from "react";
import { Link2, Unlink, HelpCircle, Search } from "lucide-react";
import { vincularQuizAoTopico, desvincularQuizDoTopico } from "@/lib/actions/content-quizzes";

type QuizResumido = { id: string; titulo: string; _count: { questoes: number } };
type QuizVinculado = { quiz: QuizResumido };

interface Props {
  topicoId: string;
  quizzesVinculados: QuizVinculado[];
  todosQuizzes: QuizResumido[];
}

export function QuizLinker({ topicoId, quizzesVinculados, todosQuizzes }: Props) {
  const [query, setQuery] = useState("");
  const [, startTransition] = useTransition();

  const vinculadosIds = new Set(quizzesVinculados.map((j) => j.quiz.id));

  const disponibles = todosQuizzes.filter(
    (q) => !vinculadosIds.has(q.id) && q.titulo.toLowerCase().includes(query.toLowerCase())
  );

  const vincularAction = vincularQuizAoTopico.bind(null, topicoId);
  const desvincularAction = (quizId: string) => desvincularQuizDoTopico.bind(null, topicoId, quizId);

  return (
    <div className="flex flex-col gap-3">
      {/* Vinculados */}
      {quizzesVinculados.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Vinculados
          </p>
          {quizzesVinculados.map(({ quiz }) => (
            <div
              key={quiz.id}
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ border: "1px solid var(--accent)", backgroundColor: "color-mix(in srgb, var(--accent) 8%, var(--bg-base))" }}
            >
              <HelpCircle className="h-4 w-4 shrink-0" style={{ color: "var(--accent)" }} />
              <span className="flex-1 text-sm truncate" style={{ color: "var(--text-primary)" }}>
                {quiz.titulo}
              </span>
              <span className="text-xs shrink-0" style={{ color: "var(--text-muted)" }}>
                {quiz._count.questoes} pregs.
              </span>
              <form action={desvincularAction(quiz.id)}>
                <button type="submit" title="Desvincular"
                  className="h-6 w-6 flex items-center justify-center rounded shrink-0"
                  style={{ color: "var(--error)" }}>
                  <Unlink className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      {/* Buscar e vincular */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
          Vincular cuestionario existente
        </p>
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar cuestionario..."
            className="w-full h-8 pl-8 pr-3 rounded-lg text-xs outline-none"
            style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          />
        </div>

        {disponibles.length === 0 ? (
          <p className="text-xs py-2 text-center" style={{ color: "var(--text-muted)" }}>
            {query ? "Sin resultados" : "Todos vinculados"}
          </p>
        ) : (
          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
            {disponibles.slice(0, 20).map((q) => (
              <form key={q.id} action={vincularAction}>
                <input type="hidden" name="quizId" value={q.id} />
                <button
                  type="submit"
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors"
                  style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-base)" }}
                >
                  <Link2 className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--text-muted)" }} />
                  <span className="flex-1 text-xs truncate" style={{ color: "var(--text-primary)" }}>{q.titulo}</span>
                  <span className="text-[10px] shrink-0" style={{ color: "var(--text-muted)" }}>{q._count.questoes} pregs.</span>
                </button>
              </form>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
