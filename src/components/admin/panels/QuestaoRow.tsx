"use client";

import { useState, useTransition } from "react";
import { Trash2, Plus, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { atualizarQuestao, deletarQuestao, criarOpcao } from "@/lib/actions/content-quizzes";
import { QuizImagePicker } from "@/components/admin/QuizImagePicker";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { OpcaoRow, ImagemOpcaoCard } from "./OpcaoRow";
import { TIPO_LABELS } from "./quiz-types";
import type { Questao } from "./quiz-types";

// ── Row de questão ────────────────────────────────────────

export function QuestaoRow({
  questao, idx, quizId, open, onToggle,
}: {
  questao: Questao;
  idx: number;
  quizId: string;
  open: boolean;
  onToggle: () => void;
}) {
  const updateAction = atualizarQuestao.bind(null, questao.id, quizId);
  const deleteAction = deletarQuestao.bind(null, questao.id, quizId);
  const addOpcaoAction = criarOpcao.bind(null, questao.id, quizId);
  const [imagemUrl, setImagemUrl] = useState(questao.imagem_url ?? "");
  const [novaOpcaoImagem, setNovaOpcaoImagem] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, startDelete] = useTransition();

  return (
    <div style={{ borderColor: "var(--border)" }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer"
        onClick={onToggle}
        style={{ backgroundColor: open ? "color-mix(in srgb, var(--accent) 4%, var(--bg-surface))" : undefined }}
      >
        <span
          className="h-6 w-6 shrink-0 flex items-center justify-center rounded-full text-xs font-bold"
          style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)" }}
        >
          {idx + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm truncate" style={{ color: "var(--text-primary)" }}>{questao.enunciado}</p>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              {TIPO_LABELS[questao.tipo]} · {questao.opcoes.length} opciones
            </p>
            {questao.termo && (
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--accent) 14%, transparent)",
                  color: "var(--accent)",
                  border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
                }}
              >
                {questao.termo}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
            className="h-7 w-7 flex items-center justify-center rounded"
            style={{ color: "var(--error)" }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <ConfirmModal
            open={confirmDelete}
            message="¿Eliminar esta pregunta?"
            isPending={deleting}
            onCancel={() => setConfirmDelete(false)}
            onConfirm={() => startDelete(() => deleteAction())}
          />
          {open
            ? <ChevronUp className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
            : <ChevronDown className="h-4 w-4" style={{ color: "var(--text-muted)" }} />}
        </div>
      </div>

      {/* Body */}
      {open && (
        <div className="px-4 pb-4 pt-1 flex flex-col gap-3" style={{ borderTop: "1px solid var(--border)", backgroundColor: "var(--bg-elevated)" }}>
          <form id={`q-save-${questao.id}`} action={updateAction} className="flex flex-col gap-2">
            <input type="hidden" name="imagem_url" value={imagemUrl} />

            <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Enunciado</label>
            <textarea
              name="enunciado" defaultValue={questao.enunciado} rows={2}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            />

            {questao.tipo !== "VERDADEIRO_FALSO" && (
              <QuizImagePicker
                quizId={quizId} value={imagemUrl} onChange={setImagemUrl}
                label="Imagen del enunciado (opcional)"
              />
            )}

            <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              Término cubierto — "Lo que aprenderás"
            </label>
            <input
              name="termo" defaultValue={questao.termo ?? ""}
              placeholder="ej: Plano coronal, Caudal, Función renal..."
              className="w-full h-8 px-3 rounded-lg text-xs outline-none"
              style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            />
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              Termo exibido no card "Lo que aprenderás". Deixar vazio = questão não aparece nesse filtro.
            </p>

            <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Explicación (se muestra tras responder)</label>
            <textarea
              name="explicacao" defaultValue={questao.explicacao ?? ""} rows={2}
              placeholder="Explicación opcional de la respuesta correcta..."
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            />
          </form>

          {/* Opciones */}
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>OPCIONES</p>

            {questao.tipo === "ESCOLHA_IMAGEM" ? (
              <div style={{
                display: "grid",
                gridTemplateColumns: questao.opcoes.length === 3 ? "repeat(3, 1fr)" : "repeat(2, 1fr)",
                gap: "0.375rem",
              }}>
                {questao.opcoes.map((op) => (
                  <ImagemOpcaoCard key={op.id} opcao={op} questaoId={questao.id} quizId={quizId} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {questao.opcoes.map((op) => (
                  <OpcaoRow key={op.id} opcao={op} questaoId={questao.id} quizId={quizId} tipo={questao.tipo} />
                ))}
              </div>
            )}

            {questao.tipo !== "VERDADEIRO_FALSO" && (
              <form
                action={async (fd) => {
                  if (questao.tipo === "ESCOLHA_IMAGEM") fd.set("imagem_url", novaOpcaoImagem);
                  await addOpcaoAction(fd);
                  setNovaOpcaoImagem("");
                }}
                className="flex flex-col gap-1.5 mt-2"
              >
                <div className="flex gap-2">
                  <input
                    name="texto"
                    required={questao.tipo !== "ESCOLHA_IMAGEM"}
                    placeholder={questao.tipo === "ESCOLHA_IMAGEM" ? "Etiqueta opcional..." : "Texto de la opción..."}
                    className="flex-1 h-8 px-3 rounded-lg text-xs outline-none"
                    style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                  <button type="submit"
                    className="shrink-0 h-8 px-3 rounded-lg text-xs font-medium text-white"
                    style={{ backgroundColor: "var(--accent)" }}>
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                {questao.tipo === "ESCOLHA_IMAGEM" && (
                  <QuizImagePicker
                    quizId={quizId} value={novaOpcaoImagem} onChange={setNovaOpcaoImagem}
                    label="Imagen de la opción" compact
                  />
                )}
              </form>
            )}
          </div>

          {/* Botão salvar — abaixo das opções */}
          <div className="flex justify-end pt-1" style={{ borderTop: "1px solid var(--border)" }}>
            <button
              type="submit" form={`q-save-${questao.id}`}
              className="px-4 py-1.5 rounded-lg text-xs font-medium text-white"
              style={{ backgroundColor: "var(--accent)" }}
            >
              Guardar pregunta
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Formulário para nova questão ──────────────────────────

export function NuevaQuestaoForm({
  addAction, quizId, onCreated,
}: {
  addAction: (fd: FormData) => Promise<string>;
  quizId: string;
  onCreated: (id: string) => void;
}) {
  const [tipo, setTipo] = useState("MULTIPLA_ESCOLHA");
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("enunciado", "Nueva pregunta");
      fd.set("tipo", tipo);
      const id = await addAction(fd);
      onCreated(id);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
        className="h-8 px-2 rounded-lg text-xs outline-none"
        style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
      >
        <option value="MULTIPLA_ESCOLHA">Múltiple opción</option>
        <option value="VERDADEIRO_FALSO">Verdadero / Falso</option>
        <option value="ESCOLHA_IMAGEM">Elegir imagen</option>
      </select>
      <button
        type="button"
        onClick={handleAdd}
        disabled={isPending}
        className="flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-medium text-white disabled:opacity-60"
        style={{ backgroundColor: "var(--accent)" }}
      >
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
        Agregar
      </button>
    </div>
  );
}
