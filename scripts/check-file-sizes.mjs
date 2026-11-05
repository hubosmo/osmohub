// Verifica os limites de tamanho do CLAUDE.md. Arquivos que já passavam do limite ficam
// registrados em file-size-baseline.json: eles não podem crescer, e quem reduzir deve rodar
// `npm run check:size -- --write-baseline` para baixar o teto.
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const BASELINE_PATH = join(ROOT, "scripts", "file-size-baseline.json");

const RULES = [
  { name: "page.tsx", limit: 200, match: (p) => p.endsWith("/page.tsx") },
  { name: "lib/actions", limit: 300, match: (p) => p.startsWith("src/lib/actions/") },
  { name: "lib/db", limit: 400, match: (p) => p.startsWith("src/lib/db/") },
  { name: "components/layout", limit: 400, match: (p) => p.startsWith("src/components/layout/") },
];

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = join(dir, e.name);
    if (e.isDirectory()) return walk(full);
    return /\.(ts|tsx)$/.test(e.name) ? [full] : [];
  });
}

const lines = (file) => readFileSync(file, "utf8").split("\n").length;
const files = walk(join(ROOT, "src")).map((f) => relative(ROOT, f).split(sep).join("/"));

const over = {};
for (const f of files) {
  const rule = RULES.find((r) => r.match(f));
  if (!rule) continue;
  const n = lines(join(ROOT, f));
  if (n > rule.limit) over[f] = { lines: n, limit: rule.limit };
}

if (process.argv.includes("--write-baseline")) {
  const out = Object.fromEntries(Object.entries(over).map(([f, v]) => [f, v.lines]));
  writeFileSync(BASELINE_PATH, JSON.stringify(out, null, 2) + "\n");
  console.log(`Baseline gravado com ${Object.keys(out).length} arquivos.`);
  process.exit(0);
}

const baseline = existsSync(BASELINE_PATH) ? JSON.parse(readFileSync(BASELINE_PATH, "utf8")) : {};
const errors = [];
for (const [f, v] of Object.entries(over)) {
  const ceiling = baseline[f];
  if (ceiling === undefined) errors.push(`${f}: ${v.lines} linhas (limite ${v.limit}). Dividir antes de seguir.`);
  else if (v.lines > ceiling) errors.push(`${f}: cresceu de ${ceiling} para ${v.lines} linhas (limite ${v.limit}). Extrair em vez de aumentar.`);
}

const shrunk = Object.entries(baseline).filter(([f, c]) => !over[f] || over[f].lines < c).length;
if (errors.length) {
  console.error("Limites de tamanho violados:\n" + errors.map((e) => "  - " + e).join("\n"));
  process.exit(1);
}
console.log(`Tamanhos OK. ${Object.keys(over).length} arquivos acima do limite (dívida registrada).`);
if (shrunk) console.log(`${shrunk} arquivo(s) diminuíram: rode "npm run check:size -- --write-baseline" para baixar o teto.`);
