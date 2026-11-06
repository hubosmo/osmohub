"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock } from "lucide-react";
import { signUpAction } from "./actions";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthGoogleOption } from "@/components/auth/AuthGoogleOption";
import { useAuthTheme } from "@/components/auth/useAuthTheme";

export default function CadastroPage() {
  const { textMain, textSub } = useAuthTheme();
  const router = useRouter();
  const [name, setName]                       = useState("");
  const [email, setEmail]                     = useState("");
  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms]         = useState(false);
  const [loading, setLoading]                 = useState(false);
  const [serverError, setServerError]         = useState("");

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
    <AuthShell logoId="cadastro" alignContent="start">
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
            className="w-full rounded-lg py-3 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#00A6FF" }}
          >
            {loading ? "Creando cuenta..." : "Crear cuenta →"}
          </button>

          <AuthGoogleOption label="Registrarse con Google" />

          <p className="text-center text-sm" style={{ color: textSub }}>
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="font-semibold hover:opacity-75" style={{ color: "#00A6FF" }}>
              Iniciar sesión
            </Link>
          </p>
        </form>
      </div>
    </AuthShell>
  );
}
