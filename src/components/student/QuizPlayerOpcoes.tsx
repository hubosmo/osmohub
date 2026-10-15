"use client";

import React from "react";
import { AtlasImageViewer } from "@/components/student/AtlasImageViewer";

// ── Tipos compartilhados ───────────────────────────────────────────────────────

export type Opcao = { id: string; texto: string; imagem_url: string | null; correta: boolean };
export type Questao = {
  id: string;
  enunciado: string;
  tipo: string;
  imagem_url: string | null;
  explicacao: string | null;
  termo: string | null;
  opcoes: Opcao[];
};
export type AnswerState = "idle" | "correct" | "wrong";

export type OpcaoProps = {
  opcoes: Opcao[];
  answerState: AnswerState;
  selectedId: string | null;
  onAnswer: (o: Opcao) => void;
  wrongIds?: Set<string>;
  hideCorrect?: boolean;
};

export type QLProps = {
  q: Questao;
  isMobile: boolean;
  answerState: AnswerState;
  selectedId: string | null;
  wrongIds: Set<string>;
  onAnswer: (o: Opcao) => void;
  hideCorrect?: boolean;
  hideEnunciado?: boolean;
};

// ── Estilos de opção ───────────────────────────────────────────────────────────

export function opcaoStyle(
  op: Opcao,
  answerState: AnswerState,
  selectedId: string | null,
  wrongIds?: Set<string>,
  hideCorrect?: boolean,
): React.CSSProperties {
  const isSelected = op.id === selectedId;
  const wasWrong   = wrongIds?.has(op.id) ?? false;
  if (answerState === "idle") {
    if (wasWrong) return { border: "1px solid #EF4444", backgroundColor: "#EF444411", color: "var(--text-primary)", opacity: 0.5 };
    return { border: "1px solid var(--border)", backgroundColor: "var(--bg-elevated)", color: "var(--text-primary)" };
  }
  if (answerState === "correct" && isSelected) return { border: "2px solid #22C55E", backgroundColor: "#22C55E22", color: "var(--text-primary)" };
  if (answerState === "wrong") {
    if (isSelected) return { border: "2px solid #EF4444", backgroundColor: "#EF444422", color: "var(--text-primary)" };
    if (op.correta && !hideCorrect) return { border: "2px solid #22C55E", backgroundColor: "#22C55E22", color: "var(--text-primary)" };
    if (wasWrong) return { border: "1px solid #EF4444", backgroundColor: "#EF444411", color: "var(--text-primary)", opacity: 0.5 };
    return { border: "1px solid var(--border)", backgroundColor: "var(--bg-elevated)", color: "var(--text-primary)", opacity: 0.4 };
  }
  return { border: "1px solid var(--border)", backgroundColor: "var(--bg-elevated)", color: "var(--text-primary)" };
}

// ── Layout de questão ──────────────────────────────────────────────────────────

