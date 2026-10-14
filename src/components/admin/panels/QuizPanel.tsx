"use client";

import { useState, useTransition } from "react";
import { Trash2, Plus, Check, ChevronDown, ChevronUp } from "lucide-react";
import {
  atualizarQuiz,
  deletarQuiz,
  criarQuestao,
  atualizarQuestao,
  deletarQuestao,
  criarOpcao,
  atualizarOpcao,
  deletarOpcao,
  marcarOpcaoCorreta,
} from "@/lib/actions/content-quizzes";
import { QuizImagePicker } from "@/components/admin/QuizImagePicker";
import { useRouter } from "next/navigation";

type Opcao = { id: string; texto: string; imagem_url: string | null; correta: boolean; ordem: number };
type Questao = {
  id: string;
  enunciado: string;
  tipo: string;
  imagem_url: string | null;
  explicacao: string | null;
  termo: string | null;
  ordem: number;
  opcoes: Opcao[];
};
type QuizData = {
  id: string;
  titulo: string;
  descricao: string | null;
  capa_url: string | null;
  publicado: boolean;
  questoes: Questao[];
};

const TIPO_LABELS: Record<string, string> = {
  MULTIPLA_ESCOLHA: "Múltiple opción",
  VERDADEIRO_FALSO: "Verdadero / Falso",
  ESCOLHA_IMAGEM: "Elegir imagen",
};

