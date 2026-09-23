import { StudentHeader } from "./StudentHeader";
import { UserProvider } from "@/components/providers/UserProvider";
import type { NavCurso } from "@/types/nav";

interface StudentLayoutProps {
  children: React.ReactNode;
  userName?: string;
  userEmail?: string;
  isAdmin?: boolean;
  navData?: NavCurso[];
}

export function StudentLayout({ children, userName, userEmail, isAdmin, navData }: StudentLayoutProps) {
  return (
    <UserProvider userName={userName ?? "Estudiante"} userEmail={userEmail} isAdmin={isAdmin}>
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg-base)" }}>
        <StudentHeader userName={userName} userEmail={userEmail} isAdmin={isAdmin} navData={navData} />
        <main className="flex-1 w-full px-4 lg:px-8 py-6" style={{ overflowX: "clip" }}>
          {children}
        </main>
      </div>
    </UserProvider>
  );
}
