# Design System — O Conselheiro

Página de vendas do **Advising com O Conselheiro** (Shelton Douglas, Kingdom Company),
publicada em <https://oconselheiro.kingdomcompny.com>.

Este documento descreve o sistema tal como está no ar. A fonte de verdade é o código:

| O quê | Onde |
|---|---|
| Estrutura, componentes e efeitos | `site/site.css` |
| Cores (paleta café) | `site/cafe.css` — carrega **depois** de `site.css` |
| Comportamento (efeitos, Raio-X, carrossel, preços) | `site/site.js` |
| Página | `site/index.html` |
| Imagens | `site/img/` |

A direcção vem do *Guia: como gerar um site de vendas* (área de membros), com a paleta
"café" escolhida pelo cliente: off-white, castanho, coffee bean e laranja.

---

## 1. Princípios

1. **Clareza acima de tudo.** É o que o produto vende ("menos informação, mais clareza"),
   por isso a página é sóbria: uma cor forte só, pouco texto por bloco, muito espaço.
2. **O laranja é raro.** Vai nos botões principais e em pequenos sinais. Nunca em fundos
   grandes nem em texto corrido.
3. **Alternância creme / escuro.** As secções alternam entre off-white e castanho escuro,
   como as páginas de um caderno. Janelas de exemplo escuras aparecem sobre o creme.
4. **Mostrar, não dizer.** Cada fase do método tem um desenho que se anima ao entrar no
   ecrã (radar, fluxo, plano, gráfico).
5. **Só se afirma o que é verdade.** Exemplos e dados inventados levam sempre a nota
   "Exemplo ilustrativo" ou "Dados ilustrativos".

### O que não se faz
- Etiquetas pequenas por cima dos títulos ("eyebrows").
- Texto com gradiente.
- Emojis no lugar de ícones.
- Sombras pesadas: a profundidade vem de contornos finos e de luz difusa.
- Números de secção (01, 02…), excepto onde a ordem importa (fases do método, passos).

---

## 2. Cor

### Paleta base

| Nome | Hex | Pantone | Uso |
|---|---|---|---|
| **Off-white** | `#EDE6DC` | 7527 C | Fundo das secções claras, barra de cima, texto sobre escuro (`#F3EEE6` para texto) |
| **Laranja vibrante** | `#FF5E1E` | 1655 C | Botões principais, sinais pequenos, foco |
| **Coffee bean** | `#49372D` | 4975 C | Cartões no escuro, plano em destaque, caixa de chamada, preenchimentos no claro |
| **Castanho escuro** | `#2D1E17` | 497 C | Fundo das secções escuras, texto sobre claro, texto dos botões laranja |

### Tons de apoio

| Token | Hex | Uso |
|---|---|---|
| `--laranja-claro` | `#ff7a45` | Hover dos botões laranja |
| `--cafe-claro` | `#5b463a` | Início do gradiente do plano em destaque |
| `--cafe-escuro` | `#3a2b23` | Fim do gradiente; núcleo da órbita |
| `--cartao-b` (escuro) | `#30211a` | Fim do gradiente dos cartões escuros |
| Cartão claro | `#f4efe8` → `#e3dacd` | Gradiente dos cartões sobre off-white |
| Documento | `#F4EFE8` | Fundo do "Plano de acção" |

### Dois contextos

As cores de texto, linhas e acentos são variáveis que mudam conforme o fundo.
O contexto escuro é o padrão; o contexto claro liga-se com a classe `.claro` na secção.

| Token | Escuro (padrão) | Claro (`.claro`) |
|---|---|---|
| `--preto` (fundo) | `#2D1E17` | — (fundo `#EDE6DC`) |
| `--texto` | `#F3EEE6` | `#2D1E17` |
| `--texto-2` | `#d8ccbf` | `#56463c` |
| `--texto-3` | `#b5a291` | `#6e5d52` |
| `--t` (tinta RGB para contornos e véus) | `237,230,220` | `45,30,23` |
| `--linha` | tinta a 10% | tinta a 12% |
| `--linha-forte` | tinta a 20% | tinta a 22% |
| `--acento` (preenchimentos, indicadores) | `#EDE6DC` | `#49372D` |
| `--sobre-acento` | `#2D1E17` | `#F3EEE6` |

