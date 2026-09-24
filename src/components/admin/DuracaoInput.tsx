"use client";

import { useState } from "react";

function segsToMmss(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function mmssToSegs(value: string): number | null {
  const clean = value.trim();
  // Aceita "MM:SS" ou só segundos
  if (clean.includes(":")) {
    const [m, s] = clean.split(":").map(Number);
    if (isNaN(m) || isNaN(s)) return null;
    return m * 60 + s;
  }
  const n = parseInt(clean, 10);
  return isNaN(n) ? null : n;
}

export function DuracaoInput({ defaultSecs }: { defaultSecs: number | null }) {
  const [display, setDisplay] = useState(defaultSecs ? segsToMmss(defaultSecs) : "");
  const segs = mmssToSegs(display);

  return (
    <div>
      <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>
        Duración <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(MM:SS)</span>
      </label>
      <input
        type="text"
        value={display}
        onChange={(e) => setDisplay(e.target.value)}
        placeholder="ej. 11:56"
        className="w-full h-9 px-3 rounded-lg text-sm outline-none"
        style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
      />
      <input type="hidden" name="duracao_seg" value={segs ?? ""} />
    </div>
  );
}
