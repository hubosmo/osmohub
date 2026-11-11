import { PageTransition } from "./PageTransition";
import { AdminSidebar } from "./AdminSidebar";
import { ThemeToggle } from "./ThemeToggle";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-bg-base">
      <AdminSidebar />

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-end border-b border-border bg-bg-surface px-6">
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-y-auto p-6"><PageTransition>{children}</PageTransition></main>
      </div>
    </div>
  );
}
