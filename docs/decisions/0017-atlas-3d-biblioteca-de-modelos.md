# 0017 — Atlas 3D: biblioteca de modelos separada, vinculada aos tópicos

- **Status:** Aceita
- **Data:** 2026-11-09

## Contexto
Queremos uma seção de conteúdo "Atlas 3D": o aluno gira um modelo (ex.: um coração) e vê pontos numerados na superfície; ao clicar, a câmera se orienta sozinha e uma caixa explica aquela parte. O conteúdo precisa ser cadastrado pelo admin, e tudo deve caber em serviços gratuitos.

## Decisão
- **Biblioteca separada, vinculada ao tópico** (como os quizzes, não como as imagens do atlas): `Modelo3D` (arquivo GLB + título, licença, créditos, publicado), `PontoModelo3D` (ordem, título, texto, posição, normal, órbita e alvo de câmera) e `TopicoModelo3D` (N:N com ordem). Um modelo serve vários tópicos e os pontos são cadastrados uma vez; o arquivo (dezenas de MB) não é duplicado.
- **Visualizador:** `<model-viewer>` do Google (`@google/model-viewer`, Apache-2.0). Hotspots, animação de câmera até o ponto e ocultar ponto atrás do objeto já vêm prontos. Só carrega no cliente e o modelo só é buscado perto da tela (`loading="lazy"`). `react-three-fiber` fica para uma fase futura, se for preciso destacar partes pelo nome da malha.
- **Formato:** só GLB, até 30 MB, comprimido com Draco. Os pontos guardam os valores no formato do model-viewer (`"x y z"`), sem conversão.
- **Armazenamento:** bucket próprio `modelos-3d` (leitura pública, limite de 30 MB, tipos `model/gltf-binary` e `application/octet-stream`), separado do `capas` (que só aceita imagens de até 10 MB). Escrita só pelo servidor.
- **Upload direto do navegador ao Storage com URL assinada de uso único.** O arquivo não passa pela server action: o corpo de uma requisição na Vercel é limitado (4,5 MB no plano gratuito). O servidor só autoriza (`autorizarUploadModelo3d`, exige admin) e depois confirma (`confirmarUploadModelo3d`: confere que o arquivo existe e o tamanho, grava o caminho e apaga o arquivo anterior). O nome do arquivo no bucket é gerado pelo servidor, nunca o enviado.
- **Licença:** o modelo tem campos de licença e créditos (CC-BY exige atribuição). Modelos "NC" (uso não comercial) não entram.
- Tabelas com RLS ligado e sem acesso para `anon`/`authenticated`, como as demais (ADR 0011).

## Consequências
- Fases 1, 2 e 3 entregues (editor de pontos e navegação do aluno incluídos; falta validar no navegador com um GLB real e, no futuro, reordenar pontos): schema, biblioteca no admin (`/admin/modelos-3d`) com upload e pré-visualização, vínculo com o tópico e seção do aluno (o modelo só é baixado ao clicar em "Ver en 3D").
- Os modelos do tópico são buscados numa consulta separada da `getTopicoPorSlug` e com `.catch`, para que a página do tópico nunca quebre se as tabelas ainda não existirem no banco compartilhado.
- O bucket é criado uma vez com `node --env-file=.env.local scripts/criar-bucket-modelos3d.mjs` (idempotente; mexe no Supabase compartilhado, só com aprovação).
- A migration `20261109180000_atlas_3d` segue o fluxo do ADR 0012 (gerada contra banco local; aplicada no Supabase só com aprovação).
- **O zoom do `<model-viewer>` tem duas partes:** a roda aproxima a câmera até um raio mínimo (2,2 vezes o raio do modelo) e, daí em diante, fecha o campo de visão (de 45° até 12°). Por isso a vista de um ponto guarda órbita, alvo **e `fov`** (coluna `pontos_modelo_3d.fov`, migration `20261110120000_pontos_fov`); sem o `fov`, o zoom de partes pequenas não se reproduzia para o aluno. Pontos antigos (`fov` nulo) voltam ao enquadramento padrão.
- **Modelos comprimidos com Meshopt** (saída do `gltf-transform optimize --compress meshopt`) só abrem se o `meshoptDecoderLocation` for configurado, e **antes** de o modelo começar a carregar: `ModeloViewer` só entrega o `src` ao elemento depois dessa configuração. O decodificador já vem embutido no pacote; `public/vendor/meshopt-ativar.js` é só o gatilho exigido (sem CDN).
- **Editor:** o ponto se arrasta sobre a superfície; «Guardar punto» grava a posição na tela e a câmera atual (o que o admin deixa é o que o aluno vê).
