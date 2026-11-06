import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { sincronizarUsuario } from "@/lib/db/users";

// Usuário da sessão atual, ou null. `cache` evita repetir a chamada ao Supabase Auth dentro da mesma requisição.
export const getSessionUser = cache(async (): Promise<User | null> => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
});

// Usuário da sessão com a linha em users garantida. Para actions do aluno que gravam algo ligado ao usuário por chave estrangeira.
export async function getUsuarioSincronizado(): Promise<User | null> {
  const user = await getSessionUser();
  if (!user?.email) return null;
  await sincronizarUsuario({
    id: user.id,
    email: user.email,
    nome: (user.user_metadata?.full_name as string | undefined) ?? user.email.split("@")[0],
  });
  return user;
}
