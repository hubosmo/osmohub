"use client";

import { useState } from "react";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { cargarMasNovedades } from "@/lib/actions/novedades";
import type { NovedadItem as Item } from "@/lib/novedades";
import { NovedadItem } from "./NovedadItem";

// Lista de /novedades: mostra a primeira página vinda do servidor e carrega as seguintes com "Ver más".
export function NovedadesLista({ inicial, total }: { inicial: Item[]; total: number }) {
  const [items, setItems] = useState(inicial);
  const [totalActual, setTotalActual] = useState(total);
  const [cargando, setCargando] = useState(false);

  async function verMas() {
    setCargando(true);
    try {
      const pagina = await cargarMasNovedades(items.length);
      // Ignora itens já mostrados (uma novedad nova pode ter deslocado a lista)
      setItems((prev) => [...prev, ...pagina.items.filter((n) => !prev.some((p) => p.id === n.id))]);
      setTotalActual(pagina.total);
    } finally {
      setCargando(false);
    }
  }

  if (items.length === 0) {
    return <p className="py-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>Aún no hay novedades.</p>;
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl" style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-surface)" }}>
        {items.map((item) => <NovedadItem key={item.id} item={item} />)}
      </div>

      <div className="mt-4 flex flex-col items-center gap-3">
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Mostrando {Math.min(items.length, totalActual)} de {totalActual}
        </p>
        {items.length < totalActual && (
          <LoadingButton variant="secondary" loading={cargando} loadingText="Cargando…" onClick={verMas}>
            Ver más
          </LoadingButton>
        )}
      </div>
    </>
  );
}
