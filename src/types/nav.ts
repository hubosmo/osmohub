export type NavArea = { id: string; slug: string; nome: string };
export type NavDisciplina = { id: string; slug: string; nome: string; cor_destaque: string | null; areas: NavArea[] };
export type NavCurso = { id: string; slug: string; nome: string; disciplinas: NavDisciplina[] };
