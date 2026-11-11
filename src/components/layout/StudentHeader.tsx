"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { OsmoLogo } from "@/components/brand/OsmoLogo";
import type { NavCurso } from "@/types/nav";
import { HeaderUtilityBar } from "./header/HeaderUtilityBar";
import { DesktopNav } from "./header/DesktopNav";
import { MobileDrawer } from "./header/MobileDrawer";
import { NovedadesBell } from "./header/NovedadesBell";
import type { NovedadesResumen } from "@/lib/novedades";

interface StudentHeaderProps {
  userName?: string;
  userEmail?: string;
  isAdmin?: boolean;
  navData?: NavCurso[];
  novedades?: NovedadesResumen;
}

export function StudentHeader({ userName = "Estudiante", userEmail, isAdmin, navData, novedades = { items: [], nuevas: 0 } }: StudentHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const cursos = navData ?? [];

  return (
    <>
      <header style={{ backgroundColor: "var(--bg-surface)", borderBottom: "1px solid var(--border)" }}>

        {/* ── Row 1: utility bar — desktop only ──────────────── */}
        <HeaderUtilityBar userName={userName} userEmail={userEmail} isAdmin={isAdmin} initials={initials} novedades={novedades} />

        {/* ── Row 2: logo + nav ──────────────────────────────── */}
        <div className="h-14 md:h-[72px]">
          <div className="flex items-center gap-6 h-full px-4 lg:px-8 max-w-5xl mx-auto">

          {/* Logo */}
          <Link href="/dashboard" className="shrink-0">
            <OsmoLogo width={148} idPrefix="header-full" animated />
          </Link>

          <DesktopNav cursos={cursos} />

          {/* Mobile: novedades + hamburger */}
          <div className="ml-auto flex md:hidden items-center gap-1">
            <NovedadesBell resumen={novedades} tamanho="md" />
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
              style={{ color: "var(--text-secondary)" }}
              aria-label="Abrir menú"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
          </div>
        </div>
      </header>

      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        cursos={cursos}
        userName={userName}
        userEmail={userEmail}
        isAdmin={isAdmin}
        initials={initials}
      />
    </>
  );
}
