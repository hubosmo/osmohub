import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="text-6xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          <span style={{ color: "var(--accent)" }}>⊙</span> OSMO
        </div>
        <p className="text-lg tracking-widest uppercase" style={{ color: "var(--text-secondary)" }}>
          Ciências que Conectam
        </p>
      </div>

      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-6 py-3 rounded-lg font-semibold transition-colors"
          style={{
            backgroundColor: "var(--accent)",
            color: "var(--text-inverse)",
          }}
        >
          Entrar
        </Link>
        <Link
          href="/cadastro"
          className="px-6 py-3 rounded-lg font-semibold border transition-colors"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-primary)",
          }}
        >
          Criar conta
        </Link>
      </div>
    </main>
  );
}
