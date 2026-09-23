import { getDashboardCursos } from "@/lib/db/cursos";
import { TodosCursos } from "@/components/student/TodosCursos";

export const metadata = { title: "Cursos | Osmo" };

export default async function CursosPage() {
  const cursos = await getDashboardCursos().catch(() => []);
  return (
    <div className="-mx-4 lg:-mx-8 -mt-6">
      <TodosCursos cursos={cursos} />
    </div>
  );
}
