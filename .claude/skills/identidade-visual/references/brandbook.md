# Brandbook: estrutura, estilo e revisão

## Estrutura (a ordem que o `brandbook.py` monta)
1. **Capa:** gradiente, o símbolo em grande com luz, o logótipo branco, «Manual de marca» e a versão.
2. **Manifesto:** página escura com o conceito da identidade e os atributos em pílulas.
3. **Índice:** números de página reais.
4. **A marca:** quem somos, arquitetura (marca-mãe e sub-marcas), personalidade com anti-referência, o que fazemos e o método.
5. **O símbolo:** significado por elementos, «do traço ao símbolo», construção geométrica, o pormenor da construção e a frase.
6. **O logótipo:**
   - o principal, com cotas (G, G/4, x);
   - a construção do nome, com as linhas da letra, os pontos e as alças;
   - as versões, o ícone e o favicon;
   - a proteção e os tamanhos mínimos;
   - as cores e os usos incorretos.
7. **A cor:** paleta em mosaico (HEX, RGB, CMYK), gradientes, proporção e contraste.
8. **A tipografia:** a família, os pesos, uma amostra e a hierarquia.
9. **O padrão:** o módulo cotado, as densidades e cores, e uma página inteira tom sobre tom.
10. **O tom de voz:** princípios, com «dizemos» e «evitamos», e o parágrafo-modelo.
11. **Aplicações:** só com imagens enviadas pelo cliente.
12. **Contactos** e **fecho**.

Cada capítulo abre com uma capa de secção.

## Estilo (o que o cliente aprovou)
- **Capas de secção em gradiente** (noite, aurora, brasa) com:
  - grão fino;
  - feixes de luz diagonais;
  - linhas de grelha finas fora da margem do texto;
  - o número do capítulo enorme, em traço fino com gradiente.

  Cada capa tem o seu motivo em transparência (três símbolos, o símbolo grande, o nome, «Aa», o padrão, «»), para não ficarem todas iguais.
- **Páginas de conteúdo em branco, sem cartões.** O que separa os elementos são linhas finas e espaço. Os cartões ficam só para amostras que precisam de fundo: cores, logótipo sobre fundos.
- **Páginas de construção em tom «planta»:** um gradiente muito claro da cor principal para branco.
- **Uma só família de letra em todo o manual:** a da marca.
- **Referência de nível:** brandbooks de estúdio, como SOLAIRE no Behance (capa, manifesto, construção do símbolo em grelha, mosaico de cores, construção do nome em contorno). Usar a referência pela estrutura e pelo acabamento, nunca copiar logótipos ou textos.

## Armadilhas do PDF (já resolvidas no script; manter assim)
- **Página encolhida, com faixas brancas à direita e em baixo.** Os elementos rodados (feixes) que saem da página fazem o Chrome reduzir tudo para caber. A solução é `.pag{overflow:clip;contain:strict}` e `html,body{width:297mm}`. Confirmar com `pdftoppm` que as páginas escuras chegam aos quatro bordos.
- **PDF de 40+ MB.** Filtros SVG (feTurbulence), `filter:blur` e `mask-image` obrigam a rasterizar a página. Usar:
  - grão numa imagem PNG pequena repetida;
  - feixes em `radial-gradient(closest-side, ...)` sem blur;
  - camadas de gradiente em vez de máscaras.
- **Números das capas cortados à direita.** `background-clip:text` com letter-spacing negativo corta a última letra. Resolve-se com `padding-right:.12em`.
- **Filetes de 1 px entre páginas.** Altura fracionária. Manter `height:210mm` exato e `page-break-after:auto` na última página.
- **Letras com contornos sobrepostos** (o K do Google Sans): `removeOverlaps` antes de desenhar em curvas.

## Revisão (antes de entregar)
1. Gerar com `--png --html` e montar folhas de contacto com 9 a 12 páginas por imagem. Ver todas.
2. Com a skill `impeccable`:
   - **Avaliação A:** um subagente de design revê os PNG sem ver as tuas conclusões.
   - **Avaliação B:** `impeccable detect --json brandbook.html`. Os avisos de contraste contra os pontos claros dos gradientes, de recortes intencionais, do grão e do texto em gradiente das capas costumam ser falsos positivos ou estilo pedido. Dizer isso ao cliente.
3. Correções frequentes:
   - texto pequeno branco sobre o acento (usar a cor de texto);
   - marca de água a duas cores (usar uma só);
   - notas internas que um parceiro não entende, como caminhos de repositório (trocar por «pedir à equipa»);
   - páginas sem número de página;
   - «+» quase invisíveis;
   - legendas que não apontam para o sítio certo.
4. Um lote de correções, uma confirmação e entregar. Dizer o que ficou como proposta: gradientes, personalidade, tom de voz.
