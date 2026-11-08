# Aplicações (mockups)

O manual principal sai sem aplicações. Os mockups fotográficos (camisola, boné, fachada, roll-up) são mais convincentes feitos num editor de mockups ou com IA de imagem, e o cliente costuma fazê-los noutra ferramenta. Quando o cliente enviar as imagens, acrescentar `aplicacoes` ao `marca.json` e gerar o manual de novo.

## Recomendação
1. **Cena com IA de imagem.** O Gemini (modelo de imagem «Nano Banana») é o que melhor mantém um logótipo enviado igual ao original. O ChatGPT também serve, mas troca letras com mais frequência. O Midjourney não serve para isto: não reproduz logótipos com fidelidade.
2. **Logótipo exato por cima.** Se a IA alterar o logótipo, usar a imagem só como fundo. Depois, colocar o SVG ou PNG original num editor de mockups: Photoshop, Canva com o Smartmockups, Mockey ou Placeit.
3. **Peças ilustradas.** Para peças desenhadas e não fotográficas (cartões, ecrã de telemóvel, perfil nas redes, crachá, saco), HTML e SVG renderizados dão um resultado limpo e fiel, como no quadro de aplicações da Kingdom.

## Prompt para o Gemini (preencher os campos)
Anexar o logótipo horizontal branco, o vertical branco, o horizontal na cor principal e o ícone, em PNG transparente.

```
Create a high-end brand identity mockup board for "[NOME]", [O QUE A EMPRESA FAZ] based in [CIDADE]. Landscape page, A4 proportion (1.414:1), photorealistic, premium studio lighting, soft natural shadows, 4K detail.

LOGO — CRITICAL RULES
- Use ONLY the attached logo files, exactly as they are. Do not redraw, retype, re-letter or reinterpret the logo. Keep the symbol and the text "[NOME]" pixel-identical.
- Never stretch, rotate, outline, add gradients, shadows or effects to the logo. One flat colour only.
- White logo files go on [PRINCIPAL]/[ACENTO] surfaces; the [PRINCIPAL] logo goes on light surfaces.
- No other text anywhere except the logo itself. No other brands.

BRAND COLOURS (use exactly)
- [Principal] [HEX] (~60%), [Fundo] [HEX] (~30%), [Acento] [HEX] (accent only, ~10%).

LAYOUT
Bento grid of 8 rounded-corner tiles, 12 px gaps, on a deep [PRINCIPAL ESCURO] background:
1. Business cards on an angle  2. A4 letterhead and envelope  3. T-shirt on a mannequin with the vertical logo
4. Tall roll-up banner  5. Smartphone home screen with the app icon  6. Tote bag  7. Embroidered cap  8. Reception wall sign.

STYLE
Clean, minimal, corporate and modern. Generous negative space. Sharp focus on the logo in every tile. No clutter, no props with text, no watermarks.
```
Dica: gerar uma peça de cada vez dá mais fidelidade. Depois, montar a página no Canva.
