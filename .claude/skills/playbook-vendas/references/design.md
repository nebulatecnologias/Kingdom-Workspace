# Design

## Páginas de conteúdo (iguais para todas as marcas)

- **Formato:** A4 horizontal (297 × 210 mm).
- **Fundo:** branco, com um brilho muito leve da cor `luz` num canto.
- **Linhas-guia** verticais a 17 mm das margens.
- **Topo:** o nome da secção em letra mono pequena e o símbolo da marca. **Rodapé:** «Playbook de vendas · Marca», a secção e o número da página.
- **Títulos** centrados (25 pt) e introdução em cinza (10,5 pt).
- **Grelha** com linhas finas por cima e por baixo, colunas separadas por linhas verticais e um traço curto em gradiente da cor primária no início, como na secção de números da Stripe.
- **Ícones:** números ou letras em quadrados de 8,5 mm com contorno fino. Sem fundos de cor nem sombras.
- **Citações** grandes e centradas, sem caixa: a apresentação de 30 segundos, os guiões e a frase comercial.
- **Tabelas:** só linhas horizontais, cabeçalho em letra mono maiúscula.
- **Listas:**
  - dores com marcador na cor `alerta`;
  - entregáveis com ✓;
  - perguntas numeradas 01, 02…;
  - fichas de passagem com caixas de verificação vazias.

## Capas

Capa, capas de secção e contracapa usam a mesma composição:
- logótipo no topo à esquerda;
- etiqueta mono («Secção 01 / 08»);
- número grande com um traço na cor `alerta`;
- título, introdução e a lista «Nesta secção».

**globo**
- Gradiente diagonal das cores `noite` → `escura` → `primaria` → `primaria_2`, com luz radial e grão.
- O símbolo da marca grande à direita (opacidade de 0,5 na capa e de 0,16 nas secções).

**grelha**
- Gradiente vertical do preto à cor `escura`, com um brilho forte da `primaria` e da `luz` por baixo.
- Grelha de 14 mm que desaparece em baixo.
- Um SVG de círculos concêntricos com a mira e cantos em L, os quadrados de canto (`.c-tl` …) e as riscas «////////».
- Inspirado na referência OCTO que o cliente da DT enviou.

## Afinar sem estragar

- Mudar o tamanho ou o espaçamento só em classes específicas (`.pag-ficha-b`, `.g4 .cz`), nunca no conjunto.
- Correr o `render.mjs` depois de cada mudança, até a lista de páginas com texto por cima do rodapé ficar vazia.
- Se uma página continuar cheia, dividi-la em duas em vez de reduzir a letra para menos de 8,4 pt.