export function QuestionLayout({ q, isMobile, answerState, selectedId, wrongIds, onAnswer, hideCorrect, hideEnunciado }: QLProps) {
  const showExplicacao = answerState === "wrong" && !hideCorrect && q.explicacao;

  // ── ESCOLHA_IMAGEM: enunciado na barra sticky, opções como cards grandes ──
  if (q.tipo === "ESCOLHA_IMAGEM") {
    return (
      <div className="w-full flex flex-col gap-6">
        {/* imagem de contexto do enunciado, se existir */}
        {q.imagem_url && (
          <div className="w-full max-w-sm mx-auto rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            <AtlasImageViewer src={q.imagem_url} alt="" />
          </div>
        )}
        <ImageOpcoesLarge
          opcoes={q.opcoes}
          answerState={answerState}
          selectedId={selectedId}
          onAnswer={onAnswer}
          wrongIds={wrongIds}
          hideCorrect={hideCorrect}
          isMobile={isMobile}
        />
        {showExplicacao && <Explicacao text={q.explicacao!} />}
      </div>
    );
  }

  // ── Desktop: dois colunas para MULTIPLA_ESCOLHA e VERDADEIRO_FALSO ──
  if (!isMobile) {
    return (
      <div className="flex gap-8 w-full items-stretch">

        {/* Coluna esquerda: imagem de contexto OU card de enunciado */}
        <div className="flex-1 shrink-0" style={{ maxWidth: "48%" }}>
          {q.imagem_url ? (
            <div className="rounded-2xl overflow-hidden h-full" style={{ border: "1px solid var(--border)" }}>
              <AtlasImageViewer src={q.imagem_url} alt="" />
            </div>
          ) : (
            <div
              className="rounded-2xl p-8 h-full flex flex-col justify-center"
              style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-surface)" }}
            >
              <p className="text-xl leading-relaxed font-semibold" style={{ color: "var(--accent)" }}>
                {q.enunciado}
              </p>
            </div>
          )}
        </div>

        {/* Coluna direita: enunciado (só se tiver imagem de contexto) + opções */}
        <div className="flex-1 flex flex-col justify-center gap-4">
          {q.imagem_url && !hideEnunciado && (
            <p className="text-base leading-relaxed font-medium" style={{ color: "var(--accent)" }}>
              {q.enunciado}
            </p>
          )}
          <div>
            {q.tipo === "VERDADEIRO_FALSO" && <VFOpcoes    opcoes={q.opcoes} answerState={answerState} selectedId={selectedId} onAnswer={onAnswer} wrongIds={wrongIds} hideCorrect={hideCorrect} />}
            {q.tipo === "MULTIPLA_ESCOLHA" && <MultiOpcoes opcoes={q.opcoes} answerState={answerState} selectedId={selectedId} onAnswer={onAnswer} wrongIds={wrongIds} hideCorrect={hideCorrect} />}
          </div>
          {showExplicacao && <Explicacao text={q.explicacao!} />}
        </div>
      </div>
    );
  }

  // ── Mobile: coluna única ──
  return (
    <div className="flex flex-col items-center w-full">
      {q.imagem_url && (
        <div className="w-full rounded-xl overflow-hidden mb-5" style={{ border: "1px solid var(--border)" }}>
          <AtlasImageViewer src={q.imagem_url} alt="" />
        </div>
      )}
      {!hideEnunciado && (
        <p className="text-base text-center leading-relaxed mb-6 max-w-sm" style={{ color: "var(--accent)", fontWeight: 500 }}>
          {q.enunciado}
        </p>
      )}
      <div className="w-full">
        {q.tipo === "VERDADEIRO_FALSO" && <VFOpcoes    opcoes={q.opcoes} answerState={answerState} selectedId={selectedId} onAnswer={onAnswer} wrongIds={wrongIds} hideCorrect={hideCorrect} />}
        {q.tipo === "MULTIPLA_ESCOLHA" && <MultiOpcoes opcoes={q.opcoes} answerState={answerState} selectedId={selectedId} onAnswer={onAnswer} wrongIds={wrongIds} hideCorrect={hideCorrect} />}
        {q.tipo === "ESCOLHA_IMAGEM"   && <ImageOpcoesLarge opcoes={q.opcoes} answerState={answerState} selectedId={selectedId} onAnswer={onAnswer} wrongIds={wrongIds} hideCorrect={hideCorrect} isMobile />}
      </div>
      {showExplicacao && <Explicacao text={q.explicacao!} />}
    </div>
  );
}

function Explicacao({ text }: { text: string }) {
  return (
    <div className="mt-4 w-full rounded-xl p-4 text-sm" style={{ backgroundColor: "color-mix(in srgb, #EF4444 10%, var(--bg-surface))", border: "1px solid #EF4444", color: "var(--text-secondary)" }}>
      {text}
    </div>
  );
}

// ── Tipos de opção ─────────────────────────────────────────────────────────────

