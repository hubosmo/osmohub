"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MailCheck, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/providers/ThemeProvider";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { OsmoLogo } from "@/components/brand/OsmoLogo";
import { OrbitalDecor } from "@/components/brand/OrbitalDecor";

function VerificarEmailContent() {
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const isDark = theme === "dark";

  const [resent, setResent]       = useState(false);
  const [resending, setResending] = useState(false);

  async function handleResend() {
    setResending(true);
    await new Promise((r) => setTimeout(r, 1200));
    setResending(false);
    setResent(true);
  }

  const bgDesktop    = isDark ? "url('/login-escuro.png')"        : "url('/login-claro.png')";
  const bgMobile     = isDark ? "url('/login-escuro-mobile.png')" : "url('/login-claro-mobile.png')";
  const dividerColor = isDark ? "#1E3A5F" : "#CBD5E1";
  const textMain     = isDark ? "#FFFFFF"  : "#263B4C";
  const textSub      = isDark ? "#94A3B8"  : "#64748B";
  const textFaded    = isDark ? "#334155"  : "#C8D5E8";

  return (
    <div
      className="relative flex min-h-screen overflow-hidden"
      style={{}}
    >
      {/* ── BACKGROUNDS ── */}
      <div className="absolute inset-0 lg:hidden" style={{ backgroundImage: bgMobile, backgroundSize: "cover", backgroundPosition: "center top" }} />
      <div className="absolute inset-0 lg:hidden pointer-events-none" style={{
        background: isDark
          ? "linear-gradient(to bottom, rgba(0,10,30,0.35) 0%, rgba(0,10,30,0.60) 50%, rgba(0,10,30,0.75) 100%)"
          : "linear-gradient(to bottom, rgba(230,240,255,0.35) 0%, rgba(230,240,255,0.60) 50%, rgba(230,240,255,0.78) 100%)",
      }} />
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
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isDark
              ? "radial-gradient(ellipse 110% 85% at 50% 55%, rgba(0,10,35,0.82) 0%, rgba(0,10,35,0.55) 55%, transparent 85%)"
              : "radial-gradient(ellipse 110% 85% at 50% 55%, rgba(230,240,255,0.85) 0%, rgba(230,240,255,0.55) 55%, transparent 85%)",
          }}
        />
        <div className="relative z-10 flex flex-col items-center gap-5">
          <OsmoLogo width={400} idPrefix="verify-left" />
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

      {/* ── PAINEL DIREITO: CONTEÚDO ── */}
      <div
        className="flex w-full lg:w-1/2 flex-col items-center px-6 overflow-y-auto"
        style={{ backdropFilter: "blur(2px)", backgroundColor: isDark ? "rgba(0,10,30,0.35)" : "rgba(255,255,255,0.30)" }}
      >

        {/* Logo mobile */}
        <div className="lg:hidden w-full flex justify-center pt-16 pb-5">
          <OsmoLogo width={160} idPrefix="verify-mobile" />
        </div>

        {/* Conteúdo */}
        <div className="flex-1 flex items-center w-full py-4 lg:py-10">
          <div className="w-full max-w-[400px] flex flex-col items-center gap-7 mx-auto text-center">

            {/* Ícone animado */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.1 }}
              className="flex items-center justify-center w-20 h-20 lg:w-24 lg:h-24 rounded-full"
              style={{ backgroundColor: isDark ? "#17263A" : "#E0EFFF" }}
            >
              <MailCheck size={40} color="#00A6FF" strokeWidth={1.5} />
            </motion.div>

            {/* Texto */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut", delay: 0.28 }}
              className="flex flex-col gap-3"
            >
              <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: textMain }}>
                ¡Revisa tu correo!
              </h1>
              <p className="text-sm leading-relaxed" style={{ color: textSub }}>
                Te enviamos un enlace de verificación a:
              </p>
              {email && (
                <p className="text-sm font-semibold break-all" style={{ color: textMain }}>
                  {email}
                </p>
              )}
              <p className="text-sm leading-relaxed" style={{ color: textSub }}>
                Haz clic en el enlace de tu bandeja de entrada para activar tu cuenta.
                Si no lo ves, revisa la carpeta de spam.
              </p>
            </motion.div>

            {/* Ações */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.48 }}
              className="w-full flex flex-col gap-3"
            >
              {resent ? (
                <p className="text-sm font-semibold py-2.5" style={{ color: "#22C55E" }}>
                  ✓ Correo reenviado con éxito.
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="w-full flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold border transition-all hover:brightness-95 active:scale-[0.98] disabled:opacity-60"
                  style={{
                    backgroundColor: "transparent",
                    borderColor: dividerColor,
                    color: textMain,
                  }}
                >
                  <RefreshCw size={15} className={resending ? "animate-spin" : ""} />
                  {resending ? "Reenviando..." : "Reenviar correo de verificación"}
                </button>
              )}

              <div className="h-px w-full" style={{ backgroundColor: dividerColor }} />

              <p className="text-sm" style={{ color: textSub }}>
                ¿Correo incorrecto?{" "}
                <Link href="/cadastro" className="font-semibold hover:opacity-75" style={{ color: "#00A6FF" }}>
                  Vuelve al registro
                </Link>
              </p>

              <Link
                href="/login"
                className="text-sm font-semibold hover:opacity-75 transition-opacity"
                style={{ color: textSub }}
              >
                ← Volver al inicio de sesión
              </Link>
            </motion.div>
          </div>
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

export default function VerificarEmailPage() {
  return (
    <Suspense>
      <VerificarEmailContent />
    </Suspense>
  );
}