Dentro de uma secção clara, estes elementos voltam ao contexto escuro ("ilhas"):
`.janela`, `.teste-resultado`, `.telemovel`, `.chamada`.

### Contraste (WCAG)

| Combinação | Contraste | Nota |
|---|---|---|
| `#2D1E17` sobre `#FF5E1E` | 5,25 : 1 | ✅ Texto dos botões laranja |
| `#FFFFFF` sobre `#FF5E1E` | 3,06 : 1 | ❌ Não usar texto branco no laranja |
| `#6e5d52` sobre `#EDE6DC` | 5,06 : 1 | ✅ Texto terciário no claro |
| `#b5a291` sobre `#2D1E17` | 6,52 : 1 | ✅ Texto terciário no escuro |
| `#b5a291` sobre `#49372D` | 4,57 : 1 | ✅ Limite — não escurecer mais |
| `#EDE6DC` sobre `#49372D` | 9,08 : 1 | ✅ |
| `#d8ccbf` sobre `#2D1E17` | 10,16 : 1 | ✅ |

### Onde vai o laranja
- Botões principais (`.botao-principal`) e botões dentro de cartões coffee (`.botao-escuro`).
- Pílula "Preço promocional" e barra da promoção na comparação de preços.
- Pontos da faixa de rolagem, marcador activo do carrossel, "+" aberto das perguntas.
- Caixa marcada no plano de exemplo, passo aceso no fluxo do Advising, primeira barra do
  Gantt, varrimento do radar, primeiro ponto da janela.
- Luz difusa (a 10–30%) atrás da abertura, dos preços e no fecho.

---

## 3. Tipografia

**Google Sans** (Google Fonts, pesos 400 / 500 / 700). Inputs e botões herdam a letra.

```html
<link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&display=swap" rel="stylesheet">
```

Pilha: `'Google Sans','Product Sans','Segoe UI',Roboto,Helvetica,Arial,sans-serif`.

| Nível | Tamanho | Altura de linha | Espaçamento | Peso |
|---|---|---|---|---|
| H1 (abertura) | `clamp(40px, 6.2vw, 84px)` | 1.02 | −0.04em | 500 |
| H2 (secção) | `clamp(34px, 4.8vw, 60px)` | 1.05 | −0.04em | 500 |
| H3 (cartão) | `clamp(24px, 2.6vw, 32px)` | 1.15 | −0.03em | 500 |
| H4 / `.t4` | 19px | 1.3 | −0.02em | 500 |
| Entrada (`.entrada`) | `clamp(17px, 1.5vw, 19px)` | 1.65 | — | 400 |
| Corpo | 16px | 1.65 | — | 400 |
| Pequeno | 13–14.5px | — | — | 400 |
| Faixa de rolagem | `clamp(15px, 1.25vw, 17px)` | — | −0.01em | 500 |

- Títulos com `text-wrap: balance`; parágrafos com `text-wrap: pretty`.
- −0.04em é o limite de aperto: mais do que isso cola as letras.
- Ênfase dentro do título: segunda metade em `--texto-3` ("…*e mais clareza.*").
- Números de preço: `font-variant-numeric: tabular-nums`; milhares com ponto (`2.650 MT`).

---

## 4. Espaço, grelha e formas

| Token | Valor |
|---|---|
| Largura máxima (`--largura`) | 1200px |
| Margem lateral | 32px (20px no telemóvel) |
| Secção (`.seccao`) | 130px em cima e em baixo (88px abaixo de 720px) |
| Cabeça de secção | máx. 820px, 60px até ao conteúdo |
| Intervalo entre cartões | 16px |

**Cantos**

| Elemento | Raio |
|---|---|
| Cartão grande (`.cartao`) | 30px |
| Cartão médio (`.cartao.medio`) | 22px |
| Cartão pequeno / painel (`.cartao.pequeno`) | 16px |
| Botões, pílulas, inputs redondos | 999px |
| Inputs de texto | 14px |

**Superfícies**

