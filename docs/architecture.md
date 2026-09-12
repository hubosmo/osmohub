# Osmo — Arquitetura Técnica

## Visão Geral

Aplicação Next.js 14 (App Router) full-stack com Supabase como backend principal. Estrutura de rotas em grupos para separar contextos (marketing, auth, aluno, admin) com layouts e middlewares independentes.

---

## Diagrama de Camadas

```
┌─────────────────────────────────────────────┐
│              Vercel (CDN + Edge)             │
├─────────────────────────────────────────────┤
│         Next.js 14 (App Router)             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │(marketing)│  │(student) │  │ (admin)  │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│              API Routes (/api)               │
├─────────────────────────────────────────────┤
│                  Prisma ORM                  │
├──────────────┬──────────────────────────────┤
│   Supabase   │         Mux                  │
│  PostgreSQL  │    (video streaming)         │
│  Auth        │                              │
│  Storage     │                              │
└──────────────┴──────────────────────────────┘
```

---

## Autenticação

- **Provider**: Supabase Auth (email/senha, OAuth futuro)
- **Sessão**: cookie HttpOnly gerenciado pelo `@supabase/ssr`
- **Middleware** (`middleware.ts`): protege rotas `(student)` e `(admin)`
- **Roles**: `student` | `admin` — armazenado em `users.role` (PostgreSQL)
- Admin verificado no middleware via query ao banco (não só no JWT)

---

## Vídeo

- **Serviço**: Mux
- **Fluxo de upload (admin)**:
  1. Admin faz upload no painel → Next.js API route recebe o arquivo
  2. API cria um Mux Upload URL e retorna ao frontend
  3. Frontend faz upload direto para Mux (sem passar pelo servidor)
  4. Webhook Mux notifica quando o vídeo está pronto → salva `mux_asset_id` no banco
- **Playback**: componente `<MuxPlayer>` com `playback_id`
- **Thumbnails**: geradas automaticamente pelo Mux

---

## Editor de Artigos (Tiptap)

O conteúdo de artigos é salvo como **JSON** no banco (coluna `content: Json`).

### Tipos de bloco suportados:
```
paragraph       → texto rico
heading         → h2, h3
image           → imagem com legenda
video           → embed de vídeo (Mux playback_id)
callout         → destaque/nota
divider         → separador
quiz_inline     → questão de múltipla escolha inline
simulation      → bloco de simulação (referência por ID)
```

### Bloco de simulação no JSON:
```json
{
  "type": "simulation",
  "attrs": {
    "simulacao_id": "abc-123",
    "titulo": "Tipos de Sistema Termodinâmico"
  }
}
```
O frontend busca a simulação por ID e renderiza o componente correto.

---

## Simulações

### Tipos pré-definidos (configuráveis no admin):
| Tipo | Descrição |
|---|---|
| `drag_drop` | Arrastar elementos para categorias |
| `fill_blank` | Completar lacunas em texto |
| `matching` | Conectar pares (conceito ↔ definição) |
| `ordering` | Ordenar sequências |
| `label_image` | Identificar partes de uma imagem |
| `custom_html` | HTML5 customizado via iframe sandboxed |

### Simulação `custom_html`:
- Arquivo HTML5 + JS enviado no admin → armazenado no Supabase Storage
- Renderizado via `<iframe sandbox="allow-scripts">` (isolado do DOM pai)
- Comunicação com a plataforma via `postMessage` (ex: enviar resultado do jogo)

---

## Gerenciamento de Estado

| Tipo de estado | Solução |
|---|---|
| Dados do servidor | TanStack Query (cache, revalidação) |
| Estado global UI | Zustand (tema, sidebar, modal) |
| Estado de formulários | React Hook Form + Zod |
| Estado de rota | Next.js `useSearchParams`, `useRouter` |

---

## Variáveis de Ambiente

Tipadas e validadas em `src/lib/env.ts` com Zod. Nunca acessar `process.env` diretamente.

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
MUX_TOKEN_ID
MUX_TOKEN_SECRET
MUX_WEBHOOK_SECRET
DATABASE_URL
```

---

## Performance

- **Server Components por padrão** — `use client` apenas quando necessário (interatividade, hooks)
- **ISR (Incremental Static Regeneration)**: páginas de tópico com `revalidate`
- **Imagens**: `next/image` com otimização automática
- **Fontes**: `next/font` (Montserrat carregada localmente, sem FOUT)
- **Vídeo**: Mux cuida de CDN, adaptive bitrate, e encoding

---

## Decisões Importantes

1. **Sem ORM na camada de API Routes** — queries ficam em `lib/db/`, importadas nas Server Actions ou Route Handlers
2. **Artigo como JSON** — flexível para adicionar novos tipos de bloco sem migração de schema
3. **Simulações como entidades independentes** — reutilizáveis em múltiplos artigos/tópicos
4. **Admin como route group dentro do mesmo app** — sem repositório separado por ora; extrair se a equipe crescer
5. **YouTube/Vimeo como fallback de vídeo** — suporte a embed externo além do Mux, para vídeos já existentes
