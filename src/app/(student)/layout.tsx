import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/auth/admin";
import { getNavData } from "@/lib/db/cursos";
import { StudentLayout } from "@/components/layout/StudentLayout";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const userName =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "Estudiante";
  const userEmail = user?.email ?? undefined;

  const isAdmin = user ? await isAdminUser(user) : false;

  const navData = await getNavData().catch(() => []);

  return (
    <StudentLayout userName={userName} userEmail={userEmail} isAdmin={isAdmin} navData={navData}>
      {children}
    </StudentLayout>
  );
}
