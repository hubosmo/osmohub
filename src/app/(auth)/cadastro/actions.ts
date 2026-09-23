"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";

interface SignUpResult {
  error?: string;
}

export async function signUpAction(
  name: string,
  email: string,
  password: string
): Promise<SignUpResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    if (error.message.includes("already registered") || error.message.includes("already exists")) {
      return { error: "Ya existe una cuenta con este correo. Intenta iniciar sesión." };
    }
    if (error.message.includes("Password should be")) {
      return { error: "La contraseña debe tener al menos 6 caracteres." };
    }
    return { error: "Ocurrió un error al crear la cuenta. Intenta nuevamente." };
  }

  // Sync auth user → tabela users do Prisma
  if (data.user) {
    await prisma.user.upsert({
      where: { id: data.user.id },
      create: {
        id: data.user.id,
        email: data.user.email!,
        nome: name.trim() || email.split("@")[0],
      },
      update: {},
    });
  }

  return {};
}
