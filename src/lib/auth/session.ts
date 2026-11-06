import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

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
