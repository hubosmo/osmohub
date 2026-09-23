"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock } from "lucide-react";
import { signUpAction } from "./actions";
import { useTheme } from "@/components/providers/ThemeProvider";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { OsmoLogo } from "@/components/brand/OsmoLogo";
import { GoogleIcon } from "@/components/brand/GoogleIcon";
import { OrbitalDecor } from "@/components/brand/OrbitalDecor";
import { AuthInput } from "@/components/auth/AuthInput";

export default function CadastroPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const [name, setName]                       = useState("");
  const [email, setEmail]                     = useState("");
  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms]         = useState(false);
  const [loading, setLoading]                 = useState(false);
  const [serverError, setServerError]         = useState("");

  const isDark = theme === "dark";

  const bgDesktop    = isDark ? "url('/login-escuro.png')"        : "url('/login-claro.png')";
  const bgMobile     = isDark ? "url('/login-escuro-mobile.png')" : "url('/login-claro-mobile.png')";
  const dividerColor = isDark ? "#1E3A5F" : "#CBD5E1";
  const textMain     = isDark ? "#FFFFFF"  : "#263B4C";
  const textSub      = isDark ? "#94A3B8"  : "#64748B";
  const textFaded    = isDark ? "#334155"  : "#C8D5E8";

  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (passwordMismatch || !acceptTerms || loading) return;
    setServerError("");
    setLoading(true);
    const result = await signUpAction(name, email, password);
    setLoading(false);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    router.push(`/verificar-email?email=${encodeURIComponent(email)}`);
  }

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
          <OsmoLogo width={400} idPrefix="cadastro-left" />
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

      {/* ── PAINEL DIREITO: FORMULÁRIO ── */}
      <div
        className="flex w-full lg:w-1/2 flex-col items-center px-6 overflow-y-auto"
        style={{ backdropFilter: "blur(2px)", backgroundColor: isDark ? "rgba(0,10,30,0.35)" : "rgba(255,255,255,0.30)" }}
      >

        {/* Logo mobile */}
        <div className="lg:hidden w-full flex justify-center pt-16 pb-5">
          <OsmoLogo width={160} idPrefix="cadastro-mobile" />
        </div>

        {/* Formulário */}
        <div className="flex-1 flex items-start lg:items-center w-full py-4 lg:py-10">
          <div className="w-full max-w-[400px] flex flex-col gap-5 mx-auto">

            <div className="flex flex-col gap-1.5">
              <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: textMain }}>
                Crea tu cuenta
              </h1>
              <p className="text-sm leading-relaxed" style={{ color: textSub }}>
                Únete y empieza a explorar las ciencias hoy.
              </p>
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <AuthInput
                id="name"
                label="Nombre completo"
                type="text"
                placeholder="Tu nombre"
                autoComplete="name"
                value={name}
                onChange={setName}
                icon={User}
              />

              <AuthInput
                id="email"
                label="Correo electrónico"
                type="email"
                placeholder="tu@correo.com"
                autoComplete="email"
                value={email}
                onChange={setEmail}
                icon={Mail}
              />

              <AuthInput
                id="password"
                label="Contraseña"
                type="password"
                placeholder="Mín. 8 caracteres"
                autoComplete="new-password"
                value={password}
                onChange={setPassword}
                icon={Lock}
              />

              <div className="flex flex-col gap-1.5">
                <AuthInput
                  id="confirm-password"
                  label="Confirmar contraseña"
                  type="password"
                  placeholder="Repite tu contraseña"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  icon={Lock}
                />
                {passwordMismatch && (
                  <p className="text-xs px-1" style={{ color: "#EF4444" }}>
                    Las contraseñas no coinciden.
                  </p>
                )}
              </div>

              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded accent-[#00A6FF] cursor-pointer flex-shrink-0"
                />
                <span className="text-sm leading-snug" style={{ color: textSub }}>
                  Acepto los{" "}
                  <Link href="/terminos" className="font-semibold hover:opacity-75" style={{ color: "#00A6FF" }}>
                    términos y condiciones
                  </Link>{" "}
                  y la{" "}
                  <Link href="/privacidad" className="font-semibold hover:opacity-75" style={{ color: "#00A6FF" }}>
                    política de privacidad
                  </Link>
                  .
                </span>
              </label>

              {serverError && (
                <p className="text-xs px-1 text-center" style={{ color: "#EF4444" }}>
                  {serverError}
                </p>
              )}

              <button
                type="submit"
                disabled={passwordMismatch || !acceptTerms || loading}
                className="w-full rounded-full py-3 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#00A6FF" }}
              >
                {loading ? "Creando cuenta..." : "Crear cuenta →"}
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ backgroundColor: dividerColor }} />
                <span className="text-xs" style={{ color: isDark ? "#475569" : "#94A3B8" }}>o</span>
                <div className="flex-1 h-px" style={{ backgroundColor: dividerColor }} />
              </div>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 rounded-full py-3 text-sm font-semibold border transition-all hover:brightness-95 active:scale-[0.98]"
                style={{
                  backgroundColor: "transparent",
                  borderColor: dividerColor,
                  color: textMain,
                }}
              >
                <GoogleIcon />
                Registrarse con Google
              </button>

              <p className="text-center text-sm" style={{ color: textSub }}>
                ¿Ya tienes una cuenta?{" "}
                <Link href="/login" className="font-semibold hover:opacity-75" style={{ color: "#00A6FF" }}>
                  Iniciar sesión
                </Link>
              </p>
            </form>
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
