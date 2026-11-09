"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { PastaFormModal } from "./PastaFormModal";

interface NuevaPastaCardProps {
  paiId: string | null;
  variante: "alta" | "horizontal";
}

export function NuevaPastaCard({ paiId, variante }: NuevaPastaCardProps) {
  const [aberto, setAberto] = useState(false);
  const alta = variante === "alta";

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className={`flex cursor-pointer items-center justify-center gap-2 text-sm font-semibold transition-colors hover:border-[var(--accent)] ${alta ? "aspect-[3/4] flex-col rounded-2xl" : "min-h-32 rounded-xl"}`}
        style={{ border: "2px dashed var(--border)", color: "var(--text-secondary)", backgroundColor: "transparent" }}
      >
        <Plus className="h-6 w-6" style={{ color: "var(--accent)" }} aria-hidden="true" />
        Nueva carpeta
      </button>
      <PastaFormModal open={aberto} onClose={() => setAberto(false)} modo={{ tipo: "criar", paiId }} />
    </>
  );
}
