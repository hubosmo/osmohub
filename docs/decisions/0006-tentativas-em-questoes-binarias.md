# 0006 — Questões com 2 opções têm sempre 1 tentativa

- **Status:** Aceita
- **Data:** 2026-10-15

## Contexto
O aluno pode configurar 1 ou 2 tentativas por questão. Em Verdadeiro/Falso ou em escolha entre duas imagens, errar a primeira entrega a resposta da segunda: o acerto passa a ser garantido e não mede conhecimento.

## Decisão
Em `QuizPlayer.handleAnswer`, o limite efetivo de tentativas é 1 quando a questão tem 2 opções ou menos, independente da configuração do aluno. Com 3 opções ou mais vale o configurado. A tela de configuração não muda.

## Consequências
- A regra é por número de opções, não por tipo de questão, então cobre também múltipla escolha com 2 alternativas.
- A configuração "2 intentos" continua global e é aplicada só onde faz sentido.
