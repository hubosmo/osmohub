import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";

// Papel ADMIN vem de `app_metadata` (só o servidor grava) ou da tabela `users`.
// Nunca usar `user_metadata`: o próprio usuário consegue editá-lo.
export async function isAdminUser(user: User): Promise<boolean> {
  if (user.app_metadata?.role === "ADMIN") return true;
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    return dbUser?.role === "ADMIN";
  } catch {
    // Banco indisponível: aceita só o e-mail do admin (env) e apenas se confirmado
    const adminEmail = process.env.ADMIN_EMAIL;
    return !!adminEmail && !!user.email_confirmed_at && user.email === adminEmail;
  }
}

export async function getAdminUser(): Promise<User | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return (await isAdminUser(user)) ? user : null;
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<User> {
  const user = await getAdminUser();
  if (!user) throw new Error("No autorizado");
  return user;
}
