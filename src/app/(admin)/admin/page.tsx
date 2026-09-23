import Link from "next/link";
import { BookOpen, Layers, FolderOpen, FileText, Users } from "lucide-react";
import { getStatsAdmin } from "@/lib/db/admin";

export const metadata = { title: "Dashboard Admin | Osmo" };

export default async function AdminPage() {
  const stats = await getStatsAdmin().catch(() => ({
    cursos: 0, disciplinas: 0, areas: 0, topicos: 0, usuarios: 0,
  }));

  const cards = [
    { label: "Cursos", value: stats.cursos, icon: BookOpen, href: "/admin/cursos", color: "#00A6FF" },
    { label: "Materias", value: stats.disciplinas, icon: Layers, href: "/admin/cursos", color: "#6C63FF" },
    { label: "Unidades", value: stats.areas, icon: FolderOpen, href: "/admin/cursos", color: "#22C55E" },
    { label: "Tópicos", value: stats.topicos, icon: FileText, href: "/admin/cursos", color: "#F59E0B" },
    { label: "Usuarios", value: stats.usuarios, icon: Users, href: "/admin/usuarios", color: "#EC4899" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Panel de administración
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Gestiona el contenido de la plataforma Osmo
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 mb-8">
        {cards.map(({ label, value, icon: Icon, href, color }) => (
          <Link
            key={label}
            href={href}
            className="flex flex-col gap-3 rounded-xl p-5 transition-shadow hover:shadow-md"
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + "22" }}>
              <Icon className="h-5 w-5" style={{ color }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div
        className="rounded-xl p-6"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <h2 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          Acciones rápidas
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/cursos"
            className="px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: "var(--accent)" }}
          >
            + Nuevo curso
          </Link>
          <Link
            href="/cursos"
            target="_blank"
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: "var(--bg-elevated)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            Ver plataforma →
          </Link>
        </div>
      </div>
    </div>
  );
}
