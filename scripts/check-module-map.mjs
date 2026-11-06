// A "Regra de Ouro" do CLAUDE.md manda manter docs/module-map.json em dia. Verifica que todo arquivo citado por um
// módulo que não esteja "planned" existe de verdade. Módulos planejados podem citar arquivos que ainda vão ser criados.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const map = JSON.parse(readFileSync(join(ROOT, "docs", "module-map.json"), "utf8"));

const problems = [];
for (const [id, mod] of Object.entries(map.modules)) {
  if (mod.status === "planned") continue;
  const missing = (mod.files ?? []).filter((f) => !existsSync(join(ROOT, f)));
  if (missing.length) problems.push(`${id} [${mod.status}] cita arquivo(s) que não existem: ${missing.join(", ")}`);
}

if (problems.length) {
  console.error("docs/module-map.json desatualizado:\n" + problems.map((p) => "  - " + p).join("\n"));
  console.error('Atualize os arquivos do módulo, ou marque o módulo como "planned" se ainda não foi feito.');
  process.exit(1);
}
console.log(`Mapa de módulos OK. ${Object.keys(map.modules).length} módulos conferidos.`);
