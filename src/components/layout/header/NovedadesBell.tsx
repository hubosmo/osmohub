"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DROPDOWN, DROPDOWN_ORIGIN, FAST } from "@/lib/motion";
import { useIsMobile } from "@/hooks/useIsMobile";
import { marcarNovedadesVistasAction } from "@/lib/actions/novedades";
import type { NovedadesResumen } from "@/lib/novedades";
import { NovedadItem } from "@/components/student/novedades/NovedadItem";

// Sino de novedades do header: círculo vermelho com a quantidade de novedades sem ver; some ao marcar como vistas.
export function NovedadesBell({ resumen, tamanho = "sm", conTexto = false }: { resumen: NovedadesResumen; tamanho?: "sm" | "md"; conTexto?: boolean }) {
  const [abierto, setAbierto] = useState(false);
  const [visto, setVisto] = useState(false);
  const isMobile = useIsMobile();
  const hayNuevas = resumen.nuevas > 0 && !visto;

  // Marca tudo como visto: apaga o número vermelho e o destaque dos itens (o servidor guarda a data)
  function marcarVistas() {
    if (!hayNuevas) return;
    setVisto(true);
    void marcarNovedadesVistasAction();
  }

  const cerrar = () => setAbierto(false);
  const items = visto ? resumen.items.map((i) => ({ ...i, nueva: false })) : resumen.items;

  return (
    <div className="relative">
      <button
        onClick={() => setAbierto((v) => !v)}
        className={`flex items-center justify-center rounded-lg transition-colors ${
          conTexto ? "h-7 gap-1.5 px-2 text-xs font-medium hover:bg-bg-subtle" : tamanho === "md" ? "h-9 w-9" : "h-7 w-7"
        }`}
        style={{ color: conTexto ? "var(--text-secondary)" : "var(--text-muted)" }}
        aria-label={hayNuevas ? `Novedades (${resumen.nuevas} sin ver)` : "Novedades"}
        aria-expanded={abierto}
      >
        {/* O círculo fica preso ao ícone, não ao texto */}
        <span className="relative flex">
          <Bell className={tamanho === "md" ? "h-5 w-5" : "h-4 w-4"} />
          {hayNuevas && (
            <span
              className="absolute -right-1 -top-1 flex h-[15px] w-[15px] items-center justify-center rounded-full font-bold leading-none text-white"
              style={{
                backgroundColor: "var(--error)",
                // Anel na cor do fundo do header para o círculo se destacar do sino; fonte menor quando o número tem 2+ dígitos
                boxShadow: "0 0 0 1.5px var(--bg-surface)",
                fontSize: resumen.nuevas > 9 ? "7px" : "9px",
              }}
            >
              {resumen.nuevas > 99 ? "99+" : resumen.nuevas}
            </span>
          )}
        </span>
        {conTexto && "Novedades"}
      </button>

      <AnimatePresence>
        {abierto && (
          <>
            <div className="fixed inset-0 z-40" onClick={cerrar} />
            <motion.div
              variants={DROPDOWN} initial="initial" animate="animate" exit="exit"
              transition={FAST}
              className={`z-50 overflow-hidden rounded-xl border shadow-xl ${isMobile ? "fixed left-3 right-3 top-14" : "absolute right-0 top-9 w-96"}`}
              style={{ ...DROPDOWN_ORIGIN, backgroundColor: "var(--bg-elevated)", borderColor: "var(--border)" }}
            >
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Novedades</p>
                {hayNuevas && (
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {resumen.nuevas} sin ver
                  </span>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {items.length === 0 ? (
                  <p className="py-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>Aún no hay novedades.</p>
                ) : (
                  items.map((item) => <NovedadItem key={item.id} item={item} onNavigate={cerrar} />)
                )}
              </div>
              <div className="flex items-center justify-between px-4 py-2.5" style={{ borderTop: "1px solid var(--border)" }}>
                <button
                  type="button"
                  onClick={marcarVistas}
                  disabled={!hayNuevas}
                  className="text-xs font-semibold disabled:opacity-40"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Marcar todas como vistas
                </button>
                <Link href="/novedades" onClick={() => { marcarVistas(); cerrar(); }} className="text-xs font-semibold" style={{ color: "var(--accent)" }}>
                  Ver todo →
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
