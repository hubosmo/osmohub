// Garante que toda server action em src/lib/actions/ começa com `await requireAdmin()`,
// exceto os arquivos de actions públicas listados abaixo (login/logout, busca, último tópico do próprio aluno).
// Arquivo novo em lib/actions/ é tratado como admin por padrão: se for público, adicioná-lo à lista com justificativa no PR.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";

const ACTIONS_DIR = join(process.cwd(), "src", "lib", "actions");
const PUBLIC_ACTION_FILES = new Set([
  "auth.ts", // logout: só encerra a própria sessão
  "search.ts", // busca de tópicos publicados
  "content-ultimo-topico.ts", // grava o último tópico do usuário da sessão
]);

function isRequireAdminCall(stmt) {
  if (!stmt || !ts.isExpressionStatement(stmt)) return false;
  const e = stmt.expression;
  return (
    ts.isAwaitExpression(e) &&
    ts.isCallExpression(e.expression) &&
    ts.isIdentifier(e.expression.expression) &&
    e.expression.expression.text === "requireAdmin"
  );
}

const problems = [];
let guarded = 0;

for (const name of readdirSync(ACTIONS_DIR).filter((f) => f.endsWith(".ts"))) {
  if (PUBLIC_ACTION_FILES.has(name)) continue;
  const file = join(ACTIONS_DIR, name);
  const sf = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);

  for (const stmt of sf.statements) {
    const isExported = ts.canHaveModifiers(stmt) && ts.getModifiers(stmt)?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    if (!isExported) continue;
    const line = sf.getLineAndCharacterOfPosition(stmt.getStart()).line + 1;

    if (ts.isTypeAliasDeclaration(stmt) || ts.isInterfaceDeclaration(stmt)) continue;
    if (!ts.isFunctionDeclaration(stmt) || !stmt.body) {
      problems.push(`${name}:${line} export que não é "export async function": converter para function declaration`);
    } else if (!isRequireAdminCall(stmt.body.statements[0])) {
      problems.push(`${name}:${line} ${stmt.name?.text ?? "(anônima)"} não começa com "await requireAdmin();"`);
    } else {
      guarded++;
    }
  }
}

if (problems.length) {
  console.error("Server actions sem proteção de admin:\n" + problems.map((p) => "  - " + p).join("\n"));
  process.exit(1);
}
console.log(`Autorização OK. ${guarded} actions de admin protegidas.`);
