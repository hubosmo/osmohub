# Osmo — Brand & Design System

## Identidade

- **Nome**: Osmo
- **Tagline**: Ciências que Conectam
- **Tom**: Profissional, moderno, acessível, científico
- **Fonte**: Montserrat (Google Fonts)
  - Headings: `700` (Bold)
  - Subtítulos: `600` (SemiBold)
  - Corpo: `400` (Regular)
  - Labels/UI: `500` (Medium)

---

## Paleta de Cores

### Cores Base da Marca
```
Navy principal:  #263B4C
Azul acento:     #00A6FF
Azul acento hover: #0090E0
```

---

## Tema Escuro (Dark — padrão)

```css
:root.dark {
  /* Backgrounds */
  --bg-base:        #0F1A24;   /* fundo principal */
  --bg-surface:     #1A2B3C;   /* cards, painéis */
  --bg-elevated:    #263B4C;   /* modais, dropdowns */
  --bg-subtle:      #1E3347;   /* hover em itens */

  /* Bordas */
  --border:         #2F4A5E;
  --border-subtle:  #1E3347;

  /* Texto */
  --text-primary:   #F0F6FF;
  --text-secondary: #94A3B8;
  --text-muted:     #546E7A;
  --text-inverse:   #0F1A24;

  /* Acento */
  --accent:         #00A6FF;
  --accent-hover:   #0090E0;
  --accent-subtle:  rgba(0, 166, 255, 0.12);

  /* Estados */
  --success:        #22C55E;
  --warning:        #F59E0B;
  --error:          #EF4444;
  --info:           #00A6FF;
}
```

---

## Tema Claro (Light)

```css
:root.light {
  /* Backgrounds */
  --bg-base:        #F0F4F8;
  --bg-surface:     #FFFFFF;
  --bg-elevated:    #FFFFFF;
  --bg-subtle:      #E8EFF5;

  /* Bordas */
  --border:         #D1DDE8;
  --border-subtle:  #E8EFF5;

  /* Texto */
  --text-primary:   #263B4C;
  --text-secondary: #4A6278;
  --text-muted:     #8099AD;
  --text-inverse:   #FFFFFF;

  /* Acento */
  --accent:         #00A6FF;
  --accent-hover:   #0090E0;
  --accent-subtle:  rgba(0, 166, 255, 0.10);

  /* Estados */
  --success:        #16A34A;
  --warning:        #D97706;
  --error:          #DC2626;
  --info:           #0284C7;
}
```

---

## Tokens Tailwind (tailwind.config.ts)

```ts
colors: {
  brand: {
    navy:   '#263B4C',
    accent: '#00A6FF',
  },
  bg: {
    base:     'var(--bg-base)',
    surface:  'var(--bg-surface)',
    elevated: 'var(--bg-elevated)',
    subtle:   'var(--bg-subtle)',
  },
  border: {
    DEFAULT: 'var(--border)',
    subtle:  'var(--border-subtle)',
  },
  text: {
    primary:   'var(--text-primary)',
    secondary: 'var(--text-secondary)',
    muted:     'var(--text-muted)',
    inverse:   'var(--text-inverse)',
  },
  accent: {
    DEFAULT: 'var(--accent)',
    hover:   'var(--accent-hover)',
    subtle:  'var(--accent-subtle)',
  },
}
```

---

## Componentes Visuais

### Sidebar (navegação do aluno)
- Fundo: `--bg-surface`
- Item ativo: `--accent-subtle` com borda esquerda `--accent`
- Ícones: 20px, estilo outline
- Itens: Início, Estudos, Meu Progresso, Biblioteca, Configurações

### Cards de Disciplina
- Fundo: `--bg-surface`
- Border: `--border`
- Radius: `12px`
- Hover: elevar sombra + `--bg-subtle`
- Capa: imagem de capa configurável no admin
- Label com nome da disciplina em Montserrat SemiBold

### Botão primário
- Background: `--accent`
- Texto: branco
- Hover: `--accent-hover`
- Radius: `8px`
- Peso do texto: `600`

### Badge de progresso
- Fundo: `--accent-subtle`
- Texto: `--accent`
- Radius: full

---

## Ícones
- Biblioteca: **Lucide React**
- Tamanho padrão: `20px` (UI), `24px` (destaque)
- Stroke width: `1.5`

---

## Espaçamento e Grid
- Base unit: `4px`
- Container max-width: `1280px`
- Sidebar width: `240px`
- Gaps de conteúdo: `24px` (desktop), `16px` (mobile)
- Border radius padrão: `8px`, cards: `12px`, pill: `9999px`

---

## Responsividade
- Mobile first
- Breakpoints Tailwind padrão: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px
- Sidebar colapsa em mobile (drawer)
