import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FolderOpen } from "lucide-react";
import { getSessionUser } from "@/lib/auth/session";
import { listarPastasDoUsuario } from "@/lib/db/pastas";
import { nivelMaisFundoDaArvore } from "@/lib/pastas";
import { PlanoShell } from "@/components/student/pastas/PlanoShell";
import { PastaCard } from "@/components/student/pastas/PastaCard";
import { NuevaPastaCard } from "@/components/student/pastas/NuevaPastaCard";
import { PastaAcoes } from "@/components/student/pastas/PastaAcoes";

export const metadata: Metadata = { title: "Mi plan" };

export default async function PlanDeEstudiosPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const todas = await listarPastasDoUsuario(user.id);
  const raiz = todas.filter((p) => p.pai_id === null);

  return (
    <PlanoShell migalhas={[]}>
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Mi plan</h1>
      <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
        Organiza tu estudio en carpetas y guarda en ellas los temas que quieres repasar.
      </p>

      {raiz.length === 0 && (
        <div className="flex flex-col items-center py-10 text-center">
          <FolderOpen className="h-10 w-10 mb-3 opacity-25" style={{ color: "var(--text-muted)" }} aria-hidden="true" />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aún no tienes carpetas. Crea la primera.</p>
        </div>
      )}

      <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
        {raiz.map((p) => (
          <PastaCard
            key={p.id} variante="alta" href={`/plan-de-estudios/${p.id}`}
            nome={p.nome} descricao={p.descricao} subpastas={p._count.filhas} temas={p._count.itens}
            menu={<PastaAcoes variante="menu" pastaId={p.id} nome={p.nome} descricao={p.descricao} niveis={{ atual: p.niveis_max, minimo: nivelMaisFundoDaArvore(todas, p.id) }} />}
          />
        ))}
        <NuevaPastaCard paiId={null} variante="alta" />
      </div>
    </PlanoShell>
  );
}
