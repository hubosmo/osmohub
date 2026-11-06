"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MailCheck, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { AuthShell } from "@/components/auth/AuthShell";
import { useAuthTheme } from "@/components/auth/useAuthTheme";

function VerificarEmailContent() {
  const { isDark, dividerColor, textMain, textSub } = useAuthTheme();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [resent, setResent]       = useState(false);
  const [resending, setResending] = useState(false);

  async function handleResend() {
    setResending(true);
    await new Promise((r) => setTimeout(r, 1200));
    setResending(false);
    setResent(true);
  }

  return (
    <AuthShell logoId="verify">
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
              className="w-full flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold border transition-all hover:brightness-95 active:scale-[0.98] disabled:opacity-60"
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
    </AuthShell>
  );
}

export default function VerificarEmailPage() {
  return (
    <Suspense>
      <VerificarEmailContent />
    </Suspense>
  );
}
