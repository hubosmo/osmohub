"use server";

import { createClient } from "@/lib/supabase/server";
import { sincronizarUsuario } from "@/lib/db/users";

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

  // Se falhar, a linha em users é criada no primeiro login
  if (data.user) {
    await sincronizarUsuario({
      id: data.user.id,
      email: data.user.email!,
      nome: name.trim() || email.split("@")[0],
    });
  }

  return {};
}
