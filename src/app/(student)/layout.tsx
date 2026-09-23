import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
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

  let isAdmin = false;
  if (user?.id) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true },
      });
      isAdmin = dbUser?.role === "ADMIN";
    } catch {
      // Falha silenciosa — usuário continua como STUDENT
    }
  }

  const navData = await getNavData();

  return (
    <StudentLayout userName={userName} userEmail={userEmail} isAdmin={isAdmin} navData={navData}>
      {children}
    </StudentLayout>
  );
}
