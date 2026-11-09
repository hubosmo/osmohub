"use client";

import { useState } from "react";
import Link from "next/link";
import { Box, Link2, Search, Unlink } from "lucide-react";
import { vincularModelo3dAoTopico, desvincularModelo3dDoTopico } from "@/lib/actions/content-modelos3d";

type ModeloResumido = { id: string; titulo: string; publicado: boolean };

interface Props {
  topicoId: string;
  vinculados: ModeloResumido[];
  todos: ModeloResumido[];
}

// Vincula modelos 3D da biblioteca ao tópico (mesmo padrão do QuizLinker)
export function Modelo3DLinker({ topicoId, vinculados, todos }: Props) {
  const [consulta, setConsulta] = useState("");
  const vinculadosIds = new Set(vinculados.map((m) => m.id));
  const disponiveis = todos.filter((m) => !vinculadosIds.has(m.id) && m.titulo.toLowerCase().includes(consulta.toLowerCase()));
  const vincular = vincularModelo3dAoTopico.bind(null, topicoId);

  return (
    <div className="flex flex-col gap-3">
      {vinculados.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Vinculados</p>
          {vinculados.map((m) => (
            <div
              key={m.id} className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ border: "1px solid var(--accent)", backgroundColor: "color-mix(in srgb, var(--accent) 8%, var(--bg-base))" }}
            >
              <Box className="h-4 w-4 shrink-0" style={{ color: "var(--accent)" }} aria-hidden="true" />
              <Link href={`/admin/modelos-3d/${m.id}`} className="flex-1 truncate text-sm hover:underline" style={{ color: "var(--text-primary)" }}>
                {m.titulo}
              </Link>
              {!m.publicado && <span className="shrink-0 text-[10px]" style={{ color: "var(--text-muted)" }}>Borrador (no se muestra)</span>}
              <form action={desvincularModelo3dDoTopico.bind(null, topicoId, m.id)}>
                <button type="submit" title="Desvincular" aria-label={`Desvincular ${m.titulo}`} className="h-6 w-6 flex items-center justify-center rounded shrink-0" style={{ color: "var(--error)" }}>
                  <Unlink className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Vincular modelo 3D existente</p>
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} aria-hidden="true" />
          <input
            value={consulta} onChange={(e) => setConsulta(e.target.value)} placeholder="Buscar modelo..." aria-label="Buscar modelo 3D"
            className="w-full h-8 pl-8 pr-3 rounded-lg text-xs outline-none"
            style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          />
        </div>
        {disponiveis.length === 0 ? (
          <p className="text-xs py-2 text-center" style={{ color: "var(--text-muted)" }}>
            {consulta ? "Sin resultados" : todos.length === 0 ? "No hay modelos con archivo todavía." : "Todos vinculados"}
          </p>
        ) : (
          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
            {disponiveis.slice(0, 20).map((m) => (
              <form key={m.id} action={vincular}>
                <input type="hidden" name="modeloId" value={m.id} />
                <button
                  type="submit" className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors"
                  style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-base)" }}
                >
                  <Link2 className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--text-muted)" }} aria-hidden="true" />
                  <span className="flex-1 text-xs truncate" style={{ color: "var(--text-primary)" }}>{m.titulo}</span>
                  {!m.publicado && <span className="text-[10px] shrink-0" style={{ color: "var(--text-muted)" }}>Borrador</span>}
                </button>
              </form>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
