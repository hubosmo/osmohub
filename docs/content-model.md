# Osmo — Modelo de Conteúdo

## Hierarquia de Conteúdo

```
Disciplina
└── Área
    └── Tópico
        ├── Vídeo (0 ou 1)
        ├── Artigo (0 ou 1)  ← blocos: texto, imagem, simulação, quiz inline...
        └── Simulações[]     ← vinculadas ao tópico (além das embutidas no artigo)
```

### Exemplos reais:

```
Física
└── Termodinâmica
    └── Tipos de Sistema
        ├── Vídeo: "Introdução aos Tipos de Sistema"
        ├── Artigo: [texto + imagem + simulação inline "arrastar sistemas"]
        └── Simulações: [Quiz "Identifique o Sistema"]

Anatomia
└── Sistema Cardiovascular
    └── Anatomia do Coração
        ├── Vídeo: "Estrutura do Coração"
        ├── Artigo: [texto + label_image "partes do coração" + callout]
        └── Simulações: [matching "câmaras ↔ função"]
```

---

## Entidades

### Disciplina
- `id`
- `slug` — usado na URL (ex: `fisica`, `anatomia`)
- `nome` (ex: "Física", "Anatomia")
- `descricao`
- `capa_url` — imagem de capa configurável no admin
- `icone` — emoji ou nome de ícone Lucide
- `cor_destaque` — cor hex opcional para identidade visual da disciplina
- `ordem` — ordem de exibição
- `publicado` boolean

### Área
- `id`
- `disciplina_id`
- `slug` (ex: `termodinamica`)
- `nome` (ex: "Termodinâmica")
- `descricao`
- `ordem`
- `publicado`

### Tópico
- `id`
- `area_id`
- `slug` (ex: `tipos-de-sistema`)
- `titulo`
- `descricao_curta`
- `ordem`
- `publicado`
- `duracao_estimada_min` — tempo estimado de estudo em minutos

### Vídeo
- `id`
- `topico_id`
- `titulo`
- `mux_asset_id` — ID do asset no Mux
- `mux_playback_id` — ID de playback público
- `youtube_url` — alternativa para vídeos externos
- `duracao_seg` — duração em segundos
- `thumbnail_url`
- `transcricao` — texto opcional para busca e acessibilidade

### Artigo
- `id`
- `topico_id`
- `titulo`
- `content` — JSON (formato Tiptap)
- `tempo_leitura_min`
- `atualizado_em`

### Simulação
- `id`
- `slug`
- `titulo`
- `descricao`
- `tipo` — `drag_drop` | `fill_blank` | `matching` | `ordering` | `label_image` | `custom_html`
- `config` — JSON com dados da simulação (estrutura varia por tipo)
- `html_url` — usado apenas para tipo `custom_html`
- `topicos[]` — tópicos que referenciam essa simulação (many-to-many)
- `disciplina_id` — disciplina principal para organização no admin

#### Config por tipo:

**drag_drop**:
```json
{
  "instrucao": "Arraste cada item para a categoria correta",
  "categorias": ["Sistema Aberto", "Sistema Fechado", "Sistema Isolado"],
  "itens": [
    { "texto": "Panela com tampa", "categoria_correta": "Sistema Fechado" },
    { "texto": "Garrafa térmica", "categoria_correta": "Sistema Isolado" }
  ]
}
```

**matching**:
```json
{
  "instrucao": "Conecte o conceito à sua definição",
  "pares": [
    { "esquerda": "Entalpia", "direita": "Calor a pressão constante" },
    { "esquerda": "Entropia", "direita": "Medida de desordem" }
  ]
}
```

**label_image**:
```json
{
  "instrucao": "Identifique as partes indicadas",
  "imagem_url": "...",
  "pontos": [
    { "x": 45, "y": 30, "label": "Átrio esquerdo" },
    { "x": 60, "y": 55, "label": "Ventrículo direito" }
  ]
}
```

### Quiz
- `id`
- `topico_id` (opcional — quiz pode existir independente)
- `titulo`
- `descricao`
- `modo` — `pratica` | `simulado` (com tempo)
- `tempo_limite_seg` — null se sem limite

### Questão
- `id`
- `quiz_id`
- `enunciado` — texto rico (suporta imagem)
- `tipo` — `multipla_escolha` | `verdadeiro_falso`
- `explicacao` — texto exibido após responder
- `ordem`

### Opção
- `id`
- `questao_id`
- `texto`
- `correta` boolean
- `ordem`

---

## Progresso do Aluno

### ProgressoTopico
- `usuario_id`
- `topico_id`
- `video_assistido` boolean
- `artigo_lido` boolean
- `simulacoes_concluidas` — array de IDs de simulações concluídas
- `atualizado_em`

### TentativaQuiz
- `id`
- `usuario_id`
- `quiz_id`
- `pontuacao` — 0 a 100
- `respostas` — JSON com escolhas do aluno
- `tempo_gasto_seg`
- `criado_em`

---

## Plano de Estudos

### PlanoEstudos
- `id`
- `usuario_id`
- `nome` (ex: "Preparação para o ENEM")
- `criado_em`

### ItemPlano
- `id`
- `plano_id`
- `topico_id`
- `ordem`
- `concluido` boolean
- `data_prevista`

---

## Busca e Navegação

- URL canônica de um tópico: `/disciplinas/[slug-disciplina]/[slug-area]/[slug-topico]`
- Busca: texto livre busca em `topico.titulo`, `artigo.titulo`, `video.transcricao`
- Filtros: por disciplina, tipo de conteúdo (vídeo/artigo/simulação), concluído/não concluído