- **Cartão:** gradiente 135° de `--cartao-a` para `--cartao-b`, contorno 1px `--linha`, sem sombra.
- **Vidro:** `rgba(48,33,26,.55)` + `backdrop-filter: blur(22px) saturate(1.35)`, contorno a 16%.
- **Contorno interno** (`.contorno`): fundo tinta a 3% + `inset 0 0 0 1px` tinta a 12%.
- **Luz que segue o rato** (`.holofote`): radial de 420px, tinta a 8%, só no hover.

**Breakpoints**: 980px (grelhas de 3 → 2), 860px (preços e passos em coluna),
720px (secções mais curtas), 640px (barra e abertura do telemóvel), 560px / 520px (uma coluna).

---

## 5. Componentes

### Botões
| Classe | Aspecto | Uso |
|---|---|---|
| `.botao.botao-principal` | Laranja, texto `#2D1E17`, sombra laranja suave | Acção principal: "Quero marcar o meu Advising" |
| `.botao.botao-linha` | Transparente, contorno `--linha-forte` | Acção secundária: "Fazer o Raio-X rápido", "Marcar Advising Online" |
| `.botao.botao-escuro` | Laranja (dentro de cartões coffee) | "Ver como funciona", "Marcar Advising Presencial" |
| `.botao-pequeno` | 44px de altura | Barra de cima, cartões |
| `.botao-largo` | Largura total | Planos de preço |

Altura 54px (mínimo de toque 44px), seta SVG que desliza 3px no hover, `scale(.97)` ao carregar.

### Barra de cima (`.barra`)
Fixa, off-white a 94% com desfoque. Logótipo castanho + "O Conselheiro / Shelton Douglas",
links de secção (escondidos abaixo de 980px) e botão laranja "Marcar Advising".

### Janela (`.janela`)
Moldura de aplicação com três pontos (o primeiro laranja), título e etiqueta
"Exemplo ilustrativo". Na abertura começa inclinada (`rotateX 16°`, `scale .93`) e
endireita-se nos primeiros 520px de scroll.

### Pílula (`.pilula`) e etiqueta (`.etiqueta`)
Pílula: fundo `--acento`, texto `--sobre-acento`, flutua 8px num ciclo de 5s.
Etiqueta: contorno fino, texto `--texto-3`, 12px.

### Barras de progresso (`.barrinha`)
6px de altura, fundo tinta a 9%, preenchimento `--acento`, animadas com `transform: scaleX`.

### Sinais (Raio-X rápido, `.sintoma`)
Checkbox em forma de pílula. Marcado: fundo `--acento`, ponto interior laranja.

### Planos de preço (`.plano`)
Dois cartões lado a lado. O destaque (`.plano.destaque`) usa o gradiente coffee, texto
off-white, pílula laranja "Preço promocional", preço antigo riscado e botão laranja.
Os números correm de 0 até ao valor em 700ms quando entram no ecrã.

### Perguntas (`.pergunta-item`)
Acordeão com `grid-template-rows: 0fr → 1fr` (550ms). O "+" roda 180° e fica laranja aberto.

### Ícones
SVG de traço, `stroke-width: 1.8`, pontas e junções redondas, 17–22px.
Em caixa (`.ico-caixa`): 42–50px, cantos 12–16px, contorno tinta a 18%.

---

## 6. Secções (por ordem)

| # | Secção | Fundo | Destaque |
|---|---|---|---|
| 1 | Barra de cima | off-white | botão laranja |
| 2 | Abertura | claro | grelha a desvanecer, luz, janela do plano que endireita |
| 3 | Raio-X rápido | claro | radar e barras que mudam com os sinais marcados |
| 4 | Faixa de rolagem | escuro | gargalos a correr, pontos laranja, 42px de altura |
| 5 | Problema | claro | lista de sinais + caixa coffee "É para esses momentos…" |
| 6 | Solução | claro | pílulas "Não é…" + frase final |
| 7 | Método (Tríade da Clareza) | escuro | separadores presos; radar, fluxo, plano com assinatura, gráfico |
| 8 | Bento | escuro | janela da sessão, órbita com o logótipo, "3" gigante, tríade |
| 9 | Para ti se… | escuro | duas filas de cartões em sentidos opostos |
| 10 | Carrossel | claro | 5 exemplos num telemóvel (negócios inventados) |
| 11 | O Conselheiro | escuro | retrato a cores, abordagem, certificações |
| 12 | Confiança | escuro | 6 pessoas reais com fotografia e seguidores |
| 13 | Critério | claro | "Não é para toda a gente" |
| 14 | Como acontece | claro | online / presencial + como preparar |
| 15 | Investimento | escuro | dois planos, comparação de 2 horas, 3 passos |
| 16 | Perguntas | claro | acordeão |
| 17 | Fecho | escuro | estrelas em canvas, horizonte com luz laranja |
| 18 | Rodapé | escuro | contactos e navegação |

