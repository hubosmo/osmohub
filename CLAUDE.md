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
│   ├── (auth)/             # login, cadastro, verificar-email
│   ├── (student)/          # área do aluno
│   │   ├── dashboard/
│   │   └── cursos/
│   │       └── [curso]/
│   │           └── [disciplina]/
│   │               └── [area]/
│   │                   └── [topico]/   # página unificada: vídeo + artigo + atlas + simulação
│   ├── (admin)/            # painel administrativo
│   │   └── admin/
│   │       ├── content/    # ContentTree — gestão completa de conteúdo
│   │       ├── simulacoes/ # (pendente)
│   │       ├── quizzes/    # (pendente)
│   │       └── usuarios/   # (pendente)
│   └── api/
├── components/
│   ├── ui/                 # shadcn/ui base
│   ├── layout/             # header, sidebar, nav
│   ├── student/            # componentes da área do aluno
│   ├── admin/              # componentes do painel admin
│   │   └── panels/         # painéis inline do ContentTree
│   ├── editor/             # editor Tiptap + extensões de bloco
│   └── simulations/        # tipos de simulação renderizáveis (pendente)
├── lib/
│   ├── db/                 # queries Prisma por entidade
│   ├── actions/            # server actions por domínio
│   ├── supabase/           # clientes Supabase (browser, server, admin)
│   └── utils/
├── hooks/                  # hooks compartilhados (useIsMobile, etc.)
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

- [Mapa do Sistema](docs/system-map.md) ← **ler primeiro: rotas reais, fluxos, componentes, arquivos**
- [Guia de Construção](docs/guia-construcao.md) ← checklist de fases (o que está done/pendente)
- [Mapa de Módulos](docs/module-map.json) ← dependências detalhadas por módulo
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

---

## Padrões de Código — Regras de Crescimento

Estas regras evitam acúmulo silencioso. Aplicar **durante** a escrita, não depois.

### Viewport responsivo

Tailwind `md:` / `sm:` / `lg:` **não funcionam** neste projeto (Tailwind CSS v4).
Toda lógica responsiva usa o hook:

```ts
import { useIsMobile } from "@/hooks/useIsMobile";
const isMobile = useIsMobile();        // padrão: < 768px
const isMobile = useIsMobile(640);     // breakpoint customizado
```

- Nunca recriar o `useEffect` de viewport manualmente em um componente
- `@media` em `<style>` JSX funciona — usar apenas para CSS puro (não lógica)

### Server Actions — um arquivo por domínio

```
lib/actions/
  content-structure.ts   → CRUD curso / disciplina / area / topico / capas
  content-atlas.ts       → imagens standalone e grupos de imagens
  content-tabelas.ts     → tabelas e linhas
  content-media.ts       → video e artigo
  content-quizzes.ts     → (criar quando implementar quizzes)
  content-simulacoes.ts  → (criar quando implementar simulações)
```

- Cada domínio novo → arquivo novo, nunca adicionar em arquivo de outro domínio
- Utilitários locais (`s()`, `revalidate()`) são duplicados por arquivo — são pequenos demais para extrair

### Seções da página de tópico — componentes separados

Cada tipo de seção tem seu arquivo em `components/student/`:

```
TopicVideoSection.tsx    ✓
TopicAtlasSection.tsx    ✓
TopicQuizSection.tsx     → criar ao implementar quiz
TopicSimSection.tsx      → criar ao implementar simulação
```

- A página `[topico]/page.tsx` apenas orquestra — sem lógica visual inline
- Funções auxiliares (formatDuration, toVideoEmbed) ficam no arquivo do componente que as usa

### Limites de tamanho — agir antes de ultrapassar

| Arquivo | Limite | Ação |
|---|---|---|
| Qualquer `page.tsx` | ~200 linhas | Extrair seções para `components/` |
| `lib/actions/*.ts` | ~300 linhas | Dividir por subdomínio |
| `lib/db/*.ts` | ~400 linhas | Dividir por entidade |
| `components/layout/*.tsx` | ~400 linhas | Extrair sub-componentes |

### Padrão repetido = hook ou componente

- Mesmo bloco de código em 2 arquivos → extrair antes do 3º
- Mesmo JSX estrutural em 2 lugares → componente compartilhado em `components/student/` ou `components/ui/`

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
