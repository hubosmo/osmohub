# 0001 — Idioma da interface: espanhol latino

- **Status:** Aceita
- **Data:** 2026-09-12 (início do projeto)

## Contexto
O público-alvo são alunos de países de língua espanhola. A equipe e a documentação interna escrevem em português.

## Decisão
Todo texto visível ao aluno (UI, labels, erros, metadados, placeholders) usa espanhol latino-americano (`es-419`). Documentação, commits e comentários ficam em português.

## Consequências
- Nunca usar português ou inglês em strings de interface.
- Mensagens de erro vindas de server actions também são em espanhol.
- Vale também para o painel admin, pois quem edita conteúdo é o mesmo público.
