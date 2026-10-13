"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, VolumeX, Volume2, Flag, Square, Check, ChevronRight } from "lucide-react";

// ── Tipos ──────────────────────────────────────────────────────────────────────

type Opcao = { id: string; texto: string; imagem_url: string | null; correta: boolean };
type Questao = {
  id: string;
  enunciado: string;
  tipo: string;
  imagem_url: string | null;
  explicacao: string | null;
  opcoes: Opcao[];
};
type QuizData = {
  id: string;
  titulo: string;
  capa_url: string | null;
  termos: string[];
  questoes: Questao[];
};

interface Props {
  quiz: QuizData;
  backUrl: string;
}

// ── Constantes ─────────────────────────────────────────────────────────────────

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

export function QuizPlayer({ quiz, backUrl }: Props) {
  const router = useRouter();

  // Fases: config → playing → finished
  type Phase = "config" | "playing" | "finished";
  const [phase, setPhase] = useState<Phase>("config");

  // Config
  const [selectedTime, setSelectedTime] = useState(TIME_OPTIONS[1]); // 10 min default
  const [termosExpanded, setTermosExpanded] = useState(false);

  // Playing
  const [questions, setQuestions]     = useState<Questao[]>([]);
  const [currentIdx, setCurrentIdx]   = useState(0);
  const [elapsed, setElapsed]         = useState(0);
  const [muted, setMuted]             = useState(false);
  const [menuOpen, setMenuOpen]       = useState(false);
  type AnswerState = "idle" | "correct" | "wrong";
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  // Finished
  const [totalTime, setTotalTime] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Timer ──
  useEffect(() => {
    if (phase === "playing") {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  // ── Iniciar sessão ──
  function startSession() {
    const shuffled = shuffle(quiz.questoes).slice(0, selectedTime.questoes);
    setQuestions(shuffled);
    setCurrentIdx(0);
    setElapsed(0);
    setCorrectCount(0);
    setAnswerState("idle");
    setSelectedId(null);
    setPhase("playing");
  }

  // ── Responder ──
  const handleAnswer = useCallback((opcao: Opcao) => {
    if (answerState !== "idle") return;
    setSelectedId(opcao.id);
    if (opcao.correta) {
      setAnswerState("correct");
      setCorrectCount((c) => c + 1);
      setTimeout(advanceQuestion, 1200);
    } else {
      setAnswerState("wrong");
      setTimeout(advanceQuestion, 2200);
    }
  }, [answerState]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Avançar ──
  const advanceQuestion = useCallback(() => {
    setAnswerState("idle");
    setSelectedId(null);
    setCurrentIdx((idx) => {
      if (idx + 1 >= questions.length) {
        setTotalTime(elapsed);
        setPhase("finished");
        return idx;
      }
      return idx + 1;
    });
  }, [questions.length, elapsed]);

  // ── Encerrar antecipado ──
  function endEarly() {
    setTotalTime(elapsed);
    setPhase("finished");
    setMenuOpen(false);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FASE: CONFIG
  // ─────────────────────────────────────────────────────────────────────────────
  if (phase === "config") {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
        style={{ backgroundColor: "var(--bg-base)" }}
      >
        <div
          className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl"
          style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-surface)" }}
        >
          {/* Capa */}
          {quiz.capa_url && (
            <div className="relative h-32 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={quiz.capa_url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, var(--bg-surface))" }} />
            </div>
          )}

          <div className="px-6 pb-6 pt-4">
            {/* Badge + título */}
            <span
              className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded mb-2"
              style={{ backgroundColor: "var(--accent)", color: "#fff" }}
            >
              Cuestionario
            </span>
            <h1 className="text-lg font-bold mb-5 leading-snug" style={{ color: "var(--text-primary)" }}>
              {quiz.titulo}
            </h1>

            {/* Selector de tiempo */}
            <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
              ¿Cuánto tiempo quieres estudiar?
            </p>
            <div className="flex gap-2 mb-6">
              {TIME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedTime(opt)}
                  className="flex-1 py-2 rounded-full text-sm font-medium transition-all"
                  style={{
                    border: `2px solid ${selectedTime.value === opt.value ? "var(--accent)" : "var(--border)"}`,
                    backgroundColor: selectedTime.value === opt.value ? "var(--accent)" : "transparent",
                    color: selectedTime.value === opt.value ? "#fff" : "var(--text-secondary)",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Botão iniciar */}
            <button
              onClick={startSession}
              className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wide text-white mb-4 transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--accent)" }}
            >
              Comenzar a estudiar ▶ {selectedTime.label}
            </button>

            {/* Lo que aprenderás */}
            {quiz.termos.length > 0 && (
              <div>
                <button
                  onClick={() => setTermosExpanded((v) => !v)}
                  className="flex items-center gap-2 text-sm w-full py-2"
                  style={{
                    borderTop: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <span className="flex-1 text-left">Lo que aprenderás</span>
                  <ChevronRight
                    className="h-4 w-4 transition-transform shrink-0"
                    style={{ transform: termosExpanded ? "rotate(90deg)" : "none" }}
                  />
                </button>

                {termosExpanded && (
                  <div className="pt-3 pb-1">
                    <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                      Haz clic para quitar contenido de la sesión de estudio:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {quiz.termos.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                          style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                        >
                          <span className="h-3 w-3 rounded-full border text-center leading-none flex items-center justify-center shrink-0"
                            style={{ borderColor: "var(--text-muted)", fontSize: 9 }}>●</span>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Voltar */}
        <button
          onClick={() => router.back()}
          className="mt-6 text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          ← Volver al tema
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FASE: PLAYING
  // ─────────────────────────────────────────────────────────────────────────────
  if (phase === "playing") {
    const q = questions[currentIdx];
    const progress = questions.length > 0 ? (currentIdx / questions.length) * 100 : 0;

    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: "var(--bg-base)" }}
        onClick={() => menuOpen && setMenuOpen(false)}
      >
        {/* ── Barra superior ── */}
        <div
          className="sticky top-0 z-20 flex items-center gap-3 px-4 h-14"
          style={{ backgroundColor: "#1e2832", color: "#fff" }}
        >
          {/* Menu */}
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
            className="h-8 w-8 flex items-center justify-center rounded shrink-0"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Progresso */}
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: "var(--accent)" }}
            />
          </div>

          {/* Timer */}
          <span className="text-sm font-mono tabular-nums shrink-0">{formatTime(elapsed)}</span>

          {/* Pause */}
          <button className="h-8 w-8 flex items-center justify-center rounded shrink-0">
            <span className="text-xs font-bold">⏸</span>
          </button>
        </div>

        {/* ── Dropdown menu ── */}
        {menuOpen && (
          <div
            className="fixed z-30 left-3 top-16 rounded-xl overflow-hidden shadow-xl"
            style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-surface)", minWidth: 220 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { setMuted((v) => !v); setMenuOpen(false); }}
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
              onClick={endEarly}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium"
              style={{ color: "#fff", backgroundColor: "#E57373", borderTop: "1px solid var(--border)" }}
            >
              <Square className="h-4 w-4 shrink-0" />
              Terminar este cuestionario
            </button>
          </div>
        )}

        {/* ── Enunciado ── */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full">
          {/* Imagen del enunciado (opcional) */}
          {q.imagem_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={q.imagem_url}
              alt=""
              className="w-full max-w-sm rounded-xl object-cover mb-6"
              style={{ maxHeight: 200, border: "1px solid var(--border)" }}
            />
          )}

          {/* Texto */}
          <p
            className="text-base text-center leading-relaxed mb-8 max-w-lg"
            style={{ color: "var(--accent)", fontWeight: 500 }}
          >
            {q.enunciado}
          </p>

          {/* Opciones */}
          <div className="w-full">
            {q.tipo === "VERDADEIRO_FALSO" && (
              <VFOpcoes opcoes={q.opcoes} answerState={answerState} selectedId={selectedId} onAnswer={handleAnswer} />
            )}
            {q.tipo === "MULTIPLA_ESCOLHA" && (
              <MultiOpcoes opcoes={q.opcoes} answerState={answerState} selectedId={selectedId} onAnswer={handleAnswer} />
            )}
            {q.tipo === "ESCOLHA_IMAGEM" && (
              <ImageOpcoes opcoes={q.opcoes} answerState={answerState} selectedId={selectedId} onAnswer={handleAnswer} />
            )}
          </div>

          {/* Explicação (se wrong) */}
          {answerState === "wrong" && q.explicacao && (
            <div
              className="mt-5 w-full rounded-xl p-4 text-sm"
              style={{ backgroundColor: "color-mix(in srgb, #EF4444 10%, var(--bg-surface))", border: "1px solid #EF4444", color: "var(--text-secondary)" }}
            >
              {q.explicacao}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FASE: FINISHED
  // ─────────────────────────────────────────────────────────────────────────────
  const pct = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 text-center shadow-xl"
        style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-surface)" }}
      >
        {/* Ícone resultado */}
        <div
          className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ backgroundColor: pct >= 70 ? "#22C55E22" : "#EF444422" }}
        >
          {pct >= 70
            ? <Check className="h-8 w-8" style={{ color: "#22C55E" }} />
            : <X className="h-8 w-8" style={{ color: "#EF4444" }} />}
        </div>

        <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>{pct}%</h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          {correctCount} de {questions.length} correctas · {formatTime(totalTime)}
        </p>

        {/* Mensagem motivacional */}
        <p className="text-sm mb-8 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {pct >= 90 ? "¡Excelente! Dominas este tema."
           : pct >= 70 ? "¡Buen trabajo! Sigue practicando para mejorar."
           : "Sigue estudiando. La práctica constante hace al maestro."}
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={startSession}
            className="w-full py-3 rounded-xl font-bold text-sm text-white"
            style={{ backgroundColor: "var(--accent)" }}
          >
            Volver a intentar
          </button>
          <button
            onClick={() => router.push(backUrl)}
            className="w-full py-2.5 rounded-xl text-sm"
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            Volver al tema
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sub-componentes de opciones ────────────────────────────────────────────────

type OpcaoProps = {
  opcoes: Opcao[];
  answerState: "idle" | "correct" | "wrong";
  selectedId: string | null;
  onAnswer: (o: Opcao) => void;
};

function opcaoStyle(op: Opcao, answerState: "idle" | "correct" | "wrong", selectedId: string | null): React.CSSProperties {
  const isSelected = op.id === selectedId;
  if (answerState === "idle") return { border: "1px solid var(--border)", backgroundColor: "#fff", color: "#1a1a1a" };
  if (answerState === "correct" && isSelected) return { border: "2px solid #22C55E", backgroundColor: "#22C55E22", color: "#1a1a1a" };
  if (answerState === "wrong") {
    if (isSelected) return { border: "2px solid #EF4444", backgroundColor: "#EF444422", color: "#1a1a1a" };
    if (op.correta) return { border: "2px solid #22C55E", backgroundColor: "#22C55E22", color: "#1a1a1a" };
    return { border: "1px solid var(--border)", backgroundColor: "#fff", color: "#1a1a1a", opacity: 0.4 };
  }
  return { border: "1px solid var(--border)", backgroundColor: "#fff", color: "#1a1a1a" };
}

function VFOpcoes({ opcoes, answerState, selectedId, onAnswer }: OpcaoProps) {
  const vf = opcoes.length === 2 ? opcoes : [
    { id: "V", texto: "Verdadero", imagem_url: null, correta: false },
    { id: "F", texto: "Falso", imagem_url: null, correta: false },
  ];
  return (
    <div className="flex flex-col gap-2 max-w-md mx-auto">
      {vf.map((op) => (
        <button
          key={op.id}
          onClick={() => onAnswer(op)}
          disabled={answerState !== "idle"}
          className="w-full py-3.5 rounded-xl text-sm font-semibold uppercase tracking-wide transition-all"
          style={opcaoStyle(op, answerState, selectedId)}
        >
          {op.texto}
        </button>
      ))}
    </div>
  );
}

function MultiOpcoes({ opcoes, answerState, selectedId, onAnswer }: OpcaoProps) {
  return (
    <div className="flex flex-col gap-2 max-w-xl mx-auto">
      {opcoes.map((op) => (
        <button
          key={op.id}
          onClick={() => onAnswer(op)}
          disabled={answerState !== "idle"}
          className="w-full px-4 py-3 rounded-xl text-sm text-left transition-all"
          style={opcaoStyle(op, answerState, selectedId)}
        >
          {op.texto}
        </button>
      ))}
    </div>
  );
}

function ImageOpcoes({ opcoes, answerState, selectedId, onAnswer }: OpcaoProps) {
  return (
    <div className="grid grid-cols-2 gap-3 max-w-xl mx-auto">
      {opcoes.map((op) => (
        <button
          key={op.id}
          onClick={() => onAnswer(op)}
          disabled={answerState !== "idle"}
          className="rounded-xl overflow-hidden text-left transition-all"
          style={opcaoStyle(op, answerState, selectedId)}
        >
          {op.imagem_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={op.imagem_url} alt="" className="w-full aspect-video object-cover" />
          )}
          {op.texto && (
            <p className="px-2 py-1.5 text-xs font-medium">{op.texto}</p>
          )}
        </button>
      ))}
    </div>
  );
}
