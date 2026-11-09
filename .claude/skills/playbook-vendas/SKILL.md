---
name: playbook-vendas
description: Cria playbooks de vendas operacionais para equipas comerciais (SDR e Closer), por etapas aprovadas pelo cliente, e entrega-os em PDF A4 horizontal no design da marca. Primeiro organiza o conteúdo num documento do Claude, com perguntas ao cliente. Depois gera o PDF com capa, como usar, índice, oito secções com capa e introdução e contracapa. As secções são quem somos, fichas dos serviços (dores, quem as tem, transformação, entregáveis e frase comercial), qualificação BANT, processo comercial, guias do SDR e do Closer, objeções e follow-up. O design é limpo, ao estilo da Stripe, e as capas seguem a identidade visual (globo, ou grelha técnica). Usar sempre que alguém pedir um playbook de vendas, guia comercial, manual de vendas, sales playbook, guião de vendas, processo comercial para SDR e Closer, fichas comerciais de serviços, biblioteca de objeções, ou quiser rever, actualizar ou refazer o design de um playbook feito com esta skill, mesmo que peça só uma destas partes.
---

# Playbook de vendas, por etapas

Esta skill saiu de dois projetos reais.
- **Kingdom Company:** o conteúdo foi construído num documento do Claude com o cliente, ao longo de várias rondas de comentários, e depois passou para PDF.
- **DT Company:** foi feita a partir de um documento de pilares e serviços que o cliente forneceu.

A estrutura, as regras e o design abaixo vêm das correções que os clientes fizeram nesses projetos.

Ficheiros:
- `scripts/gerar.py` gera o HTML a partir de um `playbook.json`, cujo formato está em [references/playbook-json.md](references/playbook-json.md).
- `scripts/render.mjs` faz o PDF e indica as páginas com texto por cima do rodapé.
- `scripts/logo_de_imagem.py` tira o logótipo de uma imagem e mede as cores do fundo.
- `assets/exemplo-dt/` é o exemplo completo da DT Company.

## Princípios

- **Só o essencial para vender.** O playbook é consultado todos os dias pelo SDR e pelo Closer. Fica de fora o que não ajuda a vender: história da empresa, teoria de vendas, guiões para decorar e serviços que esta equipa não vende. Cada página responde a uma só consulta.
- **Nada inventado.** Preços, clientes, casos, números, prazos e regras de negociação vêm do cliente. O que for proposta fica marcado («a validar» ou «a confirmar»). Os entregáveis vêm da descrição dos serviços; quando são propostos, levam `"validar": true`.
- **Regras do negócio primeiro.** Se o projeto tiver regras gravadas (um CLAUDE.md, regras de negócio), lê-las antes. Se um pedido contraria uma regra, perguntar antes de mudar. Uma decisão nova do cliente sobre vendas, como a equipa, o pagamento ou os descontos, é gravada como regra.
- **Fronteiras e palavras do cliente.** Se a empresa tem limites legais ou parceiros, como a DT com a contabilista certificada e o advogado parceiro, essas fronteiras entram em cada ficha e na secção 01. O mesmo vale para as palavras a usar e a evitar. Nunca prometer resultados legais.
- **A língua e a variante do cliente.** Seguir a grafia do material do cliente, com ou sem o Acordo Ortográfico de 1990, e manter a mesma em todo o playbook, incluindo os rótulos (`rotulos` no JSON).
- **Verificar com os próprios olhos.** Depois de cada lote, ver as páginas numa folha de miniaturas e algumas em detalhe. Fazer no máximo duas rondas de correções.

## As etapas

### 0. Material e perguntas
Reunir os serviços (com as dores e os entregáveis), a identidade visual (logótipo e cores), uma referência de estilo e as regras de comunicação. As perguntas que mudam a estrutura estão em [references/processo.md](references/processo.md):
- Quem vende? SDR e Closer separados, ou uma só pessoa?
- De onde vêm os leads: só pedidos que chegam, ou também prospeção?
- Como se paga?
- Há descontos?

