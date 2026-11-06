import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export type MigalhaPlano = { nome: string; href: string };

// Barra de navegação (breadcrumb) + contêiner das páginas de Mi plan
export function PlanoShell({ migalhas, children }: { migalhas: MigalhaPlano[]; children: ReactNode }) {
  const naRaiz = migalhas.length === 0;
  return (
    <div className="-mx-4 lg:-mx-8 -mt-6">
      <div className="sticky top-0 z-20 w-full border-b" style={{ height: 48, backgroundColor: "var(--bg-nav-bar)", borderColor: "var(--border)" }}>
        <nav aria-label="Ruta" className="flex items-center gap-1.5 h-full px-4 lg:px-8 max-w-5xl mx-auto text-sm overflow-x-auto whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
          {naRaiz ? (
            <span className="font-semibold" style={{ color: "var(--text-primary)" }}>Mi plan</span>
          ) : (
            <Link href="/plan-de-estudios" className="breadcrumb-link">Mi plan</Link>
          )}
          {migalhas.map((m, i) => (
            <span key={m.href} className="flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {i === migalhas.length - 1 ? (
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{m.nome}</span>
              ) : (
                <Link href={m.href} className="breadcrumb-link">{m.nome}</Link>
              )}
            </span>
          ))}
        </nav>
      </div>
      <div className="px-4 lg:px-8 py-8 max-w-5xl mx-auto">{children}</div>
    </div>
  );
}
