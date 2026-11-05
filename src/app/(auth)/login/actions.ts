"use server";

import { createClient } from "@/lib/supabase/server";
import { sincronizarUsuario } from "@/lib/db/users";

interface LoginResult {
  error?: string;
}

export async function loginAction(email: string, password: string): Promise<LoginResult> {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return { error: "Error de configuración del servidor. Contacta al soporte." };
  }

  let data: Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>["data"];
  try {
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error) {
      const msg = result.error.message;
      if (msg.includes("Invalid login credentials") || msg.includes("invalid_credentials")) {
        return { error: "Correo o contraseña incorrectos." };
      }
      if (msg.includes("Email not confirmed")) {
        return { error: "Debes confirmar tu correo antes de iniciar sesión." };
      }
      return { error: "Ocurrió un error al iniciar sesión. Intenta nuevamente." };
    }
    data = result.data;
  } catch {
    return { error: "No se pudo conectar con el servidor de autenticación. Intenta nuevamente." };
  }

  if (data.user) {
    await sincronizarUsuario({
      id: data.user.id,
      email: data.user.email!,
      nome: (data.user.user_metadata?.full_name as string | undefined) ?? email.split("@")[0],
    });
  }

  return {};
}
