// "Nunca hardcodar cores: usar tokens/variáveis" (CLAUDE.md e docs/design-system.md).
// Catraca: conta literais hex de 6 ou 8 dígitos por arquivo em src/. Um arquivo não pode ganhar hex nem passar a ter.
// Os que já existem (dado do usuário, SVG da marca, canvas, metadados, paleta das telas de auth) ficam no baseline;
// ao migrar um para token, rode `npm run check:colors -- --write-baseline` para baixar o teto.
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const BASELINE_PATH = join(ROOT, "scripts", "color-baseline.json");
const HEX = /#[0-9a-fA-F]{6}(?:[0-9a-fA-F]{2})?\b/g;

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = join(dir, e.name);
    if (e.isDirectory()) return walk(full);
    return /\.(ts|tsx)$/.test(e.name) ? [full] : [];
  });
}

const counts = {};
for (const file of walk(join(ROOT, "src"))) {
  const n = (readFileSync(file, "utf8").match(HEX) ?? []).length;
  if (n > 0) counts[relative(ROOT, file).split(sep).join("/")] = n;
}

if (process.argv.includes("--write-baseline")) {
  writeFileSync(BASELINE_PATH, JSON.stringify(counts, null, 2) + "\n");
  console.log(`Baseline gravado: ${Object.values(counts).reduce((a, b) => a + b, 0)} hex em ${Object.keys(counts).length} arquivos.`);
  process.exit(0);
}

const baseline = existsSync(BASELINE_PATH) ? JSON.parse(readFileSync(BASELINE_PATH, "utf8")) : {};
const errors = [];
for (const [file, n] of Object.entries(counts)) {
  const ceiling = baseline[file] ?? 0;
  if (n > ceiling) errors.push(`${file}: ${n} hex (teto ${ceiling}). Use var(--accent | --success | --error | --warning | --text-* | --bg-*).`);
}

if (errors.length) {
  console.error("Cor hardcoded nova:\n" + errors.map((e) => "  - " + e).join("\n"));
  process.exit(1);
}

const total = Object.values(counts).reduce((a, b) => a + b, 0);
const shrunk = Object.entries(baseline).filter(([f, c]) => (counts[f] ?? 0) < c).length;
console.log(`Cores OK. ${total} hex em ${Object.keys(counts).length} arquivos (dívida registrada).`);
if (shrunk) console.log(`${shrunk} arquivo(s) diminuíram: rode "npm run check:colors -- --write-baseline" para baixar o teto.`);
