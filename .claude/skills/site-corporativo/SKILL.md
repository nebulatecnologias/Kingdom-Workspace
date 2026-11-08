---
name: site-corporativo
description: Constrói sites corporativos estáticos para empresas de serviços (consultoras, agências, assessorias), por etapas aprovadas pelo cliente, a partir de um modelo testado no site da Kingdom Company. O modelo tem um cabeçalho com painéis como o da Stripe, uma abertura em gradiente com o símbolo da marca como marca de água, números, quem somos, serviços por áreas, metodologia animada, clientes em carrossel, como contratar, blog de notícias com pré-visualização na página inicial, frentes, FAQ e página de contactos com Google Maps. Gera a pasta do site a partir de um site.json (e do marca.json da skill identidade-visual), prepara logótipos de clientes e capas do blog, verifica com capturas e publica na Vercel ou num Artifact. Usar sempre que alguém pedir um site, website, site institucional, página inicial de empresa, site da empresa, landing page corporativa, «refazer o site», «site como o da Stripe», ou quiser mudar secções, menu, serviços, clientes, blog ou contactos de um site feito com esta skill.
---

# Site corporativo, por etapas

Esta skill saiu da construção do site da Kingdom Company (`kingdom-company/` neste repositório). A ordem das etapas e os cuidados vêm das correções que o cliente fez ao longo desse projeto. O modelo em `assets/modelo/` é esse site, com marcadores `{{…}}` no lugar dos dados da marca.

Ficheiros:

- `scripts/novo_site.py` cria a pasta do site a partir de um `site.json` ([references/site-json.md](references/site-json.md)).
- `scripts/logos_clientes.py` prepara os logótipos de clientes.
- `scripts/capas_blog.py` recorta as capas dos artigos.
- `scripts/verificar.mjs` tira capturas e lista erros.
- `scripts/artefacto.py` prepara a cópia para pré-visualizar num Artifact.

Dependências: Python 3 com Pillow, numpy e markdown (`pip install pillow numpy markdown`), e o Playwright, já instalado no ambiente.

## Princípios

- **Nunca inventar conteúdo.** Clientes, testemunhos, números, certificações, prémios, presença na imprensa e anos de atividade vêm do cliente. Quando falta um dado, a secção sai ou fica um marcador «A receber», que só aparece na pré-visualização (classe `so-previa`).
- **Regras de negócio primeiro.** Se o projeto tiver regras gravadas (por exemplo um CLAUDE.md com regras de negócio), lê-las antes de cada alteração. Se um pedido contraria uma regra, perguntar antes de fazer, citando o código da regra. Uma decisão nova do cliente sobre o site é gravada como regra. Exemplos: «o site não mostra preços», «o fundador não aparece».
- **Mostrar, não descrever.** Cada ronda de alterações acaba com uma ligação de pré-visualização (Vercel ou Artifact). O cliente decide a ver a página.
- **Texto na língua e variante do cliente.** Português europeu para a Kingdom. As frases são curtas, sem jargão e com dados concretos. Nenhuma ideia se repete entre secções (ver [references/textos.md](references/textos.md)).
- **Seguir o que o cliente pede, à letra.** Quando ele dita um texto, usá-lo e só corrigir a ortografia. Quando diz que uma versão anterior estava melhor, repor a anterior em vez de tentar uma terceira.
- **Verificar com os próprios olhos.** Depois de cada lote, correr `verificar.mjs` e abrir as capturas. Fazer no máximo duas rondas: verificar, corrigir tudo de uma vez e confirmar.

## As etapas

### 0. Briefing e regras
Perguntar:
- o nome e o domínio;
- o que a empresa faz e para quem;
- as áreas e os serviços, com uma linha de resumo por serviço;
- os números reais;
- os clientes, com logótipos;
- as certificações da equipa;
- o grupo ou a marca-mãe;
- os contactos e a morada, com a ligação do Google Maps;
- os sites de referência;
- o que não pode aparecer, como preços, o fundador ou serviços internos.

Gravar as decisões. No projeto Kingdom ficam nas regras de negócio e em `PRODUCT.md` na pasta do site, que é o contexto da skill `impeccable`.

### 1. Identidade
Se a marca ainda não existir, fazê-la primeiro com a skill `identidade-visual`. O `marca.json` dela alimenta o site: nome, slogan, cores, letra, símbolo e logótipo.

### 2. Gerar o site
1. Escrever o `site.json`, com pelo menos `servicos`, `numeros` e `quem`.
2. Correr `python3 scripts/novo_site.py site.json --saida pasta-do-site [--marca marca.json]`.

O script:
- recolore o CSS;
- gera o globo de luz, o padrão e o favicon a partir do símbolo;
- monta o menu de serviços, a secção «O que fazemos», o rodapé e os contactos;
- retira as secções desligadas.

