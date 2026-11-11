import { getSessionUser } from "@/lib/auth/session";
import { getPaginaNovedades } from "@/lib/db/novedades";
import { NOVEDADES_POR_PAGINA } from "@/lib/novedades";
import { NovedadesLista } from "@/components/student/novedades/NovedadesLista";

export const metadata = { title: "Novedades · Osmo" };

export default async function NovedadesPage() {
  const user = await getSessionUser();
  const { items, total } = await getPaginaNovedades(user?.id ?? null, 0, NOVEDADES_POR_PAGINA).catch(() => ({ items: [], total: 0 }));

  return (
    <div className="mx-auto max-w-2xl py-4">
      <h1 className="mb-1 text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Novedades</h1>
      <p className="mb-6 text-sm" style={{ color: "var(--text-muted)" }}>Lo último que agregamos y mejoramos en Osmo.</p>
      <NovedadesLista inicial={items} total={total} />
    </div>
  );
}
