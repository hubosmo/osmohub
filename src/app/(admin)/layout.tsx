import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminNavGuard } from "@/components/admin/AdminNavGuard";
import { getAdminUser } from "@/lib/auth/admin";

export default async function Layout({ children }: { children: React.ReactNode }) {
  if (!(await getAdminUser())) redirect("/dashboard");

  return (
    <AdminLayout>
      <AdminNavGuard />
      {children}
    </AdminLayout>
  );
}