export function VFOpcoes({ opcoes, answerState, selectedId, onAnswer, wrongIds, hideCorrect }: OpcaoProps) {
  const vf = opcoes.length === 2 ? opcoes : [
    { id: "V", texto: "Verdadero", imagem_url: null, correta: false },
    { id: "F", texto: "Falso",     imagem_url: null, correta: false },
  ];
  const letters = ["V", "F"];
  return (
    <div className="flex flex-col gap-3">
      {vf.map((op, i) => (
        <button
          key={op.id}
          onClick={() => onAnswer(op)}
          disabled={answerState !== "idle" || (wrongIds?.has(op.id) ?? false)}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-sm font-semibold uppercase tracking-wide transition-all text-left"
          style={opcaoStyle(op, answerState, selectedId, wrongIds, hideCorrect)}
        >
          <span
            className="shrink-0 h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{ backgroundColor: "rgba(128,128,128,0.12)" }}
          >
            {letters[i]}
          </span>
          {op.texto}
        </button>
      ))}
    </div>
  );
}

const OPTION_LETTERS = ["A", "B", "C", "D", "E"];

export function MultiOpcoes({ opcoes, answerState, selectedId, onAnswer, wrongIds, hideCorrect }: OpcaoProps) {
  return (
    <div className="flex flex-col gap-2">
      {opcoes.map((op, i) => (
        <button
          key={op.id}
          onClick={() => onAnswer(op)}
          disabled={answerState !== "idle" || (wrongIds?.has(op.id) ?? false)}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm text-left transition-all"
          style={opcaoStyle(op, answerState, selectedId, wrongIds, hideCorrect)}
        >
          <span
            className="shrink-0 h-7 w-7 rounded-md flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: "rgba(128,128,128,0.12)" }}
          >
            {OPTION_LETTERS[i] ?? String.fromCharCode(65 + i)}
          </span>
          {op.texto}
        </button>
      ))}
    </div>
  );
}

function imgOpcaoStyle(
  op: Opcao,
  answerState: AnswerState,
  selectedId: string | null,
  wrongIds?: Set<string>,
  hideCorrect?: boolean,
): React.CSSProperties {
  const isSelected = op.id === selectedId;
  const wasWrong   = wrongIds?.has(op.id) ?? false;
  if (answerState === "idle") {
    if (wasWrong) return { border: "3px solid #EF4444", opacity: 0.5 };
    return { border: "3px solid transparent" };
  }
  if (answerState === "correct" && isSelected) return { border: "3px solid #22C55E" };
  if (answerState === "wrong") {
    if (isSelected) return { border: "3px solid #EF4444" };
    if (op.correta && !hideCorrect) return { border: "3px solid #22C55E" };
    if (wasWrong) return { border: "3px solid #EF4444", opacity: 0.5 };
    return { border: "3px solid transparent", opacity: 0.4 };
  }
  return { border: "3px solid transparent" };
}

// Cards grandes para ESCOLHA_IMAGEM
function ImageOpcoesLarge({ opcoes, answerState, selectedId, onAnswer, wrongIds, hideCorrect, isMobile }: OpcaoProps & { isMobile?: boolean }) {
  const cols = opcoes.length === 3 ? 3 : 2;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: isMobile ? "0.75rem" : "1rem",
      }}
    >
      {opcoes.map((op) => (
        <button
          key={op.id}
          onClick={() => onAnswer(op)}
          disabled={answerState !== "idle" || (wrongIds?.has(op.id) ?? false)}
          className="rounded-2xl overflow-hidden text-left transition-all flex flex-col"
          style={{ ...imgOpcaoStyle(op, answerState, selectedId, wrongIds, hideCorrect), backgroundColor: "var(--bg-surface)" }}
        >
          <div className="w-full overflow-hidden">
            {op.imagem_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={op.imagem_url} alt="" className="w-full h-auto" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>Sin imagen</span>
              </div>
            )}
          </div>
          {op.texto && (
            <p className="px-3 py-2 text-sm font-medium text-center" style={{ color: "var(--text-primary)" }}>
              {op.texto}
            </p>
          )}
        </button>
      ))}
    </div>
  );
}

// mantido para compatibilidade (não usado no player, mas pode ser usado em outros contextos)
export function ImageOpcoes({ opcoes, answerState, selectedId, onAnswer, wrongIds, hideCorrect }: OpcaoProps) {
  return (
    <ImageOpcoesLarge
      opcoes={opcoes}
      answerState={answerState}
      selectedId={selectedId}
      onAnswer={onAnswer}
      wrongIds={wrongIds}
      hideCorrect={hideCorrect}
    />
  );
}
