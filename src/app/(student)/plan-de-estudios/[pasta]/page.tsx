import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import { listarItensDaPasta, listarPastasDoUsuario } from "@/lib/db/pastas";
import { getStatusDosTopicos } from "@/lib/db/progresso";
import { aceitaSubpastas, nivelMaisFundoDaArvore } from "@/lib/pastas";
import type { StatusTopico } from "@/lib/progresso";
import { PlanoShell } from "@/components/student/pastas/PlanoShell";
import { PastaCard } from "@/components/student/pastas/PastaCard";
import { NuevaPastaCard } from "@/components/student/pastas/NuevaPastaCard";
import { PastaAcoes } from "@/components/student/pastas/PastaAcoes";
import { ItemPastaRow } from "@/components/student/pastas/ItemPastaRow";
import { BuscadorTemasPasta } from "@/components/student/pastas/BuscadorTemasPasta";

export const metadata: Metadata = { title: "Mi plan" };

interface PageProps {
  params: Promise<{ pasta: string }>;
}

export default async function PastaPage({ params }: PageProps) {
  const { pasta: pastaId } = await params;
  if (!z.string().uuid().safeParse(pastaId).success) notFound();

  const user = await getSessionUser();
  if (!user) redirect("/login");

  const todas = await listarPastasDoUsuario(user.id);
  const pasta = todas.find((p) => p.id === pastaId);
  if (!pasta) notFound();

  // Cadeia de pastas superiores, da raiz até esta
  const cadeia = [pasta];
  while (cadeia[0].pai_id) {
    const pai = todas.find((p) => p.id === cadeia[0].pai_id);
    if (!pai) break;
    cadeia.unshift(pai);
  }
  const voltarPara = pasta.pai_id ? `/plan-de-estudios/${pasta.pai_id}` : "/plan-de-estudios";

  // Os conteúdos ficam na pasta do último nível da árvore: é ali que aparece o buscador de temas
  const podeTerSubpastas = aceitaSubpastas(pasta.nivel, pasta.niveis_max);
  const subpastas = todas.filter((p) => p.pai_id === pasta.id);
  const itens = await listarItensDaPasta(user.id, pasta.id);
  const status: Record<string, StatusTopico | null> = await getStatusDosTopicos(user.id, itens.map((i) => i.topico.id)).catch(() => ({}));

  return (
    <PlanoShell migalhas={cadeia.map((p) => ({ nome: p.nome, href: `/plan-de-estudios/${p.id}` }))}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{pasta.nome}</h1>
        <PastaAcoes
          pastaId={pasta.id} nome={pasta.nome} descricao={pasta.descricao} voltarPara={voltarPara}
          niveis={pasta.pai_id === null ? { atual: pasta.niveis_max, minimo: nivelMaisFundoDaArvore(todas, pasta.id) } : undefined}
        />
      </div>
      {pasta.descricao && <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>{pasta.descricao}</p>}

      {podeTerSubpastas && (
        <section className="mt-6 mb-10">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>Subcarpetas</h2>
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
            {subpastas.map((p) => (
              <PastaCard
                key={p.id} variante="horizontal" href={`/plan-de-estudios/${p.id}`}
                nome={p.nome} descricao={p.descricao} subpastas={p._count.filhas} temas={p._count.itens}
                menu={<PastaAcoes variante="menu" pastaId={p.id} nome={p.nome} descricao={p.descricao} />}
              />
            ))}
            <NuevaPastaCard paiId={pasta.id} variante="horizontal" />
          </div>
        </section>
      )}

      {(!podeTerSubpastas || itens.length > 0) && (
        <section className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>Temas guardados</h2>
          {!podeTerSubpastas && <BuscadorTemasPasta pastaId={pasta.id} idsNaPasta={itens.map((i) => i.topico.id)} />}
          {itens.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Esta carpeta aún no tiene temas. Búscalos arriba o usa el marcador en la página de un tema.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {itens.map(({ topico, concluido }) => (
                <ItemPastaRow
                  key={topico.id} pastaId={pasta.id} topicoId={topico.id}
                  titulo={topico.titulo} descricao={topico.descricao_curta} concluido={concluido}
                  href={`/cursos/${topico.area.disciplina.curso.slug}/${topico.area.disciplina.slug}/${topico.area.slug}/${topico.slug}`}
                  status={status[topico.id] ?? null}
                />
              ))}
            </ul>
          )}
        </section>
      )}
    </PlanoShell>
  );
}
