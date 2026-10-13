"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";

export async function salvarUltimoTopico(topicoId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) return;

  await prisma.user.update({
    where: { id: user.id },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { ultimo_topico_id: topicoId } as any,
  });
}
