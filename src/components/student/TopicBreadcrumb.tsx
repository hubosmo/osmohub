import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface TopicBreadcrumbProps {
  cursoSlug: string;
  cursoNome: string;
  disciplinaSlug: string;
  disciplinaNome: string;
  areaPath: string;
  areaNome: string;
  titulo: string;
}

export function TopicBreadcrumb({
  cursoSlug, cursoNome, disciplinaSlug, disciplinaNome, areaPath, areaNome, titulo,
}: TopicBreadcrumbProps) {
  return (
    <div
      className="sticky z-20 border-b"
      style={{ top: 0, height: 48, backgroundColor: "var(--bg-nav-bar)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center h-full px-4 lg:px-8 max-w-5xl mx-auto overflow-hidden">
        <nav className="flex items-center gap-1.5 text-xs min-w-0" style={{ color: "var(--text-muted)" }}>
          {/* Desktop: full breadcrumb */}
          <Link href="/cursos" className="breadcrumb-link shrink-0 hidden sm:inline">Cursos</Link>
          <ChevronRight className="h-3 w-3 shrink-0 hidden sm:inline" />
          <Link href={`/cursos/${cursoSlug}`} className="breadcrumb-link truncate max-w-[100px] hidden sm:inline">
            {cursoNome}
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0 hidden sm:inline" />
          <Link href={`/cursos/${cursoSlug}/${disciplinaSlug}`} className="breadcrumb-link truncate max-w-[100px] hidden sm:inline">
            {disciplinaNome}
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0 hidden sm:inline" />
          {/* Always visible: Area > Topic */}
          <Link href={areaPath} className="breadcrumb-link shrink-0 truncate max-w-[120px]">
            {areaNome}
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="truncate font-semibold" style={{ color: "var(--text-primary)", minWidth: 0 }}>{titulo}</span>
        </nav>
      </div>
    </div>
  );
}
