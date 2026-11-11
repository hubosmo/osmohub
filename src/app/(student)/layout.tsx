import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/auth/admin";
import { getNavData } from "@/lib/db/cursos";
import { getNovedadesDelAlumno } from "@/lib/db/novedades";
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
  // Se as tabelas de novedades ainda não existem no banco, o sino simplesmente fica vazio
  const novedades = await getNovedadesDelAlumno(user?.id ?? null, 8).catch(() => ({ items: [], nuevas: 0 }));

  return (
    <StudentLayout userName={userName} userEmail={userEmail} isAdmin={isAdmin} navData={navData} novedades={novedades}>
      {children}
    </StudentLayout>
  );
}
