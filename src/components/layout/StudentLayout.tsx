import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface StudentLayoutProps {
  children: React.ReactNode;
  userName?: string;
  userEmail?: string;
}

export function StudentLayout({ children, userName, userEmail }: StudentLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-bg-base">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header userName={userName} userEmail={userEmail} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
