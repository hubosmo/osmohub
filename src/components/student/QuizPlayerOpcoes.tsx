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
    // Only reveal the correct answer when there's no retry left
    if (op.correta && !hideCorrect) return { border: "2px solid #22C55E", backgroundColor: "#22C55E22", color: "var(--text-primary)" };
    if (wasWrong)    return { border: "1px solid #EF4444", backgroundColor: "#EF444411", color: "var(--text-primary)", opacity: 0.5 };
    return { border: "1px solid var(--border)", backgroundColor: "var(--bg-elevated)", color: "var(--text-primary)", opacity: 0.4 };
  }
  return { border: "1px solid var(--border)", backgroundColor: "var(--bg-elevated)", color: "var(--text-primary)" };
}

// ── Layout de questão ──────────────────────────────────────────────────────────

export function QuestionLayout({ q, isMobile, answerState, selectedId, wrongIds, onAnswer, hideCorrect, hideEnunciado }: QLProps) {
  const showExplicacao = answerState === "wrong" && !hideCorrect && q.explicacao;
  return (
    <div className={`w-full ${!isMobile && q.imagem_url ? "max-w-5xl" : "max-w-2xl"} mx-auto`}>
      {!isMobile && q.imagem_url ? (
        <div className="flex gap-10 w-full items-center">
          <div className="flex-1 shrink-0 rounded-2xl overflow-hidden" style={{ maxWidth: "48%", border: "1px solid var(--border)" }}>
            <AtlasImageViewer src={q.imagem_url} alt="" />
          </div>
          <div className="flex-1 flex flex-col">
            {!hideEnunciado && (
              <p className="text-base leading-relaxed mb-8" style={{ color: "var(--accent)", fontWeight: 500 }}>
                {q.enunciado}
              </p>
            )}
            <div className="w-full">
              {q.tipo === "VERDADEIRO_FALSO" && <VFOpcoes    opcoes={q.opcoes} answerState={answerState} selectedId={selectedId} onAnswer={onAnswer} wrongIds={wrongIds} hideCorrect={hideCorrect} />}
              {q.tipo === "MULTIPLA_ESCOLHA" && <MultiOpcoes opcoes={q.opcoes} answerState={answerState} selectedId={selectedId} onAnswer={onAnswer} wrongIds={wrongIds} hideCorrect={hideCorrect} />}
              {q.tipo === "ESCOLHA_IMAGEM"   && <ImageOpcoes opcoes={q.opcoes} answerState={answerState} selectedId={selectedId} onAnswer={onAnswer} wrongIds={wrongIds} hideCorrect={hideCorrect} />}
            </div>
            {showExplicacao && <Explicacao text={q.explicacao!} />}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full">
          {q.imagem_url && (
            <div className="w-full max-w-sm rounded-xl overflow-hidden mb-6" style={{ border: "1px solid var(--border)" }}>
              <AtlasImageViewer src={q.imagem_url} alt="" />
            </div>
          )}
          {!hideEnunciado && (
            <p className="text-base text-center leading-relaxed mb-8 max-w-lg" style={{ color: "var(--accent)", fontWeight: 500 }}>
              {q.enunciado}
            </p>
          )}
          <div className="w-full">
            {q.tipo === "VERDADEIRO_FALSO" && <VFOpcoes    opcoes={q.opcoes} answerState={answerState} selectedId={selectedId} onAnswer={onAnswer} wrongIds={wrongIds} hideCorrect={hideCorrect} />}
            {q.tipo === "MULTIPLA_ESCOLHA" && <MultiOpcoes opcoes={q.opcoes} answerState={answerState} selectedId={selectedId} onAnswer={onAnswer} wrongIds={wrongIds} hideCorrect={hideCorrect} />}
            {q.tipo === "ESCOLHA_IMAGEM"   && <ImageOpcoes opcoes={q.opcoes} answerState={answerState} selectedId={selectedId} onAnswer={onAnswer} wrongIds={wrongIds} hideCorrect={hideCorrect} />}
          </div>
          {showExplicacao && <Explicacao text={q.explicacao!} />}
        </div>
      )}
    </div>
  );
}

function Explicacao({ text }: { text: string }) {
  return (
    <div className="mt-5 w-full rounded-xl p-4 text-sm" style={{ backgroundColor: "color-mix(in srgb, #EF4444 10%, var(--bg-surface))", border: "1px solid #EF4444", color: "var(--text-secondary)" }}>
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
  return (
    <div className="flex flex-col gap-2 max-w-md mx-auto">
      {vf.map((op) => (
        <button key={op.id} onClick={() => onAnswer(op)}
          disabled={answerState !== "idle" || (wrongIds?.has(op.id) ?? false)}
          className="w-full py-3.5 rounded-xl text-sm font-semibold uppercase tracking-wide transition-all"
          style={opcaoStyle(op, answerState, selectedId, wrongIds, hideCorrect)}>
          {op.texto}
        </button>
      ))}
    </div>
  );
}

export function MultiOpcoes({ opcoes, answerState, selectedId, onAnswer, wrongIds, hideCorrect }: OpcaoProps) {
  return (
    <div className="flex flex-col gap-2 max-w-xl mx-auto">
      {opcoes.map((op) => (
        <button key={op.id} onClick={() => onAnswer(op)}
          disabled={answerState !== "idle" || (wrongIds?.has(op.id) ?? false)}
          className="w-full px-4 py-3 rounded-xl text-sm text-left transition-all"
          style={opcaoStyle(op, answerState, selectedId, wrongIds, hideCorrect)}>
          {op.texto}
        </button>
      ))}
    </div>
  );
}

export function ImageOpcoes({ opcoes, answerState, selectedId, onAnswer, wrongIds, hideCorrect }: OpcaoProps) {
  return (
    <div className="grid grid-cols-2 gap-3 max-w-xl mx-auto">
      {opcoes.map((op) => (
        <button key={op.id} onClick={() => onAnswer(op)}
          disabled={answerState !== "idle" || (wrongIds?.has(op.id) ?? false)}
          className="rounded-xl overflow-hidden text-left transition-all"
          style={opcaoStyle(op, answerState, selectedId, wrongIds, hideCorrect)}>
          {op.imagem_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={op.imagem_url} alt="" className="w-full aspect-video object-cover" />
          )}
          {op.texto && <p className="px-2 py-1.5 text-xs font-medium">{op.texto}</p>}
        </button>
      ))}
    </div>
  );
}
