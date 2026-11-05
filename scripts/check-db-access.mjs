// "Queries de banco ficam em lib/db/, nunca inline em componentes" (CLAUDE.md).
// Falha se um arquivo fora de src/lib/ importar o cliente do Prisma. Exceções ficam listadas com o motivo.
import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
// caminho -> motivo. Hoje não há exceções; adicionar aqui só com justificativa.
const ALLOWED = new Map();

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = join(dir, e.name);
    if (e.isDirectory()) return walk(full);
    return /\.(ts|tsx)$/.test(e.name) ? [full] : [];
  });
}

const violations = [];
for (const file of walk(join(ROOT, "src"))) {
  const rel = relative(ROOT, file).split(sep).join("/");
  if (rel.startsWith("src/lib/") || ALLOWED.has(rel)) continue;
  if (/from\s+["']@\/lib\/db\/prisma["']/.test(readFileSync(file, "utf8"))) violations.push(rel);
}

if (violations.length) {
  console.error("Acesso direto ao Prisma fora de src/lib/ (mover a query para lib/db/):\n" + violations.map((v) => "  - " + v).join("\n"));
  process.exit(1);
}
console.log(`Acesso a dados OK. ${ALLOWED.size} exceções registradas.`);
