"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { loginAction } from "./actions";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthGoogleOption } from "@/components/auth/AuthGoogleOption";
import { useAuthTheme } from "@/components/auth/useAuthTheme";

export default function LoginPage() {
  const { textMain, textSub } = useAuthTheme();
  const router = useRouter();
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [loading, setLoading]       = useState(false);
  const [serverError, setServerError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setServerError("");
    setLoading(true);
    const result = await loginAction(email, password);
    setLoading(false);
    if (result.error) { setServerError(result.error); return; }
    router.push("/dashboard");
  }

  return (
    <AuthShell logoId="login" animatedLogo>
      <div className="w-full max-w-[400px] flex flex-col gap-5 mx-auto">

        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: textMain }}>
            ¡Bienvenido!
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: textSub }}>
            Ingresa tus credenciales para continuar aprendiendo.
          </p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <AuthInput
            id="email"
            label="Correo electrónico"
            type="email"
            placeholder="gavin@hooli.com"
            autoComplete="email"
            value={email}
            onChange={setEmail}
            icon={Mail}
          />

          <AuthInput
            id="password"
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
            icon={Lock}
          />

          {/* Lembrar + esqueci — empilha em telas muito pequenas */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded accent-[#00A6FF] cursor-pointer"
              />
              <span className="text-sm" style={{ color: textSub }}>
                Mantenerme conectado
              </span>
            </label>
            <Link
              href="/recuperar-senha"
              className="text-sm font-medium transition-opacity hover:opacity-75"
              style={{ color: "#00A6FF" }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {serverError && (
            <p className="text-xs px-1 text-center" style={{ color: "#EF4444" }}>
              {serverError}
            </p>
          )}

          <LoadingButton type="submit" loading={loading} loadingText="Entrando…">
            Entrar →
          </LoadingButton>

          <AuthGoogleOption label="Entrar con Google" />

          <p className="text-center text-sm" style={{ color: textSub }}>
            ¿No tienes cuenta?{" "}
            <Link
              href="/cadastro"
              className="font-semibold hover:opacity-75 transition-opacity"
              style={{ color: "#00A6FF" }}
            >
              Regístrate gratis
            </Link>
          </p>
        </form>
      </div>
    </AuthShell>
  );
}
