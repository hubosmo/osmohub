import Link from "next/link";
import { BookOpen, Box, HelpCircle, ImageIcon, PlayCircle, Sparkles, Table2 } from "lucide-react";
import { ROTULO_ETIQUETA, ROTULO_TIPO, type NovedadItem as Item, type TipoNovedad } from "@/lib/novedades";

const ICONO: Record<TipoNovedad, typeof Box> = {
  VIDEO: PlayCircle,
  ATLAS: ImageIcon,
  ATLAS_3D: Box,
  CUESTIONARIO: HelpCircle,
  ARTICULO: BookOpen,
  TABLAS: Table2,
  TEMA: Sparkles,
};

// Uma novedad: etiqueta (Nuevo/Mejora), data, ícone do tipo, título e resumo. Usada no sino e na página /novedades.
export function NovedadItem({ item, onNavigate }: { item: Item; onNavigate?: () => void }) {
  const Icono = ICONO[item.tipo];
  const contenido = (
    <>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span
          className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
          style={{ backgroundColor: item.etiqueta === "NUEVO" ? "var(--success)" : "var(--accent)" }}
        >
          {ROTULO_ETIQUETA[item.etiqueta]}
        </span>
        <span className="text-[11px] tabular-nums" style={{ color: "var(--text-muted)" }}>{item.fecha}</span>
      </div>
      <p className="flex items-start gap-2 text-sm font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>
        <Icono className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--accent)" }} aria-label={ROTULO_TIPO[item.tipo]} />
        <span>{item.titulo}</span>
      </p>
      {item.resumen && (
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{item.resumen}</p>
      )}
    </>
  );

  const estilo = {
    borderBottom: "1px solid var(--border)",
    backgroundColor: item.nueva ? "color-mix(in srgb, var(--accent) 7%, transparent)" : "transparent",
  };

  return item.href ? (
    <Link href={item.href} onClick={onNavigate} className="block px-4 py-3 transition-colors hover:bg-bg-subtle" style={estilo}>
      {contenido}
    </Link>
  ) : (
    <div className="px-4 py-3" style={estilo}>{contenido}</div>
  );
}
