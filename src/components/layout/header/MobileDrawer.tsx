"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, ChevronDown, ChevronRight, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "../ThemeToggle";
import { OsmoLogo } from "@/components/brand/OsmoLogo";
import { logoutAction } from "@/lib/actions/auth";
import type { NavCurso } from "@/types/nav";
import { OVERLAY, SMOOTH, ACCORDION_OPEN, ACCORDION_CLOSE, ACCORDION_STYLE, STANDARD } from "@/lib/motion";
import { OTHER_NAV, isCursosActive, isPathActive } from "./nav-links";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  cursos: NavCurso[];
  userName: string;
  userEmail?: string;
  isAdmin?: boolean;
  initials: string;
}

export function MobileDrawer({ open, onClose, cursos, userName, userEmail, isAdmin, initials }: MobileDrawerProps) {
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [mobileCoursesOpen, setMobileCoursesOpen] = useState(false);
  const [mobileExpandedCurso, setMobileExpandedCurso] = useState<string | null>(null);
  const cursosActive = isCursosActive(pathname);

  return (
    <AnimatePresence>
    {open && (
      <>
        <motion.div
          variants={OVERLAY} initial="initial" animate="animate" exit="exit"
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
        />
        <motion.div
          initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
          transition={SMOOTH}
          className="fixed left-0 top-0 z-40 h-full w-64 flex flex-col shadow-2xl md:hidden"
          style={{ backgroundColor: "var(--bg-surface)" }}
        >
          <div
            className="flex items-center justify-between px-4 h-14 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <Link href="/dashboard" onClick={onClose}>
              <OsmoLogo width={110} idPrefix="header-mobile" animated />
            </Link>
            <button onClick={onClose} style={{ color: "var(--text-muted)" }}>
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

              <AnimatePresence initial={false}>
              {mobileCoursesOpen && cursos.length > 0 && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={ACCORDION_OPEN} exit={ACCORDION_CLOSE} transition={STANDARD} style={ACCORDION_STYLE}>
                <div className="mt-0.5 flex flex-col gap-0.5">
                  {cursos.map((curso) => {
                    const expanded = mobileExpandedCurso === curso.id;
                    return (
                      <div key={`curso-${curso.id}`}>
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
                            onClick={onClose}
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
                        <AnimatePresence initial={false}>
                        {expanded && (
                          <motion.div key={`disc-${curso.id}`} initial={{ height: 0, opacity: 0 }} animate={ACCORDION_OPEN} exit={ACCORDION_CLOSE} transition={STANDARD} style={ACCORDION_STYLE}>
                            <div className="ml-5 mt-0.5 flex flex-col gap-0.5 mb-1">
                              {curso.disciplinas.map((disc) => (
                                <Link
                                  key={disc.id}
                                  href={`/cursos/${curso.slug}/${disc.slug}`}
                                  onClick={onClose}
                                  className="px-3 py-2 text-xs rounded-lg no-underline truncate"
                                  style={{ color: "var(--text-muted)" }}
                                >
                                  {disc.nome}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
                </motion.div>
              )}
              </AnimatePresence>
            </div>

            {OTHER_NAV.map(({ href, label }) => {
              const active = isPathActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
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
                  onClick={onClose}
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
              onClick={() => { onClose(); startTransition(() => logoutAction()); }}
              className="w-full py-2 text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
              style={{ color: "var(--error)", border: "1px solid var(--error)" }}
            >
              {pending ? "Saliendo..." : "Cerrar sesión"}
            </button>
          </div>
        </motion.div>
      </>
    )}
    </AnimatePresence>
  );
}