---

## 7. Movimento

Curva única: `--sai: cubic-bezier(.16, 1, .3, 1)` — rápido no início, suave no fim.

| Efeito | Duração | Como |
|---|---|---|
| Entrar ao deslizar (`.revela`) | 0.9–1.1s, +80ms por irmão | opacidade, `translateY(26px)`, `blur(8px)` → normal |
| Janela que endireita | ligada ao scroll | `--rx` 16° → 0, `--sc` .93 → 1 |
| Traços que se desenham (`.traco`) | 1.6s | `pathLength=1`, `stroke-dashoffset` 1 → 0 |
| Fluxo do Advising | 550ms entre passos | classe `.aceso` passo a passo |
| Faixa de rolagem | 45s, linear, infinito | `translateX(0 → −50%)`, lista duplicada |
| Filas de cartões | 70s, sentidos opostos | param no hover |
| Órbita | 36s / 24s | anéis giram, ícones contra-giram |
| Carrossel | troca a cada 7s | 320ms de saída (fade + blur), setas e deslizar com o dedo |
| Preços | 700ms | números correm com ease-out |
| Estrelas | contínuo | canvas, só anima quando está à vista |

**Movimento reduzido** (`prefers-reduced-motion: reduce`): nada fica escondido, a janela
fica direita, as faixas param (e passam a deslizar à mão), os números não correm.
**Sem JavaScript**: a classe `.anima` não é aplicada e tudo fica visível.

---

## 8. Imagem e marca

| Ficheiro | Uso |
|---|---|
| `img/logo-castanho.png` | Logótipo sobre claro (barra, ícone do separador) |
| `img/logo-offwhite.png` | Logótipo sobre escuro (órbita, fecho, rodapé) |
| `img/shelton.jpg` | Retrato (800×698) — secção O Conselheiro e janela da sessão |
| `img/triade.png` | Diagrama da Tríade da Clareza |
| `img/clientes/*.jpg` | Fotografias da secção Confiança (200×200) |
| `og-oconselheiro.jpg` | Imagem de partilha 1080×1080, nas cores café |

- Fotografias **a cores** (os tons quentes combinam com a paleta). Retrato com véu
  castanho em baixo para a pílula "O Conselheiro" se ler.
- O logótipo é um selo circular ("O CONSELHEIRO · SHELTON DOUGLAS") com a estrela;
  na órbita e no fecho gira devagar (30–40s por volta).

---

## 9. Conteúdo e voz

- Português de Moçambique, tratamento por **"tu"** (como no texto original do cliente).
- Dinheiro: `2.650 MT`, `3.650 MT por até 2 horas`; preço normal riscado (`5.300 MT`).
- Exemplos e dados inventados levam sempre: "Exemplo ilustrativo", "Dados ilustrativos" ou
  "Exemplos ilustrativos: os negócios e os planos são inventados."
- Nomes de negócios de exemplo são inventados (Loja Marés, Atelier Kumbi, Oficina Baobá…).
- Botões dizem o que acontece: "Quero marcar o meu Advising", "Marcar Advising Presencial".

---

## 10. Como aplicar a outra página

1. Copie `site.css` (estrutura) e `cafe.css` (cores) e carregue-os por esta ordem.
2. Marque as secções claras com `class="claro"`; as outras ficam escuras.
3. Use `.cartao`, `.cartao.medio` e `.cartao.pequeno` para superfícies, e `.contorno` por dentro.
4. Um só botão laranja por ecrã; o resto em `.botao-linha`.
5. Adicione `class="revela"` ao que deve entrar ao deslizar e inclua `site.js`.
6. Para mudar a paleta inteira, troque só o `cafe.css`: o resto da página não muda.
