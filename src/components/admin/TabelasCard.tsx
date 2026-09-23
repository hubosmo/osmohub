"use client";

import { useTransition, useRef, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Columns, Check, Pencil } from "lucide-react";
import { SectionToggle } from "@/components/admin/SectionToggle";
import {
  criarTabelaContent,
  deletarTabelaContent,
  adicionarLinhaContent,
  deletarLinhaContent,
  adicionarColunaTabela,
  removerColunaTabela,
  atualizarTituloTabela,
} from "@/lib/actions/content";

type TablaLinha = { id: string; categoria: string; conteudo: string; valores_extra: unknown };
type Tabela = {
  id: string;
  titulo: string;
  tipo: string;
  cabecalhos: unknown;
  linhas: TablaLinha[];
};

type Props = {
  topicoId: string;
  tabelas_ativo: boolean;
  tabelas: Tabela[];
};

function useAction(successMsg: string) {
  const [isPending, startTransition] = useTransition();
  function run(action: () => Promise<void>) {
    startTransition(async () => {
      try {
        await action();
        toast.success(successMsg);
      } catch {
        toast.error("Error al guardar. Intenta de nuevo.");
      }
    });
  }
  return { isPending, run };
}

export function TabelasCard({ topicoId, tabelas_ativo, tabelas }: Props) {
  const { run: runCreate } = useAction("Tabla creada");
  const createRef = useRef<HTMLFormElement>(null);

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const form = e.currentTarget;
    runCreate(async () => {
      await criarTabelaContent(topicoId, fd);
      form.reset();
    });
  }

  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#00A6FF22" }}>
          <span style={{ color: "#00A6FF" }}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M3 15h18M9 3v18" />
            </svg>
          </span>
        </div>
        <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
          Tablas de resumen ({tabelas.length})
        </h3>
        <SectionToggle topicoId={topicoId} section="tabelas_ativo" initialValue={tabelas_ativo} hasContent={tabelas.length > 0} />
      </div>

      {/* Create table form — top */}
      <form ref={createRef} onSubmit={handleCreate} className="flex gap-2 items-end mb-4 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex-1">
          <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Nueva tabla *</label>
          <input name="titulo" required placeholder="ej. Puntos clave sobre el fémur"
            className="w-full h-9 px-3 rounded-lg text-sm outline-none"
            style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
        </div>
        <div className="w-28">
          <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Tipo</label>
          <select name="tipo"
            className="w-full h-9 px-3 rounded-lg text-sm outline-none"
            style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
            <option value="resumen">Resumen</option>
            <option value="estudio">Estudio</option>
          </select>
        </div>
        <button type="submit"
          className="h-9 px-3 rounded-lg text-sm font-medium text-white flex items-center gap-1.5 shrink-0"
          style={{ backgroundColor: "var(--accent)" }}>
          <Plus className="h-4 w-4" /> Tabla
        </button>
      </form>

      {tabelas.length === 0 && (
        <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>Sin tablas aún</p>
      )}

      {tabelas.map((tabela) => (
        <TabelaBlock key={tabela.id} tabela={tabela} topicoId={topicoId} />
      ))}
    </div>
  );
}

