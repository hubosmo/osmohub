import Link from "next/link";
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
        className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-150 hover:shadow-md hover:-translate-y-0.5"
        style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-surface)" }}
      >
        <CapaPastaPadrao className="h-40" iconSize={44} />
        <div className="px-4 py-3">
          <p className="text-base font-semibold leading-snug truncate" style={{ color: "var(--accent)" }}>{nome}</p>
          {descricao && (
            <p className="mt-1 text-xs leading-relaxed line-clamp-2" style={{ color: "var(--text-secondary)" }}>{descricao}</p>
          )}
          <p className="mt-2 text-[11px]" style={{ color: "var(--text-muted)" }}>{contagem(subpastas, temas)}</p>
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
