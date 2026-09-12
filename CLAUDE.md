# Osmo — Plataforma Educacional

> "Ciências que Conectam"

## Visão Geral

Osmo é uma plataforma educacional interativa voltada para ciências (Anatomia, Fisiologia, Farmacologia, Bioquímica, Física, Biologia, etc.). O aluno navega por disciplinas, áreas e tópicos, consumindo vídeos, artigos interativos e simulações/jogos, além de poder montar um plano de estudos personalizado.

Referência de experiência: **Kenhub**.

---

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Estilização | Tailwind CSS + shadcn/ui |
| Banco de dados | Supabase (PostgreSQL) |
| ORM | Prisma |
| Autenticação | Supabase Auth |
| Vídeo | Mux (streaming adaptativo) |
| Storage | Supabase Storage / Cloudflare R2 |
| Editor de artigos | Tiptap (editor baseado em blocos) |
| Estado cliente | Zustand |
| Data fetching | TanStack Query |
| Deploy | Vercel (frontend) + Supabase (backend) |

---

## Estrutura de Pastas

```
src/
├── app/
│   ├── (marketing)/        # landing page pública
│   ├── (auth)/             # login, cadastro, recuperação de senha
│   ├── (student)/          # área do aluno
│   │   ├── dashboard/
│   │   ├── disciplinas/
│   │   │   └── [disciplina]/
│   │   │       └── [area]/
│   │   │           └── [topico]/   # página unificada: vídeo + artigo + simulação
│   │   ├── plano-de-estudos/
│   │   └── simulacoes/
│   ├── (admin)/            # painel administrativo
│   │   ├── disciplinas/
│   │   ├── artigos/
│   │   ├── simulacoes/
│   │   ├── quizzes/
│   │   └── usuarios/
│   └── api/
├── components/
│   ├── ui/                 # shadcn/ui base
│   ├── layout/             # header, sidebar, nav
│   ├── student/            # componentes da área do aluno
│   ├── admin/              # componentes do painel admin
│   ├── editor/             # editor Tiptap + extensões de bloco
│   └── simulations/        # tipos de simulação renderizáveis
│       ├── DragAndDrop.tsx
│       ├── FillInBlank.tsx
│       ├── Matching.tsx
│       └── CustomHtml.tsx  # simulações avançadas via iframe sandboxed
├── lib/
│   ├── db/                 # queries Prisma por entidade
│   ├── auth/
│   ├── video/              # integração Mux
│   └── utils/
├── hooks/
├── types/
└── prisma/
    └── schema.prisma
```

---

## Convenções de Código

- **TypeScript estrito** — sem `any`, tipos explícitos em funções públicas
- **Componentes**: PascalCase (`StudentDashboard.tsx`)
- **Funções/hooks**: camelCase (`useStudyPlan.ts`)
- **Arquivos de rota**: kebab-case (convenção Next.js)
- **Imports**: absolutos via `@/` (configurado em tsconfig)
- **Server Components por padrão** — usar `'use client'` apenas quando necessário
- **Queries de banco** ficam em `lib/db/`, nunca inline em componentes
- **Variáveis de ambiente** sempre tipadas em `lib/env.ts` com validação Zod

---

## Temas

A plataforma suporta tema **escuro** e **claro**. Ver `docs/brand.md` para paleta completa e tokens CSS.

- Implementado via `class` no `<html>` (`dark` / `light`)
- Tokens CSS em `globals.css`
- Nunca hardcodar cores — sempre usar tokens/variáveis

---

## Documentação Relacionada

- [Brand & Design System](docs/brand.md)
- [Arquitetura Técnica](docs/architecture.md)
- [Modelo de Conteúdo](docs/content-model.md)
- [Funcionalidades](docs/features.md)
- [Schema do Banco](docs/database-schema.md)
