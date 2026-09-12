# Osmo — Plataforma Educacional

> "Ciencias que Conectan"

## Idioma da Plataforma

**Espanhol latino-americano** (`es-419`). Todo texto visível ao usuário — UI, mensagens, metadados, labels, erros — deve estar em espanhol. Nunca usar português ou inglês no conteúdo voltado ao aluno.

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

- [Guia de Construção](docs/guia-construcao.md) ← **ler primeiro para saber onde estamos**
- [Mapa de Módulos](docs/module-map.json) ← **consultar antes de implementar qualquer módulo**
- [Brand & Design System](docs/brand.md)
- [Arquitetura Técnica](docs/architecture.md)
- [Modelo de Conteúdo](docs/content-model.md)
- [Funcionalidades](docs/features.md)
- [Schema do Banco](docs/database-schema.md)

## Regra de Ouro

Antes de implementar qualquer módulo novo:
1. Verificar status no `docs/guia-construcao.md`
2. Consultar `docs/module-map.json` → campo `depends_on` e `used_by` do módulo
3. Implementar sem afetar módulos com status `done`
4. Atualizar `module-map.json` (status, files) e marcar `[x]` no guia ao concluir

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
