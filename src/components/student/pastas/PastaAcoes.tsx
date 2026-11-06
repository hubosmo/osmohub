"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { PastaFormModal } from "./PastaFormModal";
import { excluirPastaAction } from "@/lib/actions/pastas";

interface PastaAcoesProps {
  pastaId: string;
  nome: string;
  descricao: string | null;
  // Para onde voltar depois de excluir (a pasta atual deixa de existir)
  voltarPara: string;
}

const BOTAO = "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80";

export function PastaAcoes({ pastaId, nome, descricao, voltarPara }: PastaAcoesProps) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  function excluir() {
    iniciar(async () => {
      const r = await excluirPastaAction(pastaId);
      if (!r.ok) {
        setErro(r.erro);
        setExcluindo(false);
        return;
      }
      router.push(voltarPara);
    });
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setEditando(true)} className={BOTAO}
          style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Editar
        </button>
        <button type="button" onClick={() => setExcluindo(true)} className={BOTAO}
          style={{ border: "1px solid var(--border)", color: "var(--error)" }}>
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Eliminar
        </button>
      </div>
      {erro && <p role="alert" className="mt-2 text-xs" style={{ color: "var(--error)" }}>{erro}</p>}

      <PastaFormModal
        open={editando} onClose={() => setEditando(false)}
        modo={{ tipo: "editar", pastaId, nome, descricao }}
      />
      <ConfirmModal
        open={excluindo}
        message={`¿Eliminar la carpeta "${nome}"? Se eliminarán también sus subcarpetas y los temas guardados en ellas. Los temas en sí no se borran.`}
        onConfirm={excluir} onCancel={() => setExcluindo(false)} isPending={pendente}
      />
    </>
  );
}
