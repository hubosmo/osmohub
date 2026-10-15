"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { atualizarQuiz, deletarQuiz, criarQuestao } from "@/lib/actions/content-quizzes";
import { QuizImagePicker } from "@/components/admin/QuizImagePicker";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { QuestaoRow, NuevaQuestaoForm } from "./QuestaoRow";
import type { QuizData } from "./quiz-types";

export function QuizPanel({ data }: { data: QuizData }) {
  const router = useRouter();
  const [openQIds, setOpenQIds] = useState<Set<string>>(new Set());
  const [capaUrl, setCapaUrl] = useState(data.capa_url ?? "");
  const [confirmDeleteQuiz, setConfirmDeleteQuiz] = useState(false);
  const [deletingQuiz, startDeleteQuiz] = useTransition();

  const toggleQ = (id: string) =>
    setOpenQIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const openQ = (id: string) =>
    setOpenQIds((prev) => new Set([...prev, id]));

  const saveAction = atualizarQuiz.bind(null, data.id);
  const deleteAction = deletarQuiz.bind(null, data.id);
  const addQuestaoAction = criarQuestao.bind(null, data.id);

  return (
    <div className="flex flex-col gap-4">

      {/* ── Info básica ─────────────────────────────────── */}
      <section
        className="rounded-xl p-4"
        style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-surface)" }}
      >
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
          Información básica
        </h3>
        <form id={`quiz-save-${data.id}`} action={saveAction} className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Título *</label>
            <input
              name="titulo" required defaultValue={data.titulo}
              className="w-full h-9 px-3 rounded-lg text-sm outline-none"
              style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Descripción</label>
            <textarea
              name="descricao" defaultValue={data.descricao ?? ""} rows={2}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <input type="hidden" name="capa_url" value={capaUrl} />
            <QuizImagePicker quizId={data.id} value={capaUrl} onChange={setCapaUrl} label="Portada del card" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="publicado" defaultChecked={data.publicado} className="w-4 h-4 accent-[var(--accent)]" />
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Publicado</span>
          </label>
        </form>

        <div className="flex items-center justify-end gap-2 pt-3 mt-1" style={{ borderTop: "1px solid var(--border)" }}>
          <button
            type="button"
            onClick={() => setConfirmDeleteQuiz(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ color: "var(--error)", border: "1px solid var(--error)", backgroundColor: "transparent" }}
          >
            Eliminar
          </button>
          <ConfirmModal
            open={confirmDeleteQuiz}
            message="¿Eliminar este cuestionario? Esta acción no se puede deshacer."
            isPending={deletingQuiz}
            onCancel={() => setConfirmDeleteQuiz(false)}
            onConfirm={() => startDeleteQuiz(async () => { await deleteAction(); router.push("/admin/quizzes"); })}
          />
          <button
            type="submit" form={`quiz-save-${data.id}`}
            className="px-4 py-1.5 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: "var(--accent)" }}
          >
            Guardar
          </button>
        </div>
      </section>

      {/* ── Preguntas ─────────────────────────────────────── */}
      <section
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-surface)" }}
      >
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Preguntas ({data.questoes.length})
          </h3>
          <NuevaQuestaoForm addAction={addQuestaoAction} quizId={data.id} onCreated={openQ} />
        </div>

        <div className="flex flex-col divide-y" style={{ "--tw-divide-opacity": 1 } as React.CSSProperties}>
          {data.questoes.length === 0 && (
            <p className="px-4 py-6 text-sm text-center" style={{ color: "var(--text-muted)" }}>
              Sin preguntas todavía. Agrega la primera arriba.
            </p>
          )}
          {data.questoes.map((q, idx) => (
            <QuestaoRow
              key={q.id}
              questao={q}
              idx={idx}
              quizId={data.id}
              open={openQIds.has(q.id)}
              onToggle={() => toggleQ(q.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
