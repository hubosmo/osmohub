import { createClient } from "@/lib/supabase/server";
import { UserProvider } from "@/components/providers/UserProvider";

export default async function QuizLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const userName =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "Estudiante";

  return (
    <UserProvider userName={userName}>
      {children}
    </UserProvider>
  );
}
