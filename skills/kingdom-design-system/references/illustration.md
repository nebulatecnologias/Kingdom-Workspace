# Illustration style

Illustrations are how Kingdom UI brings colour into a screen. They are used for product covers, empty states, auth collages and email thumbnails.

## The style
- **Thick, even line art:** stroke `#1d1b18` at 3.2 (on a 200×200 viewBox), with round caps and joins. Secondary detail lines are 2–2.6. Eyes and dots are small filled circles.
- **Friendly, simple geometry:** circles, rounded rectangles and soft curves. No perspective tricks, no gradients inside the art, no shading and no text.
- **Flat pastel-to-mid fills,** one colour per region, drawn from:
  - sun `#ffc94a` / `#ffd54a`
  - sky `#8fd3f4` / `#5ab0e6`
  - leaf `#6cc56a` / `#7cc36a`
  - wood `#b7743f` / `#c98b4f`
  - coral `#f2594b`
  - orange `#ff9f43`
  - lilac `#b69cff`
  - pink `#ff8fb1`
  - paper `#fbfaf7`
  - stone `#8a8f98`
- **On a pastel field:** each item gets one field colour (see the tokens content fields) behind the art, inside a 16px-radius cover.
- **Two modes, same drawing:**
  - `color`: regions filled. Used for owned and available items, marketing and emails.
  - `line`: white regions. Used for locked items (plus the desaturated cover) and printable colouring sheets.

## How to draw a new one
Use the helpers in `assets/line-art.js`:
- `f(colour)` marks a fillable region.
- `line(d, width)` draws a stroke-only path.
- `dot(x, y)` draws a filled eye or dot.
- `cloud()`, `flower()`, `waves()`, `star()` are reusable motifs.
- `artSVG(id, mode)` renders a drawing in either mode.

```js
ART.calendar = () => `
  <rect ${f('#fbfaf7')} x="36" y="44" width="128" height="120" rx="14"/>
  <rect ${f('#f2594b')} x="36" y="44" width="128" height="30" rx="14"/>
  ${line('M68 34 V58 M132 34 V58', 6)}
  <rect ${f('#ffd54a')} x="58" y="94" width="24" height="22" rx="5"/>
  <rect ${f('#8fd3f4')} x="118" y="126" width="24" height="22" rx="5"/>`;
```

Existing drawings you can reuse:
- ark, dove, rainbow, sky, tree, fish
- lamb, shepherd, whale, boat, stable, manger, gifts, lion
- heart (with cross), bible
- coins (money jar), pulpit, notebook

Keep each drawing to 5–20 regions so it reads at 56px thumbnail size and at full A4.

## Photography
Photography is not part of the base world. If a product needs photos (people, events), place them in 16px-radius frames on a card, never full-bleed behind UI text. Keep them warm and natural.
