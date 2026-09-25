---
name: Kingdom Tracktor
description: O design system da Kingdom Library («Kingdom UI»), tal como o Payflow o usa, com a voz em azul e o chão em branco.
colors:
  canvas: "#F2F5FA"
  canvas-2: "#E8EEF6"
  surface: "#FFFFFF"
  surface-2: "#F8FAFD"
  sunken: "#EDF1F7"
  line: "#E1E7F0"
  line-strong: "#CCD5E2"
  ink: "#0E1726"
  ink-2: "#2A3446"
  muted: "#5B6678"
  faint: "#8A94A6"
  azul-300: "#7CC4FF"
  azul-400: "#2D8CF6"
  azul-500: "#0A6BE0"
  azul-600: "#005FCC"
  azul-700: "#004FB0"
  azul-soft: "#E8F1FE"
  azul-ink: "#0B5CC7"
  ciano: "#00B0FF"
  verde: "#15803D"
  verde-soft: "#E3F6EA"
  verde-ink: "#0F7A37"
  vermelho: "#D42A39"
  vermelho-soft: "#FDE8EA"
  vermelho-ink: "#B4202D"
  ambar: "#D99A0B"
  ambar-soft: "#FFF4D9"
  ambar-ink: "#8A5B00"
  serie-1: "#0A6BE0"
  serie-2: "#EB6834"
  serie-3: "#1BAF7A"
  serie-4: "#EDA100"
typography:
  display: { fontFamily: "Google Sans", fontSize: "clamp(26px, 3vw, 34px)", fontWeight: 500, letterSpacing: "-0.025em" }
  headline: { fontFamily: "Google Sans", fontSize: "21px", fontWeight: 500, letterSpacing: "-0.015em" }
  title: { fontFamily: "Google Sans", fontSize: "16.5px", fontWeight: 500 }
  body: { fontFamily: "Google Sans", fontSize: "14.5px", fontWeight: 400, lineHeight: 1.5 }
  label: { fontFamily: "Google Sans", fontSize: "13.5px", fontWeight: 500 }
  caption: { fontFamily: "Google Sans", fontSize: "12.5px", fontWeight: 400 }
  code: { fontFamily: "Google Sans Code", fontSize: "0.9em" }
rounded:
  pilula: "999px"
  dialogo: "20px"
  cartao: "16px"
  dentro: "12px"
  campo: "10px"
  mini: "8px"
  chip: "6px"
---

# Kingdom Tracktor — design

A fonte de verdade das cores e medidas é o `:root` de `tracktor/index.html`.
A origem é o design system da Kingdom Library, na versão que o Payflow adoptou
(ver `DESIGN.md` do repositório `kingdom-dashboard`). O que não estiver aqui
segue o que lá está.

## As trocas em relação ao Payflow

1. Roxo → **azul do logo**. O gradiente do ícone (`#0077F0 → #00B0FF`) fica
   para a marca e para o herói da visão geral. O botão usa o azul escurecido
   `#0A6BE0 → #0058C2`: branco por cima dá entre 5,0:1 e 6,6:1 e passa AA,
   o que o ciano do logo não faz (2,4:1).
2. O chão deixa de ser pedra quente e passa a **cinza-azulado frio**
   (`#F2F5FA`), para o branco e o azul da referência respirarem.
3. O resto mantém-se: Google Sans, cartões de 16 px, pílulas, sombras difusas,
   um só botão principal por ecrã.

## Cor

- **Azul** = a acção principal, o item escolhido, o anel de foco, os links.
- **Verde** = pago. Só aparece em vendas confirmadas pelo Payflow e em estados
  «Ligado» / «Publicada».
- **Âmbar** = à espera (aprovação, em qualificação). **Vermelho** = falhou,
  desqualificado, lead quente (o calor lê-se como urgência).
- Um estado nunca é só cor: vai numa pílula com nome, ou num score com número.

## Gráficos

- Quatro séries em ordem fixa, validadas para daltonismo (claro e escuro):
  Facebook `serie-1`, Instagram `serie-2`, LinkedIn `serie-3`, TikTok `serie-4`.
  A cor segue a rede, nunca a posição: filtrar uma unidade não repinta as
  que ficam.
- Um só eixo por gráfico. Gasto e leads são dois gráficos lado a lado.
- Todo o gráfico tem legenda (duas ou mais séries), rótulos directos no fim
  das linhas, e valores ao passar o cursor.

## Dinheiro

Igual ao Payflow: **`MZ 1 500,00`**, espaço inquebrável nos milhares,
`useGrouping: 'always'`. Numa tabela, o símbolo vai no cabeçalho da coluna
(«Receita (MZ)») e não se repete linha a linha.

## Escrita

Tratamento formal («você»). Frases curtas. Toda a falha diz o que aconteceu e
tem o botão que resolve ao lado («A ligação ao TikTok expirou» →
«Reconectar TikTok»).
