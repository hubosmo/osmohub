"use client";

import { useRef, useEffect } from "react";
import { Trophy, X } from "lucide-react";

// ── Confete ────────────────────────────────────────────────────────────────────

function ConfettiEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ec4899", "#a855f7", "#06b6d4", "#f97316"];

    type P = { x: number; y: number; vx: number; vy: number; color: string; size: number; rot: number; rotV: number };
    const particles: P[] = Array.from({ length: 150 }, () => ({
      x:     Math.random() * canvas.width,
      y:     -20 - Math.random() * 300,
      vx:    (Math.random() - 0.5) * 4,
      vy:    2.5 + Math.random() * 3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size:  7 + Math.random() * 9,
      rot:   Math.random() * Math.PI * 2,
      rotV:  (Math.random() - 0.5) * 0.18,
    }));

    const t0 = Date.now();
    let raf: number;

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const elapsed = Date.now() - t0;
      const alpha   = elapsed < 2500 ? 1 : Math.max(0, 1 - (elapsed - 2500) / 1500);
      if (alpha <= 0) return;

      for (const p of particles) {
        p.x   += p.vx;
        p.y   += p.vy;
        p.vy  += 0.06;
        p.vx  += (Math.random() - 0.5) * 0.1;
        p.rot += p.rotV;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }
      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 40 }} />;
}

// ── Fase de resultados ─────────────────────────────────────────────────────────

interface Props {
  pct: number;
  correctCount: number;
  wrongCount: number;
  totalTime: string;
  onRetry: () => void;
  onBack: () => void;
}

export function QuizFinishedPhase({ pct, correctCount, wrongCount, totalTime, onRetry, onBack }: Props) {
  const R          = 44;
  const C          = 2 * Math.PI * R;
  const ringOffset = C * (1 - pct / 100);
  const ringColor  = pct >= 70 ? "#22C55E" : "#EF4444";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      {pct >= 70 && <ConfettiEffect />}

      <div
        className="w-full max-w-sm rounded-2xl p-8 text-center shadow-xl"
        style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-surface)", position: "relative", zIndex: 50 }}
      >
        {/* Ring de progresso SVG */}
        <div className="flex justify-center mb-4">
          <div className="relative inline-flex items-center justify-center">
            <svg width={112} height={112} viewBox="0 0 112 112">
              <circle cx={56} cy={56} r={R} fill="none" stroke="var(--border)" strokeWidth={7} />
              <circle
                cx={56} cy={56} r={R}
                fill="none"
                stroke={ringColor}
                strokeWidth={7}
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={ringOffset}
                transform="rotate(-90 56 56)"
                style={{ transition: "stroke-dashoffset 1s ease-out" }}
              />
            </svg>
            <div className="absolute flex items-center justify-center">
              {pct >= 70
                ? <Trophy className="h-8 w-8" style={{ color: "#22C55E" }} />
                : <X      className="h-8 w-8" style={{ color: "#EF4444" }} />}
            </div>
          </div>
        </div>

        {/* Percentagem */}
        <h2 className="text-4xl font-black mb-1 tabular-nums" style={{ color: "var(--text-primary)" }}>
          {pct}%
        </h2>

        {/* Mensagem motivacional */}
        <p className="text-sm font-semibold mb-6" style={{ color: ringColor }}>
          {pct >= 90 ? "¡Excelente! Dominas este tema."
           : pct >= 70 ? "¡Buen trabajo! Sigue practicando."
           : "Sigue estudiando. ¡Tú puedes!"}
        </p>

        {/* Stats */}
        <div
          className="flex justify-around mb-8 py-4 rounded-xl"
          style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }}
        >
          <div className="text-center">
            <p className="text-xl font-bold tabular-nums" style={{ color: "#22C55E" }}>{correctCount}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Correctas</p>
          </div>
          <div className="w-px self-stretch" style={{ backgroundColor: "var(--border)" }} />
          <div className="text-center">
            <p className="text-xl font-bold tabular-nums" style={{ color: wrongCount > 0 ? "#EF4444" : "var(--text-muted)" }}>
              {wrongCount}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Incorrectas</p>
          </div>
          <div className="w-px self-stretch" style={{ backgroundColor: "var(--border)" }} />
          <div className="text-center">
            <p className="text-xl font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>{totalTime}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Tiempo</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onRetry}
            className="w-full py-3 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--accent)" }}
          >
            Volver a intentar
          </button>
          <button
            onClick={onBack}
            className="w-full py-2.5 rounded-xl text-sm transition-opacity hover:opacity-70"
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            Volver al tema
          </button>
        </div>
      </div>
    </div>
  );
}
