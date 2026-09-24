"use client";

import { useState, useRef, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, X, ChevronDown, ChevronRight, LayoutDashboard } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { OsmoLogo } from "@/components/brand/OsmoLogo";
import { logoutAction } from "@/lib/actions/auth";
import type { NavCurso } from "@/types/nav";


interface StudentHeaderProps {
  userName?: string;
  userEmail?: string;
  isAdmin?: boolean;
  navData?: NavCurso[];
}

const OTHER_NAV = [
  { href: "/plano-de-estudios", label: "MI PLAN" },
  { href: "/simulacoes", label: "SIMULACIONES" },
];

export function StudentHeader({ userName = "Estudiante", userEmail, isAdmin, navData }: StudentHeaderProps) {
  const pathname = usePathname();
  const [showUser, setShowUser] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [megaOpen, setMegaOpen] = useState(false);
  const [hoveredCursoId, setHoveredCursoId] = useState<string | null>(null);
  const megaTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mobileCoursesOpen, setMobileCoursesOpen] = useState(false);
  const [mobileExpandedCurso, setMobileExpandedCurso] = useState<string | null>(null);

  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const closeAll = () => { setShowUser(false); setShowNotif(false); };

  const cursos = navData ?? [];
  const hoveredCurso = cursos.find((c) => c.id === hoveredCursoId) ?? null;

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

  const cursosActive = pathname === "/cursos" || pathname.startsWith("/cursos/");

  return (
    <>
      <header style={{ backgroundColor: "var(--bg-surface)", borderBottom: "1px solid var(--border)" }}>

        {/* ── Row 1: utility bar — desktop only ──────────────── */}
        <div className="hidden md:block" style={{ height: 36, backgroundColor: "var(--bg-nav-bar)", borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center justify-end gap-2 h-full px-4 lg:px-8 max-w-5xl mx-auto">
          <ThemeToggle />

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setShowNotif((v) => !v); setShowUser(false); }}
              className="relative flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
              style={{ color: "var(--text-muted)" }}
              aria-label="Notificaciones"
            >
              <Bell className="h-4 w-4" />
              <span
                className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: "var(--accent)" }}
              />
            </button>
            {showNotif && (
              <>
                <div className="fixed inset-0 z-40" onClick={closeAll} />
                <div
                  className="absolute right-0 top-9 z-50 w-64 rounded-xl border p-4 shadow-xl"
                  style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border)" }}
                >
                  <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                    Notificaciones
                  </p>
                  <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>
                    Sin notificaciones nuevas
                  </p>
                </div>
              </>
            )}
          </div>

          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={() => { setShowUser((v) => !v); setShowNotif(false); }}
              className="flex items-center gap-1.5 h-7 px-2 rounded-lg text-xs font-medium transition-colors"
              style={{
                color: "var(--text-secondary)",
                backgroundColor: showUser ? "var(--bg-surface)" : "transparent",
              }}
            >
              <span
                className="flex h-5 w-5 items-center justify-center rounded text-white text-xs font-bold shrink-0"
                style={{ backgroundColor: "var(--accent)" }}
              >
                {initials}
              </span>
              <span className="hidden sm:inline max-w-[120px] truncate">
                {userName.split(" ")[0]}
              </span>
              <ChevronDown className="h-3 w-3 shrink-0" />
            </button>

            {showUser && (
              <>
                <div className="fixed inset-0 z-40" onClick={closeAll} />
                <div
                  className="absolute right-0 top-9 z-50 w-52 rounded-xl border py-1.5 shadow-xl"
                  style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border)" }}
                >
                  <div className="px-3 py-2 border-b" style={{ borderColor: "var(--border)" }}>
                    <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                      {userName}
                    </p>
                    {userEmail && (
                      <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {userEmail}
                      </p>
                    )}
                  </div>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={closeAll}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs transition-colors hover:bg-bg-subtle"
                      style={{ color: "var(--accent)" }}
                    >
                      <LayoutDashboard className="h-3.5 w-3.5" />
                      Panel Admin
                    </Link>
                  )}

                  <button
                    className="w-full text-left px-3 py-2 text-xs transition-colors hover:bg-bg-subtle"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Mi perfil
                  </button>

                  <div className="my-1 border-t" style={{ borderColor: "var(--border)" }} />

                  <button
                    disabled={pending}
                    onClick={() => { closeAll(); startTransition(() => logoutAction()); }}
                    className="w-full text-left px-3 py-2 text-xs disabled:opacity-50 transition-colors hover:bg-bg-subtle"
                    style={{ color: "var(--error)" }}
                  >
                    {pending ? "Saliendo..." : "Cerrar sesión"}
                  </button>
                </div>
              </>
            )}
          </div>
          </div>
        </div>

        {/* ── Row 2: logo + nav ──────────────────────────────── */}
        <div className="h-14 md:h-[72px]">
          <div className="flex items-center gap-6 h-full px-4 lg:px-8 max-w-5xl mx-auto">

          {/* Logo */}
          <Link href="/dashboard" className="shrink-0">
            <OsmoLogo width={148} idPrefix="header-full" animated />
          </Link>

          {/* Desktop nav */}
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

                {megaOpen && (
                  <div
                    className="absolute left-0 top-full pt-1 z-50"
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
                  </div>
                )}
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
              const active = pathname === href || pathname.startsWith(href + "/");
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

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="ml-auto flex md:hidden h-8 w-8 items-center justify-center rounded-lg transition-colors"
            style={{ color: "var(--text-secondary)" }}
            aria-label="Abrir menú"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ──────────────────────────────────────── */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className="fixed left-0 top-0 z-40 h-full w-64 flex flex-col shadow-2xl md:hidden"
            style={{ backgroundColor: "var(--bg-surface)" }}
          >
            <div
              className="flex items-center justify-between px-4 h-14 border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                <OsmoLogo width={110} idPrefix="header-mobile" animated />
              </Link>
              <button onClick={() => setMobileOpen(false)} style={{ color: "var(--text-muted)" }}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-0.5 p-3 flex-1 overflow-y-auto">

              {/* CURSOS — accordion nível 1 */}
              <div>
                <button
                  type="button"
                  onClick={() => setMobileCoursesOpen((v) => !v)}
                  className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-colors text-left"
                  style={{
                    color: cursosActive ? "var(--accent)" : "var(--text-secondary)",
                    backgroundColor: cursosActive || mobileCoursesOpen
                      ? "color-mix(in srgb, var(--accent) 12%, transparent)"
                      : "transparent",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    letterSpacing: "0.1em",
                  }}
                >
                  CURSOS
                  <ChevronDown
                    className="h-4 w-4 shrink-0 transition-transform duration-200"
                    style={{ transform: mobileCoursesOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </button>

                {mobileCoursesOpen && cursos.length > 0 && (
                  <div className="mt-0.5 flex flex-col gap-0.5">
                    {cursos.map((curso) => {
                      const expanded = mobileExpandedCurso === curso.id;
                      return (
                        <div key={curso.id}>
                          {/* Linha do curso: nome (link) + seta (expand) */}
                          <div
                            className="flex items-center rounded-lg overflow-hidden ml-2"
                            style={{
                              backgroundColor: expanded
                                ? "color-mix(in srgb, var(--accent) 8%, transparent)"
                                : "transparent",
                            }}
                          >
                            <Link
                              href={`/cursos/${curso.slug}`}
                              onClick={() => setMobileOpen(false)}
                              className="flex-1 px-3 py-2 text-sm no-underline truncate"
                              style={{ color: expanded ? "var(--accent)" : "var(--text-secondary)", fontWeight: expanded ? 600 : 400 }}
                            >
                              {curso.nome}
                            </Link>
                            {curso.disciplinas.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setMobileExpandedCurso((v) => v === curso.id ? null : curso.id)}
                                className="shrink-0 px-2.5 py-2 transition-colors"
                                style={{ color: expanded ? "var(--accent)" : "var(--text-muted)" }}
                                aria-label={expanded ? "Colapsar" : "Expandir"}
                              >
                                <ChevronRight
                                  className="h-3.5 w-3.5 transition-transform duration-200"
                                  style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)" }}
                                />
                              </button>
                            )}
                          </div>

                          {/* Disciplinas — nível 2 */}
                          {expanded && (
                            <div className="ml-5 mt-0.5 flex flex-col gap-0.5 mb-1">
                              {curso.disciplinas.map((disc) => (
                                <Link
                                  key={disc.id}
                                  href={`/cursos/${curso.slug}/${disc.slug}`}
                                  onClick={() => setMobileOpen(false)}
                                  className="px-3 py-2 text-xs rounded-lg no-underline truncate"
                                  style={{ color: "var(--text-muted)" }}
                                >
                                  {disc.nome}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {OTHER_NAV.map(({ href, label }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2.5 text-sm font-bold tracking-widest rounded-lg transition-colors"
                    style={{
                      color: active ? "var(--accent)" : "var(--text-secondary)",
                      backgroundColor: active ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "transparent",
                    }}
                  >
                    {label}
                  </Link>
                );
              })}

              {isAdmin && (
                <>
                  <div className="my-2 border-t" style={{ borderColor: "var(--border)" }} />
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg"
                    style={{ color: "var(--accent)" }}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Panel Admin
                  </Link>
                </>
              )}
            </nav>

            <div className="p-4 border-t" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between mb-3 pb-3 border-b" style={{ borderColor: "var(--border)" }}>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>Apariencia</span>
                <ThemeToggle />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  {initials}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {userName}
                  </p>
                  {userEmail && (
                    <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                      {userEmail}
                    </p>
                  )}
                </div>
              </div>
              <button
                disabled={pending}
                onClick={() => { setMobileOpen(false); startTransition(() => logoutAction()); }}
                className="w-full py-2 text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
                style={{ color: "var(--error)", border: "1px solid var(--error)" }}
              >
                {pending ? "Saliendo..." : "Cerrar sesión"}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
