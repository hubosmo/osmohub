"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/useIsMobile";
import type { Opcao, Questao, AnswerState } from "./QuizPlayerOpcoes";
import { QuizPlayingPhase } from "./QuizPlayerPlaying";
import { QuizFinishedPhase } from "./QuizPlayerFinished";
import { ACCORDION_OPEN, ACCORDION_CLOSE, ACCORDION_STYLE, STANDARD } from "@/lib/motion";

// ── Tipos ──────────────────────────────────────────────────────────────────────

type QuizData = {
  id: string;
  titulo: string;
  capa_url: string | null;
  questoes: Questao[];
};

interface Props {
  quiz: QuizData;
  backUrl: string;
  initialTime?: number;
  initialExclude?: string[];
  initialAttempts?: number;
}

// ── Utilitários ────────────────────────────────────────────────────────────────

const TIME_OPTIONS = [
  { label: "5 min",  value: 5,  questoes: 10 },
  { label: "10 min", value: 10, questoes: 20 },
  { label: "20 min", value: 20, questoes: 40 },
  { label: "30 min", value: 30, questoes: 999 },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ── Componente principal ───────────────────────────────────────────────────────

export function QuizPlayer({ quiz, backUrl, initialTime, initialExclude, initialAttempts }: Props) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const audioCtxRef = useRef<AudioContext | null>(null);

  function playSound(type: "select" | "correct" | "wrong") {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (type === "correct") {
        [523.25, 659.25, 783.99].forEach((freq, i) => {
          const osc = ctx.createOscillator(); const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.type = "sine"; osc.frequency.value = freq;
          const t = ctx.currentTime + i * 0.1;
          gain.gain.setValueAtTime(0.25, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
          osc.start(t); osc.stop(t + 0.35);
        });
      } else if (type === "wrong") {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination); osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.18, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
      } else {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination); osc.type = "sine"; osc.frequency.value = 480;
        gain.gain.setValueAtTime(0.08, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.08);
      }
    } catch {}
  }

  const hasInitialConfig = initialTime !== undefined;
  type Phase = "config" | "playing" | "finished";
  const [phase, setPhase] = useState<Phase>(hasInitialConfig ? "playing" : "config");

  const uniqueTermos = [...new Set(
    quiz.questoes.map(q => q.termo).filter((t): t is string => !!t?.trim())
  )];

  const defaultTimeOpt = TIME_OPTIONS.find(o => o.value === initialTime) ?? TIME_OPTIONS[1];
  const [selectedTime, setSelectedTime]     = useState(defaultTimeOpt);
  const [termosExpanded, setTermosExpanded] = useState(false);
  const [deselectedTermos, setDeselectedTermos] = useState<Set<string>>(new Set(initialExclude ?? []));

  function toggleTermo(t: string) {
    setDeselectedTermos(prev => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  }

  const [questions, setQuestions]       = useState<Questao[]>([]);
  const [currentIdx, setCurrentIdx]     = useState(0);
  const [elapsed, setElapsed]           = useState(0);
  const [muted, setMuted]               = useState(false);
  const [menuOpen, setMenuOpen]         = useState(false);
  const [answerState, setAnswerState]   = useState<AnswerState>("idle");
  const [selectedId, setSelectedId]     = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const maxAttempts = initialAttempts ?? 1;
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [wrongIds, setWrongIds]         = useState<Set<string>>(new Set());

  const [prevQ, setPrevQ]     = useState<Questao | null>(null);
  const [prevIdx, setPrevIdx] = useState<number | null>(null);

  const [totalTime, setTotalTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (hasInitialConfig && phase === "playing" && questions.length === 0) {
      startSession();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase === "playing") {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  function startSession() {
    const pool = deselectedTermos.size > 0
      ? quiz.questoes.filter(q => q.termo && !deselectedTermos.has(q.termo))
      : quiz.questoes;
    const shuffled = shuffle(pool).slice(0, selectedTime.questoes);
    setQuestions(shuffled);
    setCurrentIdx(0);
    setElapsed(0);
    setCorrectCount(0);
    setAnswerState("idle");
    setSelectedId(null);
    setPrevQ(null);
    setPrevIdx(null);
    setPhase("playing");
  }

  const advanceQuestion = useCallback(() => {
    setCurrentIdx((idx) => {
      setPrevQ(questions[idx] ?? null);
      setPrevIdx(idx);
      if (idx + 1 >= questions.length) {
        setTotalTime(elapsed);
        setPhase("finished");
        return idx;
      }
      return idx + 1;
    });
    setAnswerState("idle");
    setSelectedId(null);
    setAttemptsUsed(0);
    setWrongIds(new Set());
  }, [questions, elapsed]);

  const handleAnswer = useCallback((opcao: Opcao) => {
    if (answerState !== "idle") return;
    if (wrongIds.has(opcao.id)) return;
    setSelectedId(opcao.id);
    if (opcao.correta) {
      if (!muted) playSound("correct");
      setAnswerState("correct");
      setCorrectCount((c) => c + 1);
      setTimeout(advanceQuestion, 1200);
    } else {
      if (!muted) playSound("wrong");
      const newUsed = attemptsUsed + 1;
      setAttemptsUsed(newUsed);
      if (maxAttempts >= 2 && newUsed < maxAttempts) {
        setAnswerState("wrong");
        setWrongIds((prev) => new Set([...prev, opcao.id]));
        setTimeout(() => { setAnswerState("idle"); setSelectedId(null); }, 700);
      } else {
        setAnswerState("wrong");
        setTimeout(advanceQuestion, 2200);
      }
    }
  }, [answerState, muted, attemptsUsed, maxAttempts, wrongIds, advanceQuestion]); // eslint-disable-line react-hooks/exhaustive-deps

  function endEarly() {
    setTotalTime(elapsed);
    setPhase("finished");
    setMenuOpen(false);
  }

  // ── Fase config ──
  if (phase === "config") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8" style={{ backgroundColor: "var(--bg-base)" }}>
        <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl" style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-surface)" }}>
          {quiz.capa_url && (
            <div className="relative h-32 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={quiz.capa_url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, var(--bg-surface))" }} />
            </div>
          )}
          <div className="px-6 pb-6 pt-4">
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded mb-2" style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
              Cuestionario
            </span>
            <h1 className="text-lg font-bold mb-5 leading-snug" style={{ color: "var(--text-primary)" }}>{quiz.titulo}</h1>

            <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>¿Cuánto tiempo quieres estudiar?</p>
            <div className="flex gap-2 mb-6">
              {TIME_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => setSelectedTime(opt)} className="flex-1 py-2 rounded-full text-sm font-medium transition-all"
                  style={{ border: `2px solid ${selectedTime.value === opt.value ? "var(--accent)" : "var(--border)"}`, backgroundColor: selectedTime.value === opt.value ? "var(--accent)" : "transparent", color: selectedTime.value === opt.value ? "#fff" : "var(--text-secondary)" }}>
                  {opt.label}
                </button>
              ))}
            </div>

            <button onClick={startSession} className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wide text-white mb-4 transition-opacity hover:opacity-90" style={{ backgroundColor: "var(--accent)" }}>
              Comenzar a estudiar ▶ {selectedTime.label}
            </button>

            {uniqueTermos.length > 0 && (
              <div>
                <button onClick={() => setTermosExpanded((v) => !v)} className="flex items-center gap-2 text-sm w-full py-2" style={{ borderTop: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                  <span className="flex-1 text-left">
                    Lo que aprenderás
                    {deselectedTermos.size > 0 && (
                      <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "color-mix(in srgb, var(--accent) 15%, transparent)", color: "var(--accent)" }}>
                        {uniqueTermos.length - deselectedTermos.size}/{uniqueTermos.length}
                      </span>
                    )}
                  </span>
                  <ChevronRight className="h-4 w-4 transition-transform shrink-0" style={{ transform: termosExpanded ? "rotate(90deg)" : "none" }} />
                </button>
                <AnimatePresence initial={false}>
                {termosExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={ACCORDION_OPEN} exit={ACCORDION_CLOSE} transition={STANDARD} style={ACCORDION_STYLE}>
                    <div className="pt-3 pb-1">
                      <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>Haz clic para quitar contenido de la sesión de estudio:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {uniqueTermos.map((t) => {
                          const active = !deselectedTermos.has(t);
                          return (
                            <button key={t} onClick={() => toggleTermo(t)} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition-all"
                              style={{ border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`, color: active ? "var(--accent)" : "var(--text-muted)", backgroundColor: active ? "color-mix(in srgb, var(--accent) 10%, transparent)" : "transparent", textDecoration: active ? "none" : "line-through", opacity: active ? 1 : 0.5 }}>
                              <span className="h-3 w-3 rounded-full border flex items-center justify-center shrink-0" style={{ borderColor: active ? "var(--accent)" : "var(--text-muted)", fontSize: 9 }}>{active ? "●" : ""}</span>
                              {t}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
        <button onClick={() => router.back()} className="mt-6 text-sm" style={{ color: "var(--text-muted)" }}>← Volver al tema</button>
      </div>
    );
  }

  // ── Fase playing ──
  if (phase === "playing") {
    const q = questions[currentIdx];
    if (!q) return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg-base)" }}>
        <div className="h-8 w-8 rounded-full border-2 animate-spin" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
      </div>
    );
    // When maxAttempts >= 2 and the user still has a retry left, don't reveal
    // the correct answer — only the wrong choice is highlighted red.
    const hideCorrect = maxAttempts >= 2 && attemptsUsed < maxAttempts;
    return (
      <QuizPlayingPhase
        q={q} prevQ={prevQ} prevIdx={prevIdx} isMobile={isMobile}
        timerDisplay={formatTime(elapsed)}
        progress={questions.length > 0 ? (currentIdx / questions.length) * 100 : 0}
        muted={muted} menuOpen={menuOpen}
        answerState={answerState} selectedId={selectedId} wrongIds={wrongIds}
        hideCorrect={hideCorrect}
        onMenuToggle={() => setMenuOpen((v) => !v)}
        onMuteToggle={() => setMuted((v) => !v)}
        onEndEarly={endEarly}
        onAnswer={handleAnswer}
        onClearPrev={() => { setPrevQ(null); setPrevIdx(null); }}
      />
    );
  }

  // ── Fase finished ──
  const pct        = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
  const wrongCount = questions.length - correctCount;
  return (
    <QuizFinishedPhase
      pct={pct} correctCount={correctCount} wrongCount={wrongCount}
      totalTime={formatTime(totalTime)}
      onRetry={startSession}
      onBack={() => router.push(backUrl)}
    />
  );
}
