"use client";

import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { OsmoLogo } from "@/components/brand/OsmoLogo";
import { OrbitalDecor } from "@/components/brand/OrbitalDecor";
import { useAuthTheme } from "./useAuthTheme";

interface AuthShellProps {
  // Prefixo dos ids do SVG do logo; precisa ser único por página
  logoId: string;
  animatedLogo?: boolean;
  // "start" alinha o conteúdo ao topo no mobile (formulários longos)
  alignContent?: "center" | "start";
  children: React.ReactNode;
}

export function AuthShell({ logoId, animatedLogo = false, alignContent = "center", children }: AuthShellProps) {
  const { isDark, dividerColor, textSub, textFaded } = useAuthTheme();

  const bgDesktop = isDark ? "url('/login-escuro.png')"        : "url('/login-claro.png')";
  const bgMobile  = isDark ? "url('/login-escuro-mobile.png')" : "url('/login-claro-mobile.png')";

  return (
    <div className="relative flex min-h-screen overflow-hidden">
      {/* ── BACKGROUNDS ── */}
      {/* Mobile */}
      <div className="absolute inset-0 lg:hidden" style={{ backgroundImage: bgMobile, backgroundSize: "cover", backgroundPosition: "center top" }} />
      <div className="absolute inset-0 lg:hidden pointer-events-none" style={{
        background: isDark
          ? "linear-gradient(to bottom, rgba(0,10,30,0.35) 0%, rgba(0,10,30,0.60) 50%, rgba(0,10,30,0.75) 100%)"
          : "linear-gradient(to bottom, rgba(230,240,255,0.35) 0%, rgba(230,240,255,0.60) 50%, rgba(230,240,255,0.78) 100%)",
      }} />
      {/* Desktop */}
      <div className="absolute inset-0 hidden lg:block" style={{ backgroundImage: bgDesktop, backgroundSize: "cover", backgroundPosition: "center" }} />

      {/* ── DECORAÇÕES DE CANTO ── */}
      <div className="absolute -top-20 -right-20 pointer-events-none">
        <OrbitalDecor size={340} opacity={0.13} />
      </div>
      <div className="absolute -bottom-24 -left-24 pointer-events-none">
        <OrbitalDecor size={400} opacity={0.10} />
      </div>

      {/* ── TOGGLE DE TEMA ── */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      {/* ── PAINEL ESQUERDO: LOGO (desktop) ── */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col items-center justify-center px-16 gap-5">
        {/* Gradient overlay para destacar o logo */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isDark
              ? "radial-gradient(ellipse 110% 85% at 50% 55%, rgba(0,10,35,0.82) 0%, rgba(0,10,35,0.55) 55%, transparent 85%)"
              : "radial-gradient(ellipse 110% 85% at 50% 55%, rgba(230,240,255,0.85) 0%, rgba(230,240,255,0.55) 55%, transparent 85%)",
          }}
        />
        <div className="relative z-10 flex flex-col items-center gap-5">
          <OsmoLogo width={400} idPrefix={`${logoId}-left`} animated={animatedLogo} />
          <p
            className="tracking-[0.35em] text-xs font-semibold uppercase"
            style={{ color: textSub }}
          >
            Ciencias que Conectan
          </p>
        </div>
      </div>

      {/* ── DIVISOR CENTRAL ── */}
      <div
        className="hidden lg:block w-px flex-shrink-0 my-16"
        style={{
          background: `linear-gradient(to bottom, transparent, ${dividerColor} 20%, ${dividerColor} 80%, transparent)`,
        }}
      />

      {/* ── PAINEL DIREITO ── */}
      <div
        className="flex w-full lg:w-1/2 flex-col items-center px-6 overflow-y-auto"
        style={{ backdropFilter: "blur(2px)", backgroundColor: isDark ? "rgba(0,10,30,0.35)" : "rgba(255,255,255,0.30)" }}
      >

        {/* Logo mobile — pt-16 garante espaço acima do ThemeToggle (top-4 ≈ 52px) */}
        <div className="lg:hidden w-full flex justify-center pt-16 pb-5">
          <OsmoLogo width={160} idPrefix={`${logoId}-mobile`} animated={animatedLogo} />
        </div>

        {/* Conteúdo — flex-1 ocupa o espaço disponível e centraliza verticalmente */}
        <div className={`flex-1 flex ${alignContent === "start" ? "items-start lg:items-center" : "items-center"} w-full py-4 lg:py-10`}>
          {children}
        </div>

        {/* Tagline rodapé */}
        <p
          className="tracking-[0.08em] lg:tracking-[0.25em] text-[10px] lg:text-xs font-semibold uppercase pb-6 pt-2 text-center whitespace-nowrap"
          style={{ color: textFaded }}
        >
          Aprender &nbsp;·&nbsp; Explorar &nbsp;·&nbsp; Evolucionar
        </p>
      </div>
    </div>
  );
}
