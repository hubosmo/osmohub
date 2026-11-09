"use client";

import { useEffect, useState, useTransition } from "react";
import { Check, Loader2, Plus, Search } from "lucide-react";
import { buscarTopicos, type TopicResult } from "@/lib/actions/search";
import { salvarTopicoNaPastaAction } from "@/lib/actions/pastas";

interface BuscadorTemasPastaProps {
  pastaId: string;
  // Ids dos temas que já estão nesta pasta
  idsNaPasta: string[];
}

// Busca de temas dentro da pasta do último nível (onde ficam os conteúdos): agrega o tema direto na pasta
export function BuscadorTemasPasta({ pastaId, idsNaPasta }: BuscadorTemasPastaProps) {
  const [consulta, setConsulta] = useState("");
  const [resultados, setResultados] = useState<TopicResult[]>([]);
  const [buscou, setBuscou] = useState(false);
  const [buscando, iniciarBusca] = useTransition();
  const [agregados, setAgregados] = useState<Set<string>>(() => new Set(idsNaPasta));
  const [ocupados, setOcupados] = useState<Set<string>>(() => new Set());
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (consulta.trim().length < 2) return;
    const espera = setTimeout(() => {
      iniciarBusca(async () => {
        setResultados(await buscarTopicos(consulta));
        setBuscou(true);
      });
    }, 280);
    return () => clearTimeout(espera);
  }, [consulta]);

  function mudarConsulta(valor: string) {
    setConsulta(valor);
    if (valor.trim().length < 2) {
      setResultados([]);
      setBuscou(false);
    }
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

  const mostrando = consulta.trim().length >= 2;

  return (
    <div className="mb-6">
      <div className="relative">
        <input
          id="buscador-temas-pasta" type="search" value={consulta} onChange={(e) => mudarConsulta(e.target.value)}
          placeholder="Busca un tema para agregarlo a esta carpeta…" aria-label="Buscar temas para agregar a esta carpeta"
          className="w-full rounded-lg py-2.5 pl-3 pr-9 text-sm outline-none transition-colors focus:border-[var(--accent)]"
          style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
        />
        {buscando ? (
          <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin" style={{ color: "var(--text-muted)" }} aria-hidden="true" />
        ) : (
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-muted)" }} aria-hidden="true" />
        )}
      </div>

      {erro && <p role="alert" className="mt-2 text-xs" style={{ color: "var(--error)" }}>{erro}</p>}

      {mostrando && buscou && resultados.length === 0 && !buscando && (
        <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>Sin resultados para &quot;{consulta.trim()}&quot;.</p>
      )}

      {mostrando && resultados.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
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
        </ul>
      )}
    </div>
  );
}
