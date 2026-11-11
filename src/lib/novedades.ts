// Regras puras das novedades (sem acesso a dados, pode ser importado do cliente). Ver ADR 0018.

export const TIPOS_NOVEDAD = ["VIDEO", "ATLAS", "ATLAS_3D", "CUESTIONARIO", "ARTICULO", "TABLAS", "TEMA"] as const;
export type TipoNovedad = (typeof TIPOS_NOVEDAD)[number];

// Quantas novedades a página /novedades carrega por vez (botão "Ver más")
export const NOVEDADES_POR_PAGINA = 20;

export const ETIQUETAS_NOVEDAD = ["NUEVO", "MEJORA"] as const;
export type EtiquetaNovedad = (typeof ETIQUETAS_NOVEDAD)[number];

export const ROTULO_TIPO: Record<TipoNovedad, string> = {
  VIDEO: "Video",
  ATLAS: "Atlas",
  ATLAS_3D: "Atlas 3D",
  CUESTIONARIO: "Cuestionario",
  ARTICULO: "Artículo",
  TABLAS: "Tablas de resumen",
  TEMA: "Tema completo",
};

export const ROTULO_ETIQUETA: Record<EtiquetaNovedad, string> = { NUEVO: "Nuevo", MEJORA: "Mejora" };

// Âncora da seção na página do tópico (ids de TopicSections); TEMA leva ao topo da página
const ANCLA_POR_TIPO: Record<TipoNovedad, string | null> = {
  VIDEO: "video",
  ATLAS: "atlas",
  ATLAS_3D: "atlas3d",
  CUESTIONARIO: "cuestionario",
  ARTICULO: "articulo",
  TABLAS: "tablas",
  TEMA: null,
};

export type NovedadItem = {
  id: string;
  tipo: TipoNovedad;
  etiqueta: EtiquetaNovedad;
  titulo: string;
  resumen: string | null;
  href: string | null;
  fecha: string;
  nueva: boolean;
};

export type NovedadesResumen = { items: NovedadItem[]; nuevas: number };

type RutaTopico = { slug: string; area: { slug: string; disciplina: { slug: string; curso: { slug: string } } } };

export function hrefDaNovedad(tipo: TipoNovedad, topico: RutaTopico | null): string | null {
  if (!topico) return null;
  const { area } = topico;
  const base = `/cursos/${area.disciplina.curso.slug}/${area.disciplina.slug}/${area.slug}/${topico.slug}`;
  const ancla = ANCLA_POR_TIPO[tipo];
  return ancla ? `${base}#${ancla}` : base;
}

// Formato fixo em UTC para servidor e navegador mostrarem o mesmo texto
export function formatarFecha(d: Date): string {
  return new Intl.DateTimeFormat("es-419", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(d);
}
