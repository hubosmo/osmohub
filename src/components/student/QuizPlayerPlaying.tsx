"use client";

import { Menu, VolumeX, Volume2, Flag, Square, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Opcao, Questao, AnswerState } from "./QuizPlayerOpcoes";
import { QuestionLayout } from "./QuizPlayerOpcoes";
import { DROPDOWN, DROPDOWN_ORIGIN, FAST } from "@/lib/motion";

interface Props {
  q: Questao;
  prevQ: Questao | null;
  prevIdx: number | null;
  isMobile: boolean;
  timerDisplay: string;
  progress: number;
  muted: boolean;
  menuOpen: boolean;
  answerState: AnswerState;
  selectedId: string | null;
  wrongIds: Set<string>;
  hideCorrect: boolean;
  isReviewing: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  onMenuToggle: () => void;
  onMuteToggle: () => void;
  onEndEarly: () => void;
  onAnswer: (o: Opcao) => void;
  onGoBack: () => void;
  onGoForward: () => void;
  onClearPrev: () => void;
}

export function QuizPlayingPhase({
  q, prevQ, prevIdx, isMobile,
  timerDisplay, progress, muted, menuOpen,
  answerState, selectedId, wrongIds, hideCorrect,
  isReviewing, canGoBack, canGoForward,
  onMenuToggle, onMuteToggle, onEndEarly, onAnswer, onGoBack, onGoForward, onClearPrev,
}: Props) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--bg-base)" }}
      onClick={() => menuOpen && onMenuToggle()}
    >
      {/* ── Barra superior ── */}
      <div
        className="sticky top-0 z-20 flex items-center gap-3 px-4 h-14"
        style={{ backgroundColor: "var(--bg-elevated)", borderBottom: "1px solid var(--border)", color: "var(--text-primary)" }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); onMenuToggle(); }}
          className="h-8 w-8 flex items-center justify-center rounded shrink-0"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-surface)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: "var(--accent)" }}
          />
        </div>

        <span className="text-sm font-mono tabular-nums shrink-0">{timerDisplay}</span>

        <button
          onClick={onGoBack}
          disabled={!canGoBack}
          className="h-8 w-8 flex items-center justify-center rounded shrink-0 transition-opacity"
          style={{ opacity: canGoBack ? 1 : 0.3 }}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          onClick={canGoForward ? onGoForward : undefined}
          disabled={!canGoForward}
          className="h-8 w-8 flex items-center justify-center rounded shrink-0 transition-opacity"
          style={{ opacity: canGoForward ? 1 : 0.3 }}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* ── Barra instrução ── */}
      <div
        className="sticky top-14 z-20 flex items-center gap-3 px-4 py-3"
        style={{ backgroundColor: "var(--bg-base)", borderBottom: "1px solid var(--border)" }}
      >
        <p className="flex-1 text-sm leading-snug" style={{ color: isReviewing ? "var(--text-muted)" : q.tipo === "ESCOLHA_IMAGEM" ? "var(--accent)" : "var(--text-muted)" }}>
          {isReviewing
            ? "← Revisando respuesta anterior."
            : q.tipo === "ESCOLHA_IMAGEM" ? q.enunciado : "Responde la pregunta aquí abajo."}
        </p>
      </div>

      {/* ── Dropdown menu ── */}
      <AnimatePresence>
      {menuOpen && (
        <motion.div
          variants={DROPDOWN} initial="initial" animate="animate" exit="exit"
          transition={FAST}
          className="fixed z-30 left-3 top-16 rounded-xl overflow-hidden shadow-xl"
          style={{ ...DROPDOWN_ORIGIN, border: "1px solid var(--border)", backgroundColor: "var(--bg-surface)", minWidth: 220 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => { onMuteToggle(); onMenuToggle(); }}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors hover:opacity-80"
            style={{ color: "var(--text-primary)" }}
          >
            {muted ? <Volume2 className="h-4 w-4 shrink-0" /> : <VolumeX className="h-4 w-4 shrink-0" />}
            {muted ? "Activar sonidos" : "Silenciar sonidos"}
          </button>
          <button
            className="flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors hover:opacity-80"
            style={{ color: "var(--text-primary)", borderTop: "1px solid var(--border)" }}
          >
            <Flag className="h-4 w-4 shrink-0" />
            Reportar un problema
          </button>
          <button
            onClick={onEndEarly}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium"
            style={{ color: "#fff", backgroundColor: "#E57373", borderTop: "1px solid var(--border)" }}
          >
            <Square className="h-4 w-4 shrink-0" />
            Terminar este cuestionario
          </button>
        </motion.div>
      )}
      </AnimatePresence>

      {/* ── Slide de questões ── */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        {/* Questão a sair */}
        {prevQ && prevIdx !== null && (
          <div
            key={`exit-${prevIdx}`}
            className={`absolute inset-0 flex items-center justify-center px-4 py-8 w-full ${isMobile ? "max-w-2xl" : "max-w-5xl"} mx-auto pointer-events-none`}
            style={{ animation: "quiz-slide-out 0.28s cubic-bezier(0.4,0,0.2,1) both", zIndex: 1 }}
            onAnimationEnd={onClearPrev}
          >
            <QuestionLayout q={prevQ} isMobile={isMobile} answerState="idle" selectedId={null} wrongIds={new Set()} onAnswer={() => {}} hideEnunciado />
          </div>
        )}

        {/* Questão a entrar */}
        <div
          key={`enter-${q.id}`}
          className={`flex items-center justify-center px-4 py-6 w-full ${isMobile ? "max-w-2xl" : "max-w-5xl"} mx-auto`}
          style={{
            animation: prevQ ? "quiz-slide-in 0.28s cubic-bezier(0.4,0,0.2,1) both" : undefined,
            position: prevQ ? "absolute" : "relative",
            inset: prevQ ? 0 : undefined,
            zIndex: prevQ ? 2 : undefined,
          }}
        >
          <QuestionLayout q={q} isMobile={isMobile} answerState={answerState} selectedId={selectedId} wrongIds={wrongIds} onAnswer={onAnswer} hideCorrect={hideCorrect} hideEnunciado />
        </div>
      </div>
    </div>
  );
}
