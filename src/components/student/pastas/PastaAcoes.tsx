"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { PastaFormModal } from "./PastaFormModal";
import { excluirPastaAction } from "@/lib/actions/pastas";

interface PastaAcoesProps {
  pastaId: string;
  nome: string;
  descricao: string | null;
  // Só em pasta da raiz: permite mudar a profundidade
  niveis?: { atual: number; minimo: number };
  // "botoes": Editar e Eliminar à vista (página da pasta); "menu": três pontos sobre o card
  variante?: "botoes" | "menu";
  // Para onde voltar depois de excluir a pasta que está aberta (no card da lista a página só atualiza)
  voltarPara?: string;
}

const BOTAO = "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80";
const ITEM_MENU = "flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--bg-elevated)]";

export function PastaAcoes({ pastaId, nome, descricao, niveis, variante = "botoes", voltarPara }: PastaAcoesProps) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();
  const raiz = useRef<HTMLDivElement | null>(null);

  // Fecha o menu ao clicar fora ou apertar Esc
  useEffect(() => {
    if (!menuAberto) return;
    const fora = (e: MouseEvent) => { if (!raiz.current?.contains(e.target as Node)) setMenuAberto(false); };
    const tecla = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuAberto(false); };
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", tecla);
    };
  }, [menuAberto]);

  function excluir() {
    iniciar(async () => {
      const r = await excluirPastaAction(pastaId);
      if (!r.ok) {
        setErro(r.erro);
        setExcluindo(false);
        return;
      }
      setExcluindo(false);
      if (voltarPara) router.push(voltarPara);
    });
  }

  function abrir(acao: "editar" | "excluir") {
    setMenuAberto(false);
    if (acao === "editar") setEditando(true); else setExcluindo(true);
  }

  return (
    <>
      {variante === "botoes" ? (
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => abrir("editar")} className={BOTAO}
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Editar
          </button>
          <button type="button" onClick={() => abrir("excluir")} className={BOTAO}
            style={{ border: "1px solid var(--border)", color: "var(--error)" }}>
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Eliminar
          </button>
        </div>
      ) : (
        <div ref={raiz} className="relative">
          <button
            type="button" onClick={() => setMenuAberto((a) => !a)} aria-haspopup="menu" aria-expanded={menuAberto}
            aria-label={`Opciones de la carpeta ${nome}`}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white transition-colors hover:bg-black/60"
            style={{ backgroundColor: "var(--capa-overlay)" }}
          >
            <MoreVertical className="h-4 w-4" aria-hidden="true" />
          </button>
          {menuAberto && (
            <div
              role="menu"
              className="absolute right-0 top-9 z-30 w-40 overflow-hidden rounded-lg py-1 shadow-lg"
              style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}
            >
              <button type="button" role="menuitem" onClick={() => abrir("editar")} className={ITEM_MENU} style={{ color: "var(--text-primary)" }}>
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Editar
              </button>
              <button type="button" role="menuitem" onClick={() => abrir("excluir")} className={ITEM_MENU} style={{ color: "var(--error)" }}>
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Eliminar
              </button>
            </div>
          )}
        </div>
      )}
      {erro && <p role="alert" className="mt-2 text-xs" style={{ color: "var(--error)" }}>{erro}</p>}

      <PastaFormModal
        open={editando} onClose={() => setEditando(false)}
        modo={{ tipo: "editar", pastaId, nome, descricao, niveis }}
      />
      <ConfirmModal
        open={excluindo}
        message={`¿Eliminar la carpeta "${nome}"? Se eliminarán también sus subcarpetas y los temas guardados en ellas. Los temas en sí no se borran.`}
        onConfirm={excluir} onCancel={() => setExcluindo(false)} isPending={pendente}
      />
    </>
  );
}
