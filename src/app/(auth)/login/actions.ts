"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";

interface LoginResult {
  error?: string;
}

export async function loginAction(email: string, password: string): Promise<LoginResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.includes("Invalid login credentials") || error.message.includes("invalid_credentials")) {
      return { error: "Correo o contraseña incorrectos." };
    }
    if (error.message.includes("Email not confirmed")) {
      return { error: "Debes confirmar tu correo antes de iniciar sesión." };
    }
    return { error: "Ocurrió un error al iniciar sesión. Intenta nuevamente." };
  }

  // Sync auth user → tabela users do Prisma (falha silenciosa — login não depende disso)
  if (data.user) {
    try {
      await prisma.user.upsert({
        where: { id: data.user.id },
        create: {
          id: data.user.id,
          email: data.user.email!,
          nome:
            (data.user.user_metadata?.full_name as string | undefined) ??
            email.split("@")[0],
        },
        update: {
          email: data.user.email!,
        },
      });
    } catch {
      // DB indisponível — o login com Supabase já foi bem-sucedido, continua
    }
  }

  return {};
}
