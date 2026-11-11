import { getSessionUser } from "@/lib/auth/session";
import { getNovedadesDelAlumno } from "@/lib/db/novedades";
import { NovedadItem } from "@/components/student/novedades/NovedadItem";

export const metadata = { title: "Novedades · Osmo" };

export default async function NovedadesPage() {
  const user = await getSessionUser();
  const { items } = await getNovedadesDelAlumno(user?.id ?? null, 100).catch(() => ({ items: [] }));

  return (
    <div className="mx-auto max-w-2xl py-4">
      <h1 className="mb-1 text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Novedades</h1>
      <p className="mb-6 text-sm" style={{ color: "var(--text-muted)" }}>Lo último que agregamos y mejoramos en Osmo.</p>

      {items.length === 0 ? (
        <p className="py-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>Aún no hay novedades.</p>
      ) : (
        <div className="overflow-hidden rounded-xl" style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-surface)" }}>
          {items.map((item) => <NovedadItem key={item.id} item={item} />)}
        </div>
      )}
    </div>
  );
}
