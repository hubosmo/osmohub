"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Plus, Search, X } from "lucide-react";
import { buscarTopicosPaginado, type TopicResult } from "@/lib/actions/search";
import { salvarTopicoNaPastaAction } from "@/lib/actions/pastas";

interface BuscadorTemasPastaProps {
  pastaId: string;
  // Ids dos temas que já estão nesta pasta
  idsNaPasta: string[];
}

// Busca de temas dentro da pasta do último nível (onde ficam os conteúdos): agrega o tema direto na pasta.
// A lista tem altura máxima com scroll e carrega mais resultados ao chegar no fim, então não há limite de busca.
export function BuscadorTemasPasta({ pastaId, idsNaPasta }: BuscadorTemasPastaProps) {
  const [consulta, setConsulta] = useState("");
  const [resultados, setResultados] = useState<TopicResult[]>([]);
  const [total, setTotal] = useState(0);
  const [buscou, setBuscou] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [agregados, setAgregados] = useState<Set<string>>(() => new Set(idsNaPasta));
  const [ocupados, setOcupados] = useState<Set<string>>(() => new Set());
  const [erro, setErro] = useState<string | null>(null);

  const consultaVigente = useRef("");
  const carregandoMais = useRef(false);
  const fimDaLista = useRef<HTMLLIElement | null>(null);
  const termo = consulta.trim();
  const buscando = termo.length >= 2;
  const temMais = resultados.length < total;

  // Nova busca (com espera): descarta a resposta de uma busca anterior que chegue atrasada
  useEffect(() => {
    if (termo.length < 2) return;
    consultaVigente.current = termo;
    const espera = setTimeout(async () => {
      setCarregando(true);
      const pagina = await buscarTopicosPaginado(termo, 0);
      if (consultaVigente.current !== termo) return;
      setResultados(pagina.itens);
      setTotal(pagina.total);
      setBuscou(true);
      setCarregando(false);
    }, 280);
    return () => clearTimeout(espera);
  }, [termo]);

  async function carregarMais() {
    if (carregandoMais.current || !temMais) return;
    carregandoMais.current = true;
    setCarregando(true);
    const buscaDe = consultaVigente.current;
    const pagina = await buscarTopicosPaginado(buscaDe, resultados.length);
    carregandoMais.current = false;
    if (consultaVigente.current !== buscaDe) return;
    setResultados((atuais) => {
      const vistos = new Set(atuais.map((r) => r.id));
      return [...atuais, ...pagina.itens.filter((r) => !vistos.has(r.id))];
    });
    setTotal(pagina.total);
    setCarregando(false);
  }

  // Ao chegar no fim da lista, pede a próxima página
  useEffect(() => {
    const alvo = fimDaLista.current;
    if (!alvo) return;
    const observador = new IntersectionObserver((entradas) => {
      if (entradas.some((e) => e.isIntersecting)) void carregarMais();
    }, { rootMargin: "80px" });
    observador.observe(alvo);
    return () => observador.disconnect();
  });

  function mudarConsulta(valor: string) {
    setConsulta(valor);
    if (valor.trim().length < 2) limpar(valor);
  }

  function limpar(valor = "") {
    consultaVigente.current = "";
    setConsulta(valor);
    setResultados([]);
    setTotal(0);
    setBuscou(false);
    setCarregando(false);
  }

  function alternar(topicoId: string) {
    const agregar = !agregados.has(topicoId);
    setErro(null);
    setOcupados((a) => new Set(a).add(topicoId));
    setAgregados((a) => {
      const novo = new Set(a);
      if (agregar) novo.add(topicoId); else novo.delete(topicoId);
      return novo;
    });
    void salvarTopicoNaPastaAction(pastaId, topicoId, agregar).then((r) => {
      setOcupados((a) => {
        const novo = new Set(a);
        novo.delete(topicoId);
        return novo;
      });
      if (r.ok) return;
      setErro(r.erro);
      setAgregados((a) => {
        const novo = new Set(a);
        if (agregar) novo.delete(topicoId); else novo.add(topicoId);
        return novo;
      });
    });
  }

  return (
    <div className="mb-6">
      <div className="relative">
        <input
          id="buscador-temas-pasta" type="text" value={consulta} onChange={(e) => mudarConsulta(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Escape") limpar(); }}
          placeholder="Busca un tema para agregarlo a esta carpeta…" aria-label="Buscar temas para agregar a esta carpeta"
          autoComplete="off"
          className="w-full rounded-lg py-2.5 pl-3 pr-16 text-sm outline-none transition-colors focus:border-[var(--accent)]"
          style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
        />
        {consulta && (
          <button
            type="button" onClick={() => limpar()} aria-label="Limpiar búsqueda"
            className="absolute right-9 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-[var(--bg-elevated)]"
            style={{ color: "var(--text-muted)" }}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        {carregando && resultados.length === 0 ? (
          <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin" style={{ color: "var(--text-muted)" }} aria-hidden="true" />
        ) : (
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-muted)" }} aria-hidden="true" />
        )}
      </div>

      {erro && <p role="alert" className="mt-2 text-xs" style={{ color: "var(--error)" }}>{erro}</p>}

      {buscando && buscou && total === 0 && !carregando && (
        <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>Sin resultados para &quot;{termo}&quot;.</p>
      )}

      {buscando && resultados.length > 0 && (
        <>
          <p className="mt-3 text-xs" style={{ color: "var(--text-muted)" }} aria-live="polite">
            {total} {total === 1 ? "tema encontrado" : "temas encontrados"}
          </p>
          <ul className="mt-2 flex max-h-96 flex-col gap-2 overflow-y-auto pr-1">
            {resultados.map((r) => {
              const agregado = agregados.has(r.id);
              return (
                <li key={r.id} className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-surface)" }}>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{r.titulo}</p>
                    <p className="truncate text-xs" style={{ color: "var(--text-muted)" }}>
                      {r.cursoNome} › {r.disciplinaNome} › {r.areaNome}
                    </p>
                  </div>
                  <button
                    type="button" onClick={() => alternar(r.id)} disabled={ocupados.has(r.id)}
                    aria-pressed={agregado}
                    className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80 disabled:opacity-60"
                    style={agregado
                      ? { border: "1px solid var(--success)", color: "var(--success)" }
                      : { backgroundColor: "var(--accent)", color: "white" }}
                  >
                    {agregado ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Plus className="h-3.5 w-3.5" aria-hidden="true" />}
                    {agregado ? "Agregado" : "Agregar"}
                  </button>
                </li>
              );
            })}
            {/* Marcador de fim da lista: ao aparecer, carrega a próxima página */}
            {temMais && (
              <li ref={fimDaLista} className="flex items-center justify-center gap-2 py-2 text-xs" style={{ color: "var(--text-muted)" }}>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Cargando más…
              </li>
            )}
          </ul>
        </>
      )}
    </div>
  );
}
