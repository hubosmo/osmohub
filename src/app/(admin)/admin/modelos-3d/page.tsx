import Link from "next/link";
import { redirect } from "next/navigation";
import { Box, Plus } from "lucide-react";
import { listarModelos3d } from "@/lib/db/modelos3d";
import { criarModelo3d } from "@/lib/actions/content-modelos3d";
import { formatarTamanho } from "@/lib/modelos3d";

export default async function Modelos3dAdminPage() {
  const modelos = await listarModelos3d();

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Modelos 3D</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            Biblioteca de modelos para el atlas 3D. Cada modelo se puede vincular a varios temas.
          </p>
        </div>
        <form action={async (fd) => {
          "use server";
          const id = await criarModelo3d(fd);
          redirect(`/admin/modelos-3d/${id}`);
        }}>
          <input type="hidden" name="titulo" value="Nuevo modelo 3D" />
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: "var(--accent)" }}
          >
            <Plus className="h-4 w-4" />
            Nuevo
          </button>
        </form>
      </div>

      {modelos.length === 0 ? (
        <div
          className="rounded-xl p-12 flex flex-col items-center gap-3 text-center"
          style={{ border: "1px dashed var(--border)", backgroundColor: "var(--bg-surface)" }}
        >
          <Box className="h-10 w-10" style={{ color: "var(--text-muted)", opacity: 0.4 }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Ningún modelo 3D cargado aún.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {modelos.map((m) => (
            <Link
              key={m.id}
              href={`/admin/modelos-3d/${m.id}`}
              className="flex items-center gap-4 px-4 py-3 rounded-xl transition-colors"
              style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-surface)" }}
            >
              <Box className="h-5 w-5 shrink-0" style={{ color: "var(--accent)" }} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{m.titulo}</p>
                <p className="truncate text-xs" style={{ color: "var(--text-muted)" }}>
                  {m.arquivo_path ? formatarTamanho(m.tamanho_bytes ?? 0) : "Sin archivo"}
                  {m.licenca ? ` · ${m.licenca}` : ""}
                  {` · ${m._count.pontos} ${m._count.pontos === 1 ? "punto" : "puntos"}`}
                  {` · ${m._count.topicos} ${m._count.topicos === 1 ? "tema" : "temas"}`}
                </p>
              </div>
              <span
                className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                style={{
                  border: `1px solid ${m.publicado ? "var(--success)" : "var(--border)"}`,
                  color: m.publicado ? "var(--success)" : "var(--text-muted)",
                }}
              >
                {m.publicado ? "Publicado" : "Borrador"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