function TabelaBlock({ tabela, topicoId }: { tabela: Tabela; topicoId: string }) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(tabela.titulo);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const extraHeaders: string[] = Array.isArray(tabela.cabecalhos) ? (tabela.cabecalhos as string[]) : [];
  const gridCols = `repeat(${2 + extraHeaders.length}, 1fr) 28px`;
  const gridColsForm = `repeat(${2 + extraHeaders.length}, 1fr) auto`;

  const { run: runDelete } = useAction("Tabla eliminada");
  const { run: runAddRow } = useAction("¡Fila agregada!");
  const { run: runDeleteRow } = useAction("Fila eliminada");
  const { run: runAddCol } = useAction("Columna agregada");
  const { run: runRemoveCol } = useAction("Columna eliminada");
  const { run: runSaveTitle } = useAction("¡Título guardado!");

  function handleSaveTitle() {
    if (!titleValue.trim() || titleValue === tabela.titulo) { setEditingTitle(false); return; }
    const fd = new FormData();
    fd.set("titulo", titleValue.trim());
    runSaveTitle(async () => {
      await atualizarTituloTabela(tabela.id, topicoId, fd);
      setEditingTitle(false);
    });
  }

  function handleAddRow(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const form = e.currentTarget;
    runAddRow(async () => {
      await adicionarLinhaContent(tabela.id, topicoId, fd);
      form.reset();
    });
  }

  function handleAddCol(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const form = e.currentTarget;
    runAddCol(async () => {
      await adicionarColunaTabela(tabela.id, topicoId, fd);
      form.reset();
    });
  }

  return (
    <div className="mb-4 rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>

      {/* Table header */}
      <div className="flex items-center gap-2 flex-wrap px-4 py-2.5"
        style={{ backgroundColor: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>

        {/* Editable title */}
        {editingTitle ? (
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <input
              ref={titleInputRef}
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSaveTitle(); if (e.key === "Escape") { setTitleValue(tabela.titulo); setEditingTitle(false); } }}
              autoFocus
              className="flex-1 min-w-0 h-7 px-2 rounded text-sm outline-none"
              style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--accent)", color: "var(--text-primary)" }}
            />
            <button onClick={handleSaveTitle} className="h-7 w-7 flex items-center justify-center rounded shrink-0"
              style={{ backgroundColor: "var(--accent)" }}>
              <Check className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setEditingTitle(true); setTimeout(() => titleInputRef.current?.select(), 50); }}
            className="flex items-center gap-1.5 group text-sm font-medium text-left hover:opacity-80 transition-opacity"
            style={{ color: "var(--text-primary)" }}
            title="Clic para editar el título"
          >
            {titleValue}
            <Pencil className="h-3 w-3 opacity-40 group-hover:opacity-80 transition-opacity shrink-0" style={{ color: "var(--text-muted)" }} />
          </button>
        )}

        <span className="text-xs px-2 py-0.5 rounded-full shrink-0"
          style={{ backgroundColor: "var(--bg-base)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
          {tabela.tipo}
        </span>

        {/* Extra column badges */}
        {extraHeaders.map((col, ci) => (
          <span key={ci} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full shrink-0"
            style={{ backgroundColor: "color-mix(in srgb, var(--accent) 12%, transparent)", color: "var(--accent)", border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)" }}>
            {col}
            <button
              type="button"
              onClick={() => runRemoveCol(() => removerColunaTabela(tabela.id, topicoId, ci))}
              className="leading-none opacity-60 hover:opacity-100 text-xs">×
            </button>
          </span>
        ))}

        <div className="flex items-center gap-1 ml-auto shrink-0">
          {/* Add column */}
          <form onSubmit={handleAddCol} className="flex items-center gap-1">
            <input name="header" placeholder="+ columna" required
              className="h-6 w-20 px-2 rounded text-xs outline-none"
              style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            <button type="submit" className="h-6 px-2 rounded text-xs flex items-center gap-0.5"
              style={{ color: "var(--accent)", border: "1px solid color-mix(in srgb, var(--accent) 40%, transparent)" }}>
              <Columns className="h-3 w-3" /> Col
            </button>
          </form>
          {/* Delete table */}
          <button type="button"
            onClick={() => runDelete(() => deletarTabelaContent(tabela.id, topicoId))}
            className="h-6 w-6 flex items-center justify-center rounded ml-1"
            style={{ color: "var(--error)" }}>
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Column header labels */}
      <div className="grid gap-2 px-4 py-1.5"
        style={{ gridTemplateColumns: gridCols, backgroundColor: "var(--bg-base)", borderBottom: "1px solid var(--border)" }}>
        <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Categoría</p>
        <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Contenido</p>
        {extraHeaders.map((h) => (
          <p key={h} className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{h}</p>
        ))}
        <span />
      </div>

      {/* Rows */}
      <div style={{ backgroundColor: "var(--bg-surface)" }}>
        {tabela.linhas.map((linha, li) => {
          const extraVals: string[] = Array.isArray(linha.valores_extra) ? (linha.valores_extra as string[]) : [];
          return (
            <div key={linha.id} className="grid gap-2 items-start px-4 py-2.5"
              style={{
                gridTemplateColumns: gridCols,
                borderBottom: li < tabela.linhas.length - 1 ? "1px solid var(--border)" : "none",
              }}>
              <p className="text-xs font-semibold pt-0.5" style={{ color: "var(--text-primary)" }}>{linha.categoria}</p>
              <p className="text-xs" style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>{linha.conteudo}</p>
              {extraHeaders.map((_, ci) => (
                <p key={ci} className="text-xs" style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>{extraVals[ci] ?? ""}</p>
              ))}
              <button type="button"
                onClick={() => runDeleteRow(() => deletarLinhaContent(linha.id, topicoId))}
                className="h-6 w-6 flex items-center justify-center rounded"
                style={{ color: "var(--text-muted)" }}>
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          );
        })}

        {tabela.linhas.length === 0 && (
          <p className="text-xs text-center py-3" style={{ color: "var(--text-muted)" }}>Sin filas aún</p>
        )}

        {/* Add row */}
        <form onSubmit={handleAddRow}
          className="grid gap-2 items-end p-3"
          style={{ gridTemplateColumns: gridColsForm, borderTop: "1px solid var(--border)", backgroundColor: "var(--bg-elevated)" }}>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Categoría *</label>
            <input name="categoria" required placeholder="ej. Extremo proximal"
              className="w-full h-8 px-2.5 rounded text-xs outline-none"
              style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Contenido *</label>
            <input name="conteudo" required placeholder="..."
              className="w-full h-8 px-2.5 rounded text-xs outline-none"
              style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          </div>
          {extraHeaders.map((col, ci) => (
            <div key={ci}>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>{col}</label>
              <input name={`extra_${ci}`} placeholder="..."
                className="w-full h-8 px-2.5 rounded text-xs outline-none"
                style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
          ))}
          <button type="submit"
            className="h-8 px-3 rounded text-xs font-medium text-white flex items-center gap-1 shrink-0 self-end"
            style={{ backgroundColor: "var(--accent)" }}>
            <Plus className="h-3.5 w-3.5" /> Fila
          </button>
        </form>
      </div>
    </div>
  );
}
