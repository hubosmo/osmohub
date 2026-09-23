import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminNavGuard } from "@/components/admin/AdminNavGuard";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AdminLayout>
      <AdminNavGuard />
      {children}
    </AdminLayout>
  );
}
