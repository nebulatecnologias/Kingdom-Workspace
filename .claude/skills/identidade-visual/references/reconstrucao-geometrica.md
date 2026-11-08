# Reconstruir um símbolo com geometria exata

O `tracar.py` dá um traçado limpo, mas que segue a referência, incluindo os defeitos dela. Quando o símbolo é geométrico (anéis, elipses, barras, cantos com curva de concordância), o cliente espera perfeição: «o globo 100% circular, os detalhes de dentro iguais ao desenho». Nesse caso, o traçado serve só para medir e o símbolo final faz-se com primitivas.

## Método (o globo da Kingdom Company como exemplo)

1. **Preparar a referência.**
   - Reamostrar a 8×, centrar no centro medido do símbolo e impor a simetria que o desenho tem: média com os espelhos.
   - Alisar com um desfoque gaussiano de cerca de 1 px da imagem original.
   - Ficam medidas sem serrilhado.
2. **Medir as primitivas em perfis.**
   - Percorrer linhas horizontais e verticais da imagem alisada e registar onde cruzam 0,5.
   - O anel exterior é `R`; a mediana dos raios da borda interior dá `r`.
   - As larguras do eixo e do equador são a distância entre as duas bordas.
3. **Ajustar curvas por mínimos quadrados.**
   - Elipses: `x²/a² + y²/b² = 1` resolve-se linearmente em `(1/a², 1/b²)`.
   - Ajustar a borda exterior e a interior separadamente, em vez de supor um traço de espessura constante.
4. **Fazer as concordâncias com superelipses.**
   - Os cantos da estrela, que unem o eixo ao equador, são quartos de superelipse `|u/U|^p + |v/V|^p = 1`, com o centro no canto entre as duas faixas.
   - Com p < 1, a curva é côncava e tangente às duas faixas, sem quebras.
   - Ajustar `U, V, p` aos pontos do contorno do furo com `scipy.optimize.least_squares`.
   - Para cantos junto a uma curva (o meridiano), medir u a partir da borda da elipse e não de uma reta.
5. **Montar com shapely.**
   - União de: anel (círculo R menos círculo r), faixas (`box`), meridianos (elipse exterior menos interior) e os cantos espelhados nos 4 quadrantes.
   - Tudo recortado ao círculo interior.
   - `simplify(0.01)` e escrever em SVG com fill-rule evenodd.
6. **Verificar.**
   - Rasterizar o modelo e comparar com a referência com IoU (interseção sobre união). Na Kingdom chegou a 0,98.
   - Ver também as diferenças em imagem: os erros típicos são cantos com quebra e furos a mais.
7. **Guardar as peças e as medidas.**
   - Um SVG por elemento (anel, eixo, equador, meridianos, estrela), nas mesmas coordenadas do símbolo.
   - Um `medidas.json` com R, r, larguras, semieixos e U/V/p.
   - As peças alimentam `simbolo_significado`, `simbolo_passos` e o padrão. As medidas alimentam a legenda de `simbolo_construcao`.

## Erros que já aconteceram
- O contorno do fundo entrou como furo: filtrar os contornos pelo raio máximo, porque o fundo está fora do anel.
- Desfoque baixo deixa bordas onduladas e desfoque alto come os cantos finos. Começar em 1,0 e comparar.
- Um modelo só de astroide deixa vincos onde a curva encontra a faixa. Por isso as curvas devem ser tangentes às bordas, como a superelipse ancorada no canto.
- O polígono de uma concordância junto a uma elipse cruzava-se a si próprio: fechá-lo ao longo da borda da elipse.
- Uma medida ao olho (equador de 32) estava errada: preferir o valor ajustado no modelo global.

## Página de construção no brandbook
Desenhar um overlay SVG nas mesmas coordenadas do símbolo e indicá-lo em `simbolo_construcao.svg`:
- grelha de 30 unidades;
- diagonais a 45°;
- os círculos e as elipses a traço fino, com as faixas;
- pontos de ancoragem (círculos brancos com contorno no acento) nos vértices e nas tangências;
- marcadores numerados que correspondem à legenda.

O detalhe da concordância vai numa página escura (`simbolo_detalhe`): as superelipses completas a tracejado, a curva usada no acento, os pontos de tangência e a fórmula com os valores.
