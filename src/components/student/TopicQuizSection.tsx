"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Settings, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MODAL_BACKDROP, MODAL_PANEL, MODAL_TRANSITION, ACCORDION_OPEN, ACCORDION_CLOSE, ACCORDION_STYLE, STANDARD } from "@/lib/motion";

const TIME_OPTIONS = [
  { label: "5 min",  value: 5 },
  { label: "10 min", value: 10 },
  { label: "20 min", value: 20 },
  { label: "30 min", value: 30 },
];

type QuizCard = {
  id: string;
  titulo: string;
  descricao: string | null;
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

function TermChips({
  termos,
  deselected,
  onToggle,
}: {
  termos: string[];
  deselected: Set<string>;
  onToggle: (t: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {termos.map((t) => {
        const active = !deselected.has(t);
        return (
          <button
            key={t}
            type="button"
            onClick={() => onToggle(t)}
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition-all"
            style={{
              border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
              color: active ? "var(--accent)" : "var(--text-muted)",
              backgroundColor: active
                ? "color-mix(in srgb, var(--accent) 10%, transparent)"
                : "transparent",
              textDecoration: active ? "none" : "line-through",
              opacity: active ? 1 : 0.5,
            }}
          >
            <span
              className="h-3 w-3 rounded-full border flex items-center justify-center shrink-0"
              style={{ borderColor: active ? "var(--accent)" : "var(--text-muted)", fontSize: 9 }}
            >
              {active ? "●" : ""}
            </span>
            {t}
          </button>
        );
      })}
    </div>
  );
}

function QuizCardView({ quiz, backUrl }: { quiz: QuizCard; backUrl: string }) {
  const router = useRouter();
  const [configOpen, setConfigOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState(10);
  const [selectedAttempts, setSelectedAttempts] = useState(1);
  const [saveScope, setSaveScope] = useState<"this" | "default">("this");
  const [deselectedTermos, setDeselectedTermos] = useState<Set<string>>(new Set());
  const [termsExpanded, setTermsExpanded] = useState(false);
  const [modalTermsExpanded, setModalTermsExpanded] = useState(false);

  // Lê preferências salvas no primeiro render
  useEffect(() => {
    try {
      const t = parseInt(localStorage.getItem("osmo_quiz_default_time") ?? "");
      if (TIME_OPTIONS.some(o => o.value === t)) setSelectedTime(t);
      const a = parseInt(localStorage.getItem("osmo_quiz_default_attempts") ?? "");
      if (a === 1 || a === 2) setSelectedAttempts(a);
    } catch {}
  }, []);

  const termos = [...new Set(
    quiz.questoes.map(q => q.termo).filter((t): t is string => !!t?.trim())
  )];
  const descricao = quiz.descricao
    ?? `Demuestra lo que has aprendido con nuestro cuestionario de ${quiz.titulo.toLowerCase()}.`;

  function toggleTermo(t: string) {
    setDeselectedTermos(prev => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  }

  // fromModal: se true, pode salvar preferências conforme saveScope
  function startSession(fromModal = false) {
    if (fromModal && saveScope === "default") {
      try {
        localStorage.setItem("osmo_quiz_default_time", String(selectedTime));
        localStorage.setItem("osmo_quiz_default_attempts", String(selectedAttempts));
      } catch {}
    }
    const params = new URLSearchParams({ back: backUrl, time: String(selectedTime), attempts: String(selectedAttempts) });
    if (deselectedTermos.size > 0) {
      params.set("exclude", [...deselectedTermos].join("|"));
    }
    router.push(`/quizzes/${quiz.id}/session?${params}`);
  }

  const activeCount = termos.length - deselectedTermos.size;

  return (
    <>
      {/* Descripción — fuera del card */}
      <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text-secondary)" }}>
        {descricao}
      </p>

      {/* ── Card ── */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        {/* Cover */}
        <div
          className="relative h-36"
          style={{ backgroundColor: "var(--bg-elevated)" }}
        >
          {/* Fondo: imagen cropped + oscurecida */}
          {quiz.capa_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={quiz.capa_url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: "brightness(0.55)" }}
            />
          )}

          {/* Engrenagem: cor de destaque */}
          <button
            type="button"
            onClick={() => setConfigOpen(true)}
            className="absolute top-3 right-3 h-8 w-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
            style={{ backgroundColor: "var(--accent)" }}
            aria-label="Configurar sesión"
          >
            <Settings className="h-4 w-4 text-white" />
          </button>

          {/* Fila inferior: thumbnail + badge + título */}
          <div className="absolute bottom-3 left-3 right-12 flex items-end gap-3">
            {quiz.capa_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={quiz.capa_url}
                alt=""
                className="h-16 w-16 rounded-lg shrink-0 object-contain"
                style={{ border: "2px solid rgba(255,255,255,0.25)", backgroundColor: "rgba(255,255,255,0.08)" }}
              />
            )}
            <div>
              <span
                className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded mb-1.5"
                style={{ backgroundColor: "var(--accent)", color: "#fff" }}
              >
                Cuestionario
              </span>
              <p className="text-sm font-semibold text-white leading-snug">{quiz.titulo}</p>
            </div>
          </div>
        </div>

        {/* Comenzar */}
        <button
          type="button"
          onClick={() => startSession()}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--accent)" }}
        >
          Comenzar ▶ {selectedTime} min
        </button>

        {/* Lo que aprenderás — interactivo */}
        {termos.length > 0 && (
          <div style={{ borderTop: "1px solid var(--border)", backgroundColor: "var(--bg-surface)" }}>
            <button
              type="button"
              onClick={() => setTermsExpanded(v => !v)}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              <span className="flex-1 text-left">Lo que aprenderás</span>
              {deselectedTermos.size > 0 && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--accent) 15%, transparent)",
                    color: "var(--accent)",
                  }}
                >
                  {activeCount}/{termos.length}
                </span>
              )}
              <ChevronDown
                className="h-4 w-4 shrink-0 transition-transform"
                style={{
                  color: "var(--text-muted)",
                  transform: termsExpanded ? "rotate(180deg)" : "none",
                }}
              />
            </button>

            <AnimatePresence initial={false}>
            {termsExpanded && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={ACCORDION_OPEN} exit={ACCORDION_CLOSE} transition={STANDARD} style={ACCORDION_STYLE}>
                <div className="px-4 pb-4 pt-1">
                  <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                    Haz clic para quitar contenido de la sesión:
                  </p>
                  <TermChips termos={termos} deselected={deselectedTermos} onToggle={toggleTermo} />
                </div>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Modal de configuración ── */}
      <AnimatePresence>
      {configOpen && (
        <motion.div
          variants={MODAL_BACKDROP}
          initial="initial" animate="animate" exit="exit"
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setConfigOpen(false); }}
        >
          <motion.div
            variants={MODAL_PANEL}
            initial="initial" animate="animate" exit="exit"
            transition={MODAL_TRANSITION}
            className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)", maxHeight: "90dvh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Capa */}
            {quiz.capa_url && (
              <div className="relative h-28 overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={quiz.capa_url} alt="" className="w-full h-full object-cover" />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to bottom, transparent 30%, var(--bg-surface))" }}
                />
              </div>
            )}

            <div className="px-5 pb-6 pt-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-1">
                <span
                  className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                  style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                >
                  Cuestionario
                </span>
                <button
                  type="button"
                  onClick={() => setConfigOpen(false)}
                  className="p-1 rounded-lg transition-opacity hover:opacity-70"
                  style={{ color: "var(--text-muted)" }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <h2 className="text-base font-bold mb-1 leading-snug" style={{ color: "var(--text-primary)" }}>
                {quiz.titulo}
              </h2>
              <p className="text-xs mb-5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {descricao}
              </p>

              {/* Tiempo */}
              <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                ¿Cuánto tiempo quieres estudiar?
              </p>
              <div className="flex gap-2 mb-5">
                {TIME_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedTime(opt.value)}
                    className="flex-1 py-2 rounded-full text-sm font-medium transition-all"
                    style={{
                      border: `2px solid ${selectedTime === opt.value ? "var(--accent)" : "var(--border)"}`,
                      backgroundColor: selectedTime === opt.value ? "var(--accent)" : "transparent",
                      color: selectedTime === opt.value ? "#fff" : "var(--text-secondary)",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Intentos por pregunta */}
              <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                Intentos por pregunta
              </p>
              <div className="flex gap-2 mb-5">
                {([
                  { label: "1 intento",  value: 1, desc: "Sin segunda oportunidad" },
                  { label: "2 intentos", value: 2, desc: "Permite corregir una vez" },
                ] as const).map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedAttempts(opt.value)}
                    className="flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all text-left"
                    style={{
                      border: `2px solid ${selectedAttempts === opt.value ? "var(--accent)" : "var(--border)"}`,
                      backgroundColor: selectedAttempts === opt.value ? "var(--accent)" : "transparent",
                      color: selectedAttempts === opt.value ? "#fff" : "var(--text-secondary)",
                    }}
                  >
                    <div className="font-bold">{opt.label}</div>
                    <div style={{ fontSize: 10, opacity: 0.8, marginTop: 1 }}>{opt.desc}</div>
                  </button>
                ))}
              </div>

              {/* Lo que aprenderás */}
              {termos.length > 0 && (
                <div className="mb-5" style={{ borderTop: "1px solid var(--border)" }}>
                  <button
                    type="button"
                    onClick={() => setModalTermsExpanded(v => !v)}
                    className="flex items-center gap-2 w-full py-3 text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span className="flex-1 text-left font-medium">Lo que aprenderás</span>
                    {deselectedTermos.size > 0 && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: "color-mix(in srgb, var(--accent) 15%, transparent)",
                          color: "var(--accent)",
                        }}
                      >
                        {activeCount}/{termos.length}
                      </span>
                    )}
                    <ChevronRight
                      className="h-4 w-4 shrink-0 transition-transform"
                      style={{
                        color: "var(--text-muted)",
                        transform: modalTermsExpanded ? "rotate(90deg)" : "none",
                      }}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                  {modalTermsExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={ACCORDION_OPEN} exit={ACCORDION_CLOSE} transition={STANDARD} style={ACCORDION_STYLE}>
                      <div className="pb-2">
                        <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                          Haz clic para quitar contenido de la sesión:
                        </p>
                        <div style={{ maxHeight: 140, overflowY: "auto" }}>
                          <TermChips termos={termos} deselected={deselectedTermos} onToggle={toggleTermo} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  </AnimatePresence>
                </div>
              )}

              {/* Aplicar a */}
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-wide mb-2.5" style={{ color: "var(--text-muted)" }}>
                  Aplicar configuración a:
                </p>
                <div className="flex flex-col gap-2">
                  {([
                    { value: "this",    label: "Solo para este cuestionario" },
                    { value: "default", label: "Establecer como predeterminado" },
                  ] as const).map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSaveScope(opt.value)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-left transition-all"
                      style={{
                        border: `2px solid ${saveScope === opt.value ? "var(--accent)" : "var(--border)"}`,
                        backgroundColor: saveScope === opt.value
                          ? "color-mix(in srgb, var(--accent) 8%, transparent)"
                          : "transparent",
                        color: "var(--text-primary)",
                      }}
                    >
                      <span
                        className="h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0"
                        style={{ borderColor: saveScope === opt.value ? "var(--accent)" : "var(--border)" }}
                      >
                        {saveScope === opt.value && (
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--accent)" }} />
                        )}
                      </span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comenzar */}
              <button
                type="button"
                onClick={() => startSession(true)}
                className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wide text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--accent)" }}
              >
                Comenzar ▶ {selectedTime} min
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}
