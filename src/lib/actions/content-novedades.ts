"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { criarNovedadDb, eliminarNovedadDb } from "@/lib/db/novedades";
import { ETIQUETAS_NOVEDAD, TIPOS_NOVEDAD } from "@/lib/novedades";

const novedadSchema = z.object({
  tipo: z.enum(TIPOS_NOVEDAD),
  etiqueta: z.enum(ETIQUETAS_NOVEDAD),
  titulo: z.string().trim().min(1, "Título obligatorio").max(120),
  resumen: z.string().trim().max(300).optional(),
  topico_id: z.string().uuid().optional(),
});

function revalidate() {
  revalidatePath("/admin/novedades");
  revalidatePath("/novedades");
  // O sino fica no layout do aluno, então a lista do layout também precisa ser refeita
  revalidatePath("/", "layout");
}

export async function criarNovedad(fd: FormData): Promise<void> {
  await requireAdmin();
  const texto = (k: string) => {
    const v = (fd.get(k) as string | null)?.trim();
    return v ? v : undefined;
  };
  const dados = novedadSchema.safeParse({
    tipo: fd.get("tipo"),
    etiqueta: fd.get("etiqueta"),
    titulo: fd.get("titulo") ?? "",
    resumen: texto("resumen"),
    topico_id: texto("topico_id"),
  });
  if (!dados.success) throw new Error(dados.error.issues[0].message);
  await criarNovedadDb({ ...dados.data, resumen: dados.data.resumen ?? null, topico_id: dados.data.topico_id ?? null });
  revalidate();
}

export async function eliminarNovedad(id: string): Promise<void> {
  await requireAdmin();
  if (!z.string().uuid().safeParse(id).success) throw new Error("Id inválido");
  await eliminarNovedadDb(id);
  revalidate();
}
