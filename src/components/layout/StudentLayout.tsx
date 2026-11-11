import { StudentHeader } from "./StudentHeader";
import { PageTransition } from "./PageTransition";
import { UserProvider } from "@/components/providers/UserProvider";
import type { NavCurso } from "@/types/nav";
import type { NovedadesResumen } from "@/lib/novedades";

interface StudentLayoutProps {
  children: React.ReactNode;
  userName?: string;
  userEmail?: string;
  isAdmin?: boolean;
  navData?: NavCurso[];
  novedades?: NovedadesResumen;
}

export function StudentLayout({ children, userName, userEmail, isAdmin, navData, novedades }: StudentLayoutProps) {
  return (
    <UserProvider userName={userName ?? "Estudiante"} userEmail={userEmail} isAdmin={isAdmin}>
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg-base)" }}>
        <StudentHeader userName={userName} userEmail={userEmail} isAdmin={isAdmin} navData={navData} novedades={novedades} />
        <main className="flex-1 w-full px-4 lg:px-8 py-6" style={{ overflowX: "clip" }}>
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </UserProvider>
  );
}
