"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Bookmark, Check, FolderOpen, Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { criarPastaAction, salvarTopicoNaPastaAction } from "@/lib/actions/pastas";
import { NOME_MAX, ordenarEmArvore } from "@/lib/pastas";

export type PastaParaEscolher = { id: string; pai_id: string | null; nome: string };

interface SalvarTopicoButtonProps {
  topicoId: string;
  pastas: PastaParaEscolher[];
  idsIniciais: string[];
}

export function SalvarTopicoButton({ topicoId, pastas, idsIniciais }: SalvarTopicoButtonProps) {
  const [aberto, setAberto] = useState(false);
  const [criadas, setCriadas] = useState<PastaParaEscolher[]>([]);
  const [salvas, setSalvas] = useState<Set<string>>(() => new Set(idsIniciais));
  const [ocupadas, setOcupadas] = useState<Set<string>>(() => new Set());
  const [novoNome, setNovoNome] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [criando, iniciarCriacao] = useTransition();

  const todas = [...pastas, ...criadas.filter((c) => !pastas.some((p) => p.id === c.id))];
  const arvore = ordenarEmArvore(todas);

  function marcarOcupada(id: string, ocupada: boolean) {
    setOcupadas((atual) => {
      const novo = new Set(atual);
      if (ocupada) novo.add(id); else novo.delete(id);
      return novo;
    });
  }

  function alternar(pastaId: string) {
    const salvar = !salvas.has(pastaId);
    setErro(null);
    marcarOcupada(pastaId, true);
    setSalvas((atual) => {
      const novo = new Set(atual);
      if (salvar) novo.add(pastaId); else novo.delete(pastaId);
      return novo;
    });
    void salvarTopicoNaPastaAction(pastaId, topicoId, salvar).then((r) => {
      marcarOcupada(pastaId, false);
      if (r.ok) return;
      setErro(r.erro);
      setSalvas((atual) => {
        const novo = new Set(atual);
        if (salvar) novo.delete(pastaId); else novo.add(pastaId);
        return novo;
      });
    });
  }

  function criarEGuardar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    iniciarCriacao(async () => {
      const nome = novoNome.trim();
      const criada = await criarPastaAction({ paiId: null, nome });
      if (!criada.ok || !criada.id) {
        setErro(criada.ok ? "No se pudo crear la carpeta." : criada.erro);
        return;
      }
      const id = criada.id;
      setCriadas((atual) => [...atual, { id, pai_id: null, nome }]);
      setNovoNome("");
      const guardada = await salvarTopicoNaPastaAction(id, topicoId, true);
      if (guardada.ok) setSalvas((atual) => new Set(atual).add(id));
      else setErro(guardada.erro);
    });
  }

  const guardado = salvas.size > 0;

  return (
    <>
      <button
        type="button" onClick={() => setAberto(true)}
        className="shrink-0 mt-1 cursor-pointer transition-colors hover:opacity-80"
        aria-label={guardado ? "Cambiar las carpetas de este tema" : "Guardar en una carpeta de Mi plan"}
        style={{ color: guardado ? "var(--accent)" : "var(--text-muted)" }}
      >
        <Bookmark className="h-5 w-5" fill={guardado ? "currentColor" : "none"} />
      </button>

      <Modal open={aberto} onClose={() => setAberto(false)} label="Guardar en Mi plan">
        <div className="flex flex-col gap-4 p-6">
          <div>
            <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Guardar en Mi plan</h2>
            <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>Puedes guardar este tema en varias carpetas.</p>
          </div>

          {arvore.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Aún no tienes carpetas. Crea la primera:</p>
          ) : (
            <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto">
              {arvore.map((p) => {
                const marcada = salvas.has(p.id);
                return (
                  <li key={p.id} style={{ paddingLeft: `${p.profundidade * 20}px` }}>
                    <button
                      type="button" role="checkbox" aria-checked={marcada} disabled={ocupadas.has(p.id)}
                      onClick={() => alternar(p.id)}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--bg-elevated)] disabled:opacity-60"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
                        style={{ border: `1.5px solid ${marcada ? "var(--accent)" : "var(--border)"}`, backgroundColor: marcada ? "var(--accent)" : "transparent" }}
                      >
                        {marcada && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} aria-hidden="true" />}
                      </span>
                      <FolderOpen className="h-4 w-4 shrink-0" style={{ color: "var(--text-muted)" }} aria-hidden="true" />
                      <span className="truncate">{p.nome}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <form onSubmit={criarEGuardar} className="flex gap-2">
            <input
              id="nueva-carpeta-rapida" value={novoNome} onChange={(e) => setNovoNome(e.target.value)}
              maxLength={NOME_MAX} placeholder="Nueva carpeta" aria-label="Nombre de la nueva carpeta"
              className="min-w-0 flex-1 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
              style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            />
            <LoadingButton type="submit" loading={criando} disabled={!novoNome.trim()} className="w-auto px-4 py-2" aria-label="Crear carpeta y guardar el tema">
              <Plus className="h-4 w-4" aria-hidden="true" />
            </LoadingButton>
          </form>

          {erro && <p role="alert" className="text-xs" style={{ color: "var(--error)" }}>{erro}</p>}

          <div className="flex items-center justify-between gap-3">
            <Link href="/plan-de-estudios" className="text-xs font-semibold hover:underline" style={{ color: "var(--accent)" }}>
              Ir a Mi plan
            </Link>
            <LoadingButton className="w-auto px-6 py-2" onClick={() => setAberto(false)}>Listo</LoadingButton>
          </div>
        </div>
      </Modal>
    </>
  );
}
