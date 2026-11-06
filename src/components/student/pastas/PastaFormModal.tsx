"use client";

import { useState, useTransition } from "react";
import { Modal } from "@/components/ui/Modal";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { atualizarPastaAction, criarPastaAction } from "@/lib/actions/pastas";
import { DESCRICAO_MAX, NOME_MAX } from "@/lib/pastas";

export type ModoFormPasta =
  | { tipo: "criar"; paiId: string | null }
  | { tipo: "editar"; pastaId: string; nome: string; descricao: string | null };

interface PastaFormModalProps {
  open: boolean;
  onClose: () => void;
  modo: ModoFormPasta;
  // Chamado com o id da pasta criada (só no modo "criar")
  onCriada?: (id: string) => void;
}

const CAMPO = "w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--accent)]";
const ESTILO_CAMPO = { backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)" };

// O formulário só existe com o modal aberto: cada abertura começa com o estado limpo
function Formulario({ modo, onClose, onCriada }: Omit<PastaFormModalProps, "open">) {
  const editando = modo.tipo === "editar";
  const [nome, setNome] = useState(editando ? modo.nome : "");
  const [descricao, setDescricao] = useState(editando ? (modo.descricao ?? "") : "");
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    iniciar(async () => {
      const r = editando
        ? await atualizarPastaAction(modo.pastaId, { nome, descricao })
        : await criarPastaAction({ paiId: modo.paiId, nome, descricao });
      if (!r.ok) {
        setErro(r.erro);
        return;
      }
      if (!editando && r.id) onCriada?.(r.id);
      onClose();
    });
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4 p-6">
      <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
        {editando ? "Editar carpeta" : "Nueva carpeta"}
      </h2>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="pasta-nome" className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Nombre</label>
        <input
          id="pasta-nome" value={nome} onChange={(e) => setNome(e.target.value)}
          maxLength={NOME_MAX} autoFocus required placeholder="Ej.: Examen de anatomía"
          className={CAMPO} style={ESTILO_CAMPO}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="pasta-descricao" className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
          Descripción <span style={{ color: "var(--text-muted)" }}>(opcional)</span>
        </label>
        <textarea
          id="pasta-descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)}
          maxLength={DESCRICAO_MAX} rows={3} className={`${CAMPO} resize-none`} style={ESTILO_CAMPO}
        />
      </div>

      {erro && <p role="alert" className="text-xs" style={{ color: "var(--error)" }}>{erro}</p>}

      <div className="flex gap-3">
        <LoadingButton variant="secondary" onClick={onClose} disabled={pendente}>Cancelar</LoadingButton>
        <LoadingButton type="submit" loading={pendente} loadingText="Guardando…">
          {editando ? "Guardar" : "Crear carpeta"}
        </LoadingButton>
      </div>
    </form>
  );
}

export function PastaFormModal({ open, onClose, modo, onCriada }: PastaFormModalProps) {
  return (
    <Modal open={open} onClose={onClose} label={modo.tipo === "editar" ? "Editar carpeta" : "Nueva carpeta"}>
      <Formulario modo={modo} onClose={onClose} onCriada={onCriada} />
    </Modal>
  );
}
