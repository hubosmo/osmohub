import Link from "next/link";
import {
  LayoutDashboard,
  BookOpen,
  Gamepad2,
  HelpCircle,
  Users,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/disciplinas", label: "Materias", icon: BookOpen },
  { href: "/admin/simulaciones", label: "Simulaciones", icon: Gamepad2 },
  { href: "/admin/quizzes", label: "Quizzes", icon: HelpCircle },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-bg-base">
      {/* Sidebar admin */}
      <aside className="flex w-60 flex-col border-r border-border bg-bg-surface">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link href="/admin" className="text-xl font-bold text-accent-brand">
            Osmo <span className="text-xs text-text-muted font-normal ml-1">Admin</span>
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-2 pt-4">
          {ADMIN_NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors"
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-end border-b border-border bg-bg-surface px-6">
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