No fim lista o que falta:
- os painéis e as secções com texto do modelo;
- as âncoras sem destino;
- as páginas por construir;
- os problemas de contraste;
- os **factos do site de origem que ficaram no texto** (Kingdom, SDG, certificações). Tudo o que esta lista mostrar é trabalho desta etapa e da seguinte.

### 3. Reescrever as secções
Reescrever, secção a secção, o texto que veio do modelo, seguindo [references/seccoes.md](references/seccoes.md). Isso inclui:
- os painéis Soluções, Sobre nós e Recursos do cabeçalho;
- a metodologia: fases, cartões da órbita e indicadores;
- «Porque trabalhar connosco»;
- as certificações;
- «Como nos contratar»;
- as frentes;
- a FAQ.

Correr `novo_site.py` só uma vez. Depois disso, as edições são feitas à mão na pasta do site, e o script não volta a correr por cima delas.

### 4. Clientes
Correr `python3 scripts/logos_clientes.py --saida pasta/img/clientes "Nome=logo.png" …`. O script:
- tira o fundo branco;
- recorta o logótipo;
- iguala a área visual dos logótipos.

Colar os `<li>` que imprime em `<ul class="logos-trilho">` e apagar os marcadores `por-receber`. O carrossel duplica os itens sozinho.

Os logótipos ficam nas cores originais. O cliente da Kingdom pediu tons de cinzento e depois voltou atrás. Usar `--cinza` só se o cliente o pedir.

### 5. Blog
Ver [references/blog.md](references/blog.md). Resumo:
1. Os artigos em Markdown ficam em `blog/artigos/`.
2. `capas_blog.py` gera as capas em 1200 × 630.
3. `blog/construir.py` gera as páginas e o `noticias.json`, que a página inicial lê.

### 6. Contactos e mapa
`contactos.html` já sai do script com os blocos de email, telefone e morada, e o mapa. Usar no botão «Abrir no Google Maps» a ligação exata que o cliente deu. Para o embed, usar as coordenadas dessa ligação (`!3d<lat>!4d<lng>`) em `contactos.maps_coords`.

### 7. Revisão
1. Rever a coerência e as repetições ([references/textos.md](references/textos.md)).
2. Correr `node scripts/verificar.mjs pasta capturas` e abrir as capturas: abertura, página inteira, cada painel do menu, telemóvel, contactos e blog.
3. Rever o design com a skill `impeccable` (critique ou polish) e corrigir o que o hook de deteção apontar.

### 8. Publicar
Ver [references/publicar.md](references/publicar.md). Antes de cada publicação, subir o `?v=` do CSS e do JS.
- Vercel: o projeto aponta para a pasta do site (`rootDirectory`) e a proteção está desligada, para o cliente poder partilhar a ligação.
- Artifact: é a alternativa quando a Vercel atinge o limite diário. Preparar a cópia com `artefacto.py`.

## Lições do projeto Kingdom

- **Abertura.**
  - Usar o gradiente da capa do brandbook, com o símbolo muito apagado (opacidade perto de 0,09) como marca de água.
  - O título é um pouco menor que o habitual e a caixa de texto é mais larga, como na Stripe.
- **Cabeçalho.**
  - Os painéis abrem colados à barra, de ponta a ponta da moldura, e não como um cartão solto.
  - O item ativo só muda de cor, sem caixa por trás.
  - Os botões usam letra regular, não negrito.
- **Movimento.**
  - O cliente quer os elementos sempre em movimento: Gantt, órbita, faixas de entregáveis e logótipos.
  - A órbita roda por JavaScript (`requestAnimationFrame`) porque a animação CSS ficava parada em alguns computadores.
  - O cliente recusou um botão de pausa. Isto deixa por cumprir o critério WCAG 2.2.2 e a decisão fica registada no PRODUCT.md.
- **Preços.** Não aparecem no site quando o cliente o decide. Cada serviço leva a «Pedir cotação» ou «Avaliação inicial», e o texto não fala de planos nem de preços.
- **Páginas geradas a partir da inicial.** Ao trocar `href="#…"` por `href="/#…"`, a troca não pode tocar em `<use href="#logo">`: limitar a substituição a `<a …>`.
- **Vercel.**
  - Sem `rootDirectory`, a Vercel publica a raiz do repositório e dá 404.
  - O plano gratuito tem um limite de 100 publicações por dia (erro 402).
  - O `?v=` evita que o browser mostre o CSS antigo.
- **Marcadores «A receber».** Só aparecem na pré-visualização (`localhost`, `*.vercel.app` ou `?previa`). No domínio final, a secção mostra apenas o que é real.
