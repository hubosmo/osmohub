import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Rotas protegidas — exigem autenticação
  const isStudentRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/cursos") ||
    pathname.startsWith("/quizzes") ||
    pathname.startsWith("/plan-de-estudios") ||
    pathname.startsWith("/simulaciones") ||
    pathname.startsWith("/biblioteca") ||
    pathname.startsWith("/configuracion");

  const isAdminRoute = pathname.startsWith("/admin");
  const isProtected = isStudentRoute || isAdminRoute;

  function redirectToLogin() {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Sem Supabase configurado só se deixa passar fora de produção
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (isProtected && process.env.NODE_ENV === "production") return redirectToLogin();
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Não foi possível validar a sessão: tratar como não autenticado (falha fechada)
    user = null;
  }

  if (isProtected && !user) return redirectToLogin();

  // O papel ADMIN NÃO é checado aqui: o middleware roda no edge, sem Prisma, e o papel
  // pode estar só na tabela `users`. A checagem fica em (admin)/layout.tsx e em cada
  // server action de admin (lib/auth/admin.ts). Ver docs/decisions/0011.

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
