import { z } from "zod";

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // Database
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1).optional(),

  // Mux (vídeo)
  MUX_TOKEN_ID: z.string().min(1).optional(),
  MUX_TOKEN_SECRET: z.string().min(1).optional(),
  MUX_WEBHOOK_SECRET: z.string().min(1).optional(),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

// Valida no startup — falha rápido com mensagem clara
function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Variáveis de ambiente inválidas:");
    console.error(result.error.flatten().fieldErrors);
    throw new Error("Variáveis de ambiente inválidas. Verifique o .env.local");
  }
  return result.data;
}

// Em produção/build valida sempre; em desenvolvimento é lazy para não bloquear
export const env = process.env.NODE_ENV === "test"
  ? (process.env as unknown as Env)
  : validateEnv();
