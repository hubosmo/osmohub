// `prisma migrate dev` pode propor resetar o banco (apaga todos os dados). Só roda contra banco local.
// Para aplicar migrations no Supabase use `npm run db:deploy`, que nunca apaga dados.
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

let host = "";
try {
  host = new URL(process.env.DATABASE_URL ?? "").hostname;
} catch {
  // sem DATABASE_URL válida: tratado como remoto
}

if (!LOCAL_HOSTS.has(host)) {
  console.error(
    `Bloqueado: DATABASE_URL aponta para "${host || "(vazio)"}", que não é um banco local.\n` +
      "  - Para criar uma migration: suba um banco local (npx prisma dev -n osmo -d) e rode\n" +
      "    DATABASE_URL=<url local> DIRECT_URL=<url local> npm run db:migrate\n" +
      "  - Para aplicar migrations no Supabase: npm run db:deploy"
  );
  process.exit(1);
}
