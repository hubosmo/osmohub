import { Megaphone, Trash2 } from "lucide-react";
import { listarNovedadesAdmin, listarTopicosParaNovedad } from "@/lib/db/novedades";
import { criarNovedad, eliminarNovedad } from "@/lib/actions/content-novedades";
import { ETIQUETAS_NOVEDAD, ROTULO_ETIQUETA, ROTULO_TIPO, TIPOS_NOVEDAD, formatarFecha, type EtiquetaNovedad, type TipoNovedad } from "@/lib/novedades";

const CAMPO = "w-full rounded-lg px-3 py-2 text-sm outline-none";
const ESTILO_CAMPO = { backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" } as const;

export default async function NovedadesAdminPage() {
  const [novedades, topicos] = await Promise.all([listarNovedadesAdmin(), listarTopicosParaNovedad()]);

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Novedades</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
          Avisos que los alumnos ven en la campana del encabezado. Tú eliges qué se publica y a qué tema lleva.
        </p>
      </div>

      <form
        action={criarNovedad}
        className="mb-8 flex flex-col gap-4 rounded-xl p-5"
        style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-surface)" }}
      >
        <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Publicar novedad</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
            Tipo de contenido
            <select name="tipo" defaultValue="VIDEO" className={CAMPO} style={ESTILO_CAMPO}>
              {TIPOS_NOVEDAD.map((t) => <option key={t} value={t}>{ROTULO_TIPO[t]}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
            Etiqueta
            <select name="etiqueta" defaultValue="NUEVO" className={CAMPO} style={ESTILO_CAMPO}>
              {ETIQUETAS_NOVEDAD.map((e) => <option key={e} value={e}>{ROTULO_ETIQUETA[e]}</option>)}
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1.5 text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
          Título
          <input name="titulo" required maxLength={120} placeholder="Nuevo video: Neuronas" className={CAMPO} style={ESTILO_CAMPO} />
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
          Resumen (opcional)
          <textarea name="resumen" rows={2} maxLength={300} placeholder="Una o dos frases sobre lo que cambió." className={CAMPO} style={ESTILO_CAMPO} />
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
          Tema al que lleva (opcional)
          <select name="topico_id" defaultValue="" className={CAMPO} style={ESTILO_CAMPO}>
            <option value="">Sin tema (solo informativo)</option>
            {topicos.map((t) => <option key={t.id} value={t.id}>{t.rotulo}</option>)}
          </select>
          <span className="font-normal" style={{ color: "var(--text-muted)" }}>
            Al hacer clic, el alumno va a la sección del tipo elegido (video, atlas, atlas 3D, cuestionario…).
          </span>
        </label>

        <button
          type="submit"
          className="self-start rounded-lg px-4 py-2 text-sm font-medium text-white"
          style={{ backgroundColor: "var(--accent)" }}
        >
          Publicar
        </button>
      </form>

      {novedades.length === 0 ? (
        <div
          className="rounded-xl p-12 flex flex-col items-center gap-3 text-center"
          style={{ border: "1px dashed var(--border)", backgroundColor: "var(--bg-surface)" }}
        >
          <Megaphone className="h-10 w-10" style={{ color: "var(--text-muted)", opacity: 0.4 }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aún no publicaste ninguna novedad.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {novedades.map((n) => (
            <div
              key={n.id}
              className="flex items-center gap-4 rounded-xl px-4 py-3"
              style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-surface)" }}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{n.titulo}</p>
                <p className="truncate text-xs" style={{ color: "var(--text-muted)" }}>
                  {ROTULO_ETIQUETA[n.etiqueta as EtiquetaNovedad]} · {ROTULO_TIPO[n.tipo as TipoNovedad]} · {formatarFecha(n.publicado_em)}
                  {n.topico ? ` · ${n.topico.titulo}` : ""}
                </p>
              </div>
              <form action={eliminarNovedad.bind(null, n.id)}>
                <button
                  type="submit"
                  aria-label={`Eliminar novedad: ${n.titulo}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ color: "var(--error)" }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
