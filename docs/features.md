# Osmo — Especificação de Funcionalidades

## Área do Aluno

### Dashboard (Início)
- Saudação com nome do aluno
- Resumo de progresso: % de conteúdo concluído por disciplina
- "Continue de onde parou" — último tópico acessado
- Próximos itens do plano de estudos personalizado
- Estatísticas rápidas: vídeos assistidos, artigos lidos, simulações feitas, pontuação média nos quizzes
- Acesso rápido às disciplinas

### Navegação de Conteúdo
- Listagem de Disciplinas com capa, nome e progresso
- Dentro da disciplina: listagem de Áreas
- Dentro da área: listagem de Tópicos com indicadores de progresso (vídeo ✓, artigo ✓, simulação ✓)
- Página de Tópico (unificada):
  1. Player de vídeo (Mux)
  2. Artigo interativo (blocos Tiptap)
  3. Simulações vinculadas
  4. Quiz do tópico
  5. Navegação: tópico anterior / próximo tópico

### Artigo Interativo
- Renderização de blocos: texto, imagem, vídeo, callout, simulação embutida, quiz inline
- Marcação automática como "lido" ao rolar até o final
- Tempo de leitura estimado exibido no topo

### Simulações
- Renderização de componentes por tipo (drag_drop, matching, fill_blank, etc.)
- Feedback imediato após interação (correto/incorreto + explicação)
- Registro de conclusão no progresso do aluno
- Simulações `custom_html` em iframe sandboxed; resultado enviado via `postMessage`

### Quiz
- Modo prática: sem tempo, feedback após cada questão
- Modo simulado: com tempo limite, resultado ao final
- Revisão das respostas com explicações após conclusão
- Histórico de tentativas com pontuação

### Plano de Estudos Personalizado
- Criação manual: aluno escolhe disciplinas/áreas/tópicos e monta uma lista ordenada
- Sugestão automática (futuro): baseada em progresso e áreas com menor desempenho
- Vista de calendário (futuro): distribuir tópicos por data
- Indicação de tópicos concluídos vs. pendentes

### Meu Progresso
- Gráficos de progresso por disciplina
- Histórico de quizzes com pontuações
- Streak de dias estudados
- Tempo total de estudo

### Biblioteca
- Busca de conteúdo (texto livre)
- Filtros: disciplina, tipo (vídeo, artigo, simulação)
- Favoritos (salvar tópicos)

### Configurações do Aluno
- Alterar nome, email, senha
- Preferência de tema (claro/escuro/sistema)
- Notificações

---

## Painel Admin

### Gestão de Disciplinas
- CRUD de disciplinas: nome, slug, descrição, capa, ícone, cor, ordem, publicado
- Preview do card como aparecerá para o aluno

### Gestão de Áreas
- CRUD vinculado à disciplina
- Reordenação drag-and-drop

### Gestão de Tópicos
- CRUD vinculado à área
- Duração estimada de estudo
- Status de publicação

### Upload de Vídeo
- Upload direto para Mux via URL de upload (não passa pelo servidor)
- Alternativa: informar URL do YouTube/Vimeo
- Status de processamento do Mux em tempo real
- Preview do player antes de publicar

### Editor de Artigos
- Editor Tiptap com blocos: texto, heading, imagem, vídeo, callout, divider, simulação, quiz inline
- Upload de imagens direto para Supabase Storage
- Inserção de simulação via busca da biblioteca de simulações
- Preview do artigo como o aluno verá

### Biblioteca de Simulações
- CRUD de simulações
- Seleção de tipo e configuração visual por tipo
- Upload de HTML5 customizado para tipo `custom_html`
- Preview da simulação antes de salvar
- Vínculo com tópicos

### Quiz Builder
- Criação de quizzes com questões de múltipla escolha ou V/F
- Suporte a imagens no enunciado
- Definição de explicação por questão
- Modo (prática ou simulado) e tempo limite

### Usuários
- Listagem de alunos
- Visualização de progresso individual
- Ativar/desativar conta

### Métricas (futuro)
- Tópicos mais acessados
- Taxas de conclusão por disciplina
- Pontuação média dos quizzes

---

## Fluxos Principais

### Fluxo do Aluno (uso típico)
```
Login → Dashboard → Escolhe disciplina → Escolhe área → 
Escolhe tópico → Assiste vídeo → Lê artigo (com simulações inline) → 
Faz simulação → Faz quiz → Tópico marcado como concluído
```

### Fluxo Admin (publicar novo tópico)
```
Admin > Disciplinas > [Disciplina] > [Área] > Novo Tópico →
  ↓ Upload vídeo (Mux)
  ↓ Escreve artigo no editor de blocos
  ↓ Cria simulação na biblioteca (ou seleciona existente)
  ↓ Insere simulação como bloco no artigo
  ↓ Cria quiz
  ↓ Publica tópico
```

---

## Regras de Negócio

- Tópico só aparece para o aluno se `publicado = true` E todos os conteúdos vinculados estiverem prontos
- Vídeo Mux só disponível quando `status = ready` (webhook confirma)
- Admin não pode deletar disciplina/área/tópico com conteúdo vinculado — deve despublicar primeiro
- Slug é gerado automaticamente a partir do nome, mas editável; imutável após primeira publicação
- Progresso do aluno é calculado em tempo real, não em cache estático
