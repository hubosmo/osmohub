export const OTHER_NAV = [
  { href: "/plano-de-estudios", label: "MI PLAN" },
  { href: "/simulacoes", label: "SIMULACIONES" },
];

export function isCursosActive(pathname: string) {
  return pathname === "/cursos" || pathname.startsWith("/cursos/");
}

export function isPathActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}
