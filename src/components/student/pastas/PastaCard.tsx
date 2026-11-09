import Link from "next/link";
import { ThemeAwareCapa } from "@/components/student/ThemeAwareCapa";
import { CapaPastaPadrao } from "./CapaPastaPadrao";

interface PastaCardProps {
  href: string;
  nome: string;
  descricao: string | null;
  subpastas: number;
  temas: number;
  // "alta": card vertical das pastas da raiz (como os cursos); "horizontal": subpastas (como as disciplinas)
  variante: "alta" | "horizontal";
}

function contagem(subpastas: number, temas: number) {
  const partes: string[] = [];
  if (subpastas > 0) partes.push(`${subpastas} ${subpastas === 1 ? "carpeta" : "carpetas"}`);
  partes.push(`${temas} ${temas === 1 ? "tema" : "temas"}`);
  return partes.join(" · ");
}

export function PastaCard({ href, nome, descricao, subpastas, temas, variante }: PastaCardProps) {
  if (variante === "alta") {
    return (
      <Link
        href={href}
        className="group relative block aspect-[3/4] overflow-hidden rounded-2xl transition-all duration-150 hover:shadow-md hover:-translate-y-0.5"
        style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-surface)" }}
      >
        <ThemeAwareCapa
          capaUrlDark="/capa-mi-plan-escuro.png"
          capaUrlLight="/capa-mi-plan-claro.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {/* Reflexo que varre a capa no hover (igual ao das capas de curso) */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 -translate-x-full skew-x-[-20deg] transition-transform duration-700 ease-in-out group-hover:translate-x-[200%]"
          style={{ background: "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)", width: "60%" }}
        />
        {/* Escurecimento do rodapé: mesma cor das capas de curso, por tema */}
        <div
          className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-16"
          style={{ background: "linear-gradient(to top, var(--capa-overlay) 0%, transparent 100%)" }}
        >
          <p className="text-base font-semibold leading-snug line-clamp-2 text-white">{nome}</p>
          {descricao && (
            <p className="mt-1 text-xs leading-relaxed line-clamp-2 text-white/80">{descricao}</p>
          )}
          <p className="mt-2 text-xs text-white/70">{contagem(subpastas, temas)}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group flex rounded-xl overflow-hidden transition-all duration-150 hover:shadow-md hover:-translate-y-0.5"
      style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-surface)" }}
    >
      <CapaPastaPadrao className="shrink-0" iconSize={28} />
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-snug truncate" style={{ color: "var(--accent)" }}>{nome}</p>
          {descricao && (
            <p className="mt-1 text-xs leading-relaxed line-clamp-2" style={{ color: "var(--text-secondary)" }}>{descricao}</p>
          )}
        </div>
        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{contagem(subpastas, temas)}</p>
      </div>
    </Link>
  );
}