export function QuizPanel({ data }: { data: QuizData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [openQIds, setOpenQIds] = useState<Set<string>>(new Set());
  const [capaUrl, setCapaUrl] = useState(data.capa_url ?? "");

  const toggleQ = (id: string) =>
    setOpenQIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

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
        {/* form sem botões de ação — eles ficam fora para evitar <form> aninhado */}
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
            {/* hidden input sincroniza capaUrl com o form */}
            <input type="hidden" name="capa_url" value={capaUrl} />
            <QuizImagePicker
              quizId={data.id}
              value={capaUrl}
              onChange={setCapaUrl}
              label="Portada del card"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="publicado" defaultChecked={data.publicado} className="w-4 h-4 accent-[var(--accent)]" />
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Publicado</span>
          </label>
        </form>

        {/* Botões FORA do form — evita <form> aninhado (HTML inválido) */}
        <div className="flex items-center justify-end gap-2 pt-3 mt-1" style={{ borderTop: "1px solid var(--border)" }}>
          <form action={deleteAction} onSubmit={(e) => { if (!confirm("¿Eliminar este cuestionario?")) e.preventDefault(); }}>
            <button type="submit" className="px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ color: "var(--error)", border: "1px solid var(--error)", backgroundColor: "transparent" }}>
              Eliminar
            </button>
          </form>
          <button type="submit" form={`quiz-save-${data.id}`} className="px-4 py-1.5 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: "var(--accent)" }}>
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
          {/* Nuevo — tipo selector + botão */}
          <NuevaQuestaoForm addAction={addQuestaoAction} quizId={data.id} />
        </div>

        <div className="flex flex-col divide-y" style={{ "--tw-divide-opacity": 1 } as React.CSSProperties}>
          {data.questoes.length === 0 && (
            <p className="px-4 py-6 text-sm text-center" style={{ color: "var(--text-muted)" }}>
              Sin preguntas todavía. Agrega la primera arriba.
            </p>
          )}
          {data.questoes.map((q, idx) => {
            const open = openQIds.has(q.id);
            return (
              <QuestaoRow
                key={q.id}
                questao={q}
                idx={idx}
                quizId={data.id}
                open={open}
                onToggle={() => toggleQ(q.id)}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ── Formulário para nova questão ──────────────────────────

function NuevaQuestaoForm({ addAction, quizId }: { addAction: (fd: FormData) => Promise<string>; quizId: string }) {
  const [tipo, setTipo] = useState("MULTIPLA_ESCOLHA");
  const [, startTransition] = useTransition();

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
      <form action={async (fd) => {
        fd.set("enunciado", "Nueva pregunta");
        fd.set("tipo", tipo);
        await addAction(fd);
      }}>
        <button
          type="submit"
          className="flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-medium text-white"
          style={{ backgroundColor: "var(--accent)" }}
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar
        </button>
      </form>
    </div>
  );
}

// ── Row de questão ────────────────────────────────────────

function QuestaoRow({ questao, idx, quizId, open, onToggle }: {
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

  return (
    <div style={{ borderColor: "var(--border)" }}>
      {/* Header da questão */}
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
          <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
            {TIPO_LABELS[questao.tipo]} · {questao.opcoes.length} opciones
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <form action={deleteAction} onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => { if (!confirm("¿Eliminar pregunta?")) e.preventDefault(); }}>
            <button type="submit" className="h-7 w-7 flex items-center justify-center rounded" style={{ color: "var(--error)" }}>
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </form>
          {open ? <ChevronUp className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                : <ChevronDown className="h-4 w-4" style={{ color: "var(--text-muted)" }} />}
        </div>
      </div>

      {/* Body */}
      {open && (
        <div className="px-4 pb-4 pt-1 flex flex-col gap-3" style={{ borderTop: "1px solid var(--border)", backgroundColor: "var(--bg-elevated)" }}>
          {/* Editar enunciado */}
          <form action={updateAction} className="flex flex-col gap-2">
            <input type="hidden" name="imagem_url" value={imagemUrl} />

            <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Enunciado</label>
            <textarea
              name="enunciado" defaultValue={questao.enunciado} rows={2}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            />

            {questao.tipo !== "VERDADEIRO_FALSO" && (
              <QuizImagePicker
                quizId={quizId}
                value={imagemUrl}
                onChange={setImagemUrl}
                label="Imagen del enunciado (opcional)"
              />
            )}

            <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              Término cubierto — "Lo que aprenderás"
            </label>
            <input
              name="termo"
              defaultValue={questao.termo ?? ""}
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
            <div className="flex justify-end">
              <button type="submit" className="px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                style={{ backgroundColor: "var(--accent)" }}>
                Guardar pregunta
              </button>
            </div>
          </form>

          {/* Opciones */}
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>OPCIONES</p>
            <div className="flex flex-col gap-1.5">
              {questao.opcoes.map((op) => (
                <OpcaoRow key={op.id} opcao={op} questaoId={questao.id} quizId={quizId} tipo={questao.tipo} />
              ))}
            </div>

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
                    name="texto" required placeholder="Texto de la opción..."
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
                    quizId={quizId}
                    value={novaOpcaoImagem}
                    onChange={setNovaOpcaoImagem}
                    label="Imagen de la opción"
                    compact
                  />
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Row de opção ──────────────────────────────────────────

function OpcaoRow({ opcao, questaoId, quizId, tipo }: { opcao: Opcao; questaoId: string; quizId: string; tipo: string }) {
  const deleteAction = deletarOpcao.bind(null, opcao.id, quizId);
  const markCorrectAction = marcarOpcaoCorreta.bind(null, opcao.id, questaoId, quizId);
  const [opcImagem, setOpcImagem] = useState(opcao.imagem_url ?? "");
  const [, startSaveTransition] = useTransition();

  function handleImageChange(url: string) {
    setOpcImagem(url);
    const fd = new FormData();
    fd.set("texto", opcao.texto);
    fd.set("imagem_url", url);
    startSaveTransition(() => atualizarOpcao(opcao.id, quizId, fd));
  }

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        border: `1px solid ${opcao.correta ? "var(--accent)" : "var(--border)"}`,
        backgroundColor: opcao.correta ? "color-mix(in srgb, var(--accent) 8%, var(--bg-base))" : "var(--bg-base)",
      }}
    >
      <div className="flex items-center gap-2 px-3 py-2">
        {/* Marcar correta */}
        <form action={markCorrectAction}>
          <button
            type="submit"
            title={opcao.correta ? "Opción correcta" : "Marcar como correcta"}
            className="h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
            style={{
              borderColor: opcao.correta ? "var(--accent)" : "var(--border)",
              backgroundColor: opcao.correta ? "var(--accent)" : "transparent",
            }}
          >
            {opcao.correta && <Check className="h-3 w-3 text-white" />}
          </button>
        </form>

        {/* Imagem preview (ESCOLHA_IMAGEM) */}
        {tipo === "ESCOLHA_IMAGEM" && opcImagem && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={opcImagem} alt="" className="h-8 w-12 object-cover rounded shrink-0" />
        )}

        <span className="flex-1 text-xs" style={{ color: "var(--text-primary)" }}>
          {opcao.texto || <span style={{ color: "var(--text-muted)" }}>(sin texto)</span>}
        </span>

        {/* Deletar */}
        <form action={deleteAction}>
          <button type="submit" className="h-6 w-6 flex items-center justify-center shrink-0"
            style={{ color: "var(--text-muted)" }}>
            <Trash2 className="h-3 w-3" />
          </button>
        </form>
      </div>

      {/* Picker de imagem para ESCOLHA_IMAGEM */}
      {tipo === "ESCOLHA_IMAGEM" && (
        <div className="px-3 pb-2">
          <QuizImagePicker
            quizId={quizId}
            value={opcImagem}
            onChange={handleImageChange}
            compact
          />
        </div>
      )}
    </div>
  );
}
