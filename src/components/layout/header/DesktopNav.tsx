"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { NavCurso } from "@/types/nav";
import { DROPDOWN, DROPDOWN_ORIGIN, FAST } from "@/lib/motion";
import { OTHER_NAV, isCursosActive, isPathActive } from "./nav-links";

export function DesktopNav({ cursos }: { cursos: NavCurso[] }) {
  const pathname = usePathname();
  const [megaOpen, setMegaOpen] = useState(false);
  const [hoveredCursoId, setHoveredCursoId] = useState<string | null>(null);
  const megaTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hoveredCurso = cursos.find((c) => c.id === hoveredCursoId) ?? null;
  const cursosActive = isCursosActive(pathname);

  const openMega = () => {
    if (megaTimeout.current) clearTimeout(megaTimeout.current);
    setMegaOpen(true);
  };

  const closeMega = () => {
    megaTimeout.current = setTimeout(() => {
      setMegaOpen(false);
      setHoveredCursoId(null);
    }, 100);
  };

  return (
    <nav className="hidden md:flex items-center gap-0.5 flex-1">

      {/* CURSOS — mega-menu estilo Kenhub */}
      {cursos.length > 0 ? (
        <div
          className="relative"
          onMouseEnter={openMega}
          onMouseLeave={closeMega}
        >
          <Link
            href="/cursos"
            className="flex items-center gap-1 px-4 py-1.5 text-xs font-bold tracking-widest rounded-md transition-colors"
            style={{
              color: cursosActive ? "var(--accent)" : "var(--text-secondary)",
              backgroundColor: cursosActive || megaOpen ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "transparent",
            }}
          >
            CURSOS
            <ChevronDown className="h-3 w-3 shrink-0 opacity-60" />
          </Link>

          <AnimatePresence>
          {megaOpen && (
            <motion.div
              variants={DROPDOWN} initial="initial" animate="animate" exit="exit"
              transition={FAST}
              className="absolute left-0 top-full pt-1 z-50"
              style={DROPDOWN_ORIGIN}
              onMouseEnter={openMega}
              onMouseLeave={closeMega}
            >
              <div
                className="flex rounded-xl shadow-2xl overflow-hidden"
                style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-elevated)" }}
              >
                {/* Coluna 1: Cursos */}
                <div className="w-44 py-1.5 shrink-0" style={{ borderRight: "1px solid var(--border)" }}>
                  {cursos.map((curso) => {
                    const isHovered = hoveredCursoId === curso.id;
                    return (
                      <Link
                        key={curso.id}
                        href={`/cursos/${curso.slug}`}
                        className="flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors no-underline"
                        style={{
                          color: isHovered ? "var(--accent)" : "var(--text-secondary)",
                          backgroundColor: isHovered ? "color-mix(in srgb, var(--accent) 8%, transparent)" : "transparent",
                          fontWeight: isHovered ? 600 : 400,
                        }}
                        onMouseEnter={() => setHoveredCursoId(curso.id)}
                        onClick={() => setMegaOpen(false)}
                      >
                        {curso.nome}
                        {curso.disciplinas.length > 0 && (
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* Coluna 2: Disciplinas do curso hovado */}
                {hoveredCurso && hoveredCurso.disciplinas.length > 0 && (
                  <div className="py-1.5 flex-1" style={{ minWidth: 200 }}>
                    <p
                      className="px-4 pt-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {hoveredCurso.nome}
                    </p>
                    {hoveredCurso.disciplinas.map((disc) => (
                      <Link
                        key={disc.id}
                        href={`/cursos/${hoveredCurso.slug}/${disc.slug}`}
                        className="flex items-center px-4 py-2 text-sm transition-colors no-underline"
                        style={{ color: "var(--text-secondary)" }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.color = "var(--accent)";
                          (e.currentTarget as HTMLElement).style.backgroundColor = "color-mix(in srgb, var(--accent) 8%, transparent)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                          (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                        }}
                        onClick={() => setMegaOpen(false)}
                      >
                        {disc.nome}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      ) : (
        <Link
          href="/cursos"
          className="px-4 py-1.5 text-xs font-bold tracking-widest rounded-md transition-colors"
          style={{
            color: cursosActive ? "var(--accent)" : "var(--text-secondary)",
            backgroundColor: cursosActive ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "transparent",
          }}
        >
          CURSOS
        </Link>
      )}

      {OTHER_NAV.map(({ href, label }) => {
        const active = isPathActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            className="px-4 py-1.5 text-xs font-bold tracking-widest rounded-md transition-colors"
            style={{
              color: active ? "var(--accent)" : "var(--text-secondary)",
              backgroundColor: active ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "transparent",
            }}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