Usar o AskUserQuestion para estas quatro.

### 1. Conteúdo num documento do Claude
Quando o conteúdo ainda não está fechado, organizá-lo primeiro num documento do Claude (skill `docs`), com as oito secções e uma lista de perguntas em aberto. O cliente revê por comentários. Responder a cada comentário na própria conversa do comentário. Regras para escrever as secções: [references/conteudo.md](references/conteudo.md).

Quando o cliente já entregou o conteúdo, como na DT, ou pede para avançar diretamente, este passo pode ser saltado.

### 2. Ficha de cada serviço
São seis partes:
1. O que é?
2. Que problema resolve? (com as dores identificadas)
3. Quem tem essa dor?
4. Qual é a transformação? (antes e depois)
5. O que entregamos?
6. Como apresentar comercialmente?

Quando existirem, juntar também a opção de avença e a fronteira com os parceiros. As dores são frases curtas do ponto de vista do cliente. O cliente ideal é definido por serviço, na parte 3, e não há um perfil geral.

### 3. Identidade visual
`python3 scripts/logo_de_imagem.py logo.png --cor-escura "#…" --prefixo marca` grava o logótipo branco, o logótipo de cor e o símbolo, e imprime as cores do fundo.

A paleta tem 13 cores (`marca.cores`). Ter letra própria, com os ficheiros TTF:
- se faltar, buscá-la com `python3 .claude/skills/identidade-visual/scripts/fonte.py "Família" 400 500 --pasta fontes`;
- uma letra mono, como a IBM Plex Mono, dá o tom técnico da capa «grelha».

Escolher o estilo de capa:
- `globo`: o símbolo grande, com luz e gradiente. Para marcas com um símbolo forte (Kingdom).
- `grelha`: grelha fina, círculos, marcas de canto e brilho por baixo. Para marcas técnicas ou referências como a OCTO (DT).

Mais em [references/design.md](references/design.md).

### 4. Gerar e verificar
```
python3 scripts/gerar.py playbook.json --saida pasta
node scripts/render.mjs pasta
```
O `render.mjs` lista as páginas com texto por cima do rodapé; corrigir até a lista ficar vazia.

Ver todas as páginas numa folha de miniaturas (pdftoppm -r 40 e uma montagem com PIL). Ver em detalhe a capa, uma capa de secção, uma ficha e as tabelas.

### 5. Entregar
Enviar o PDF ao utilizador. Indicar o que ficou marcado «a validar» e as perguntas em aberto. Para gravar o PDF no repositório, pedir antes ao utilizador.

## Lições dos projetos

- **Sem cartões.** O cliente pediu um design «mais clean, como a Stripe»:
  - fundo branco e linhas-guia verticais;
  - colunas separadas por linhas finas;
  - títulos centrados;
  - texto a começar por uma frase a escuro e a continuar em cinza;
  - citações grandes sem caixa;
  - ícones pequenos em quadrados com contorno.
- **Mais páginas é melhor do que páginas cheias.** Cada ficha tem duas páginas: a primeira sobre o cliente, a segunda sobre a solução. As objeções ficam 5 por página e os guiões de abertura e fecho têm página própria.
- **As capas mantêm a identidade da marca.** Todas seguem o mesmo esquema: número grande, título, introdução e a lista «Nesta secção».
- **Não confundir nomes de classes.** No CSS, `.bl` é a letra do BANT. As marcas de canto usam `.c-tl`, `.c-tr`, `.c-bl` e `.c-br`.
- **Símbolos em falta na letra.** Alguns caracteres, como ▪, não existem nas letras mono e aparecem como caixas. Desenhar essas formas com CSS.
- **Prazos e cadências.** Os que o cliente não confirmou ficam com «(a confirmar)» no texto.
