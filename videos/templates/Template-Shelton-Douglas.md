# Template Shelton Douglas

Direção do primeiro modelo de vídeo, recriado a partir da referência `Shelton_Douglas_IG.mp4`.
Estilo **documental de partículas**: uma ideia explicada em capítulos curtos, com objetos que se montam e se desfazem em pontos de luz sobre fundo escuro.

- **Código do modelo:** `videos/modelo-particulas/`
- **Vídeo de exemplo:** "O avanço da inteligência artificial" (`saida/video-ia.mp4`, 1:04)

---

## 1. Identidade em uma frase

Um narrador conta uma história de ideias (pessoas, datas, invenções, conceitos). Cada frase ganha um objeto que **se forma a partir de partículas**, recebe **etiquetas técnicas** como num documento de arquivo e **se dissolve** antes do próximo. O tom é de ensaio: sério, preciso, curioso.

| Item | Valor |
|---|---|
| Formato | Vertical 9:16, 1080×1920, 30 fps |
| Duração típica | 60–95 s (10–14 cenas de 3–7 s) |
| Ritmo de fala | ~2,8 palavras/s |
| Narração | Gravada depois, lendo o roteiro de locução com tempos |
| Público | Redes sociais (Reels, TikTok, Shorts) |

---

## 2. Direção visual

### Paleta
Monocromática: grafite quase preto, cinzas e branco. **Nenhuma cor de destaque.** O "brilho" vem da densidade e da cintilação das partículas.

| Função | Cor |
|---|---|
| Fundo | `#0b0b0b` com vinheta radial até `#1c1c1c` no centro |
| Partículas e linhas | `#f2f2f2` (alfa variável 0,4–1) |
| Texto secundário / rótulos | `#7d7d7d` – `#8c8c8c` |
| Etiqueta (tag) | caixa `#ececec` com texto `#0b0b0b` |

### Tipografia
**Google Sans** em todos os textos (ficheiros em `fontes/`).

| Uso | Estilo |
|---|---|
| Legenda | 31 px; palavra atual em 700, anteriores em 400 cinza `#a3a3a3` |
| Etiquetas (tags) | 700, 10 px, MAIÚSCULAS, espaçamento 1 px, caixa branca |
| Rótulos técnicos | 500, 9 px, MAIÚSCULAS, espaçamento 1,6 px, cinza |
| Ano na régua / citações | 27–50 px, itálico nas citações |
| Contadores | algarismos em células de largura fixa (o número não "treme" ao contar) |

### Linguagem gráfica
- **Partículas:** cada objeto é feito de milhares de pontos quadrados de 1–2 px, com leve tremor e cintilação. Há uma "aura" de pontos soltos à volta dos traços.
- **Meio-tom (pontilhado):** retratos e objetos em grelha de quadrados (célula de 7 px), com o brilho pela luminância, como num ecrã LED antigo.
- **Wireframes:** documentos, telefones, molduras e gráficos desenhados com traço de partículas, sem preenchimento.
- **Moldura de arquivo:** cantoneiras finas, uma etiqueta branca no canto superior esquerdo (o NOME) e um rótulo cinza ao lado (CONTEXTO / ANO).
- **Régua:** linha com marcas a cada 8 px, valores nas pontas, um marcador que anda e o ano em fonte grande por baixo.
- **Contadores:** número grande central (ano, percentagem, "03 / 06") que conta quadro a quadro.

### Movimento
- **Entrada:** partículas vêm de posições espalhadas e assentam no lugar (0,6–0,9 s, desaceleração).
- **Saída:** dispersam-se para fora e somem (0,35–0,45 s) no fim de cada cena. **É a transição:** nunca corte seco, nunca fade de cena inteira.
- **Câmara:** zoom lento contínuo de 1,0 → 1,06 dentro de cada cena.
- **Etiquetas e rótulos:** aparecem "digitados", letra a letra, sincronizados com a palavra falada.
- **Palavra gigante:** uma nuvem de partículas gira e condensa-se numa palavra enorme no momento em que ela é dita (ex.: "AGENTES").
- **Final:** a última frase em itálico desfaz-se em partículas e sobra um **ponto de luz pulsante** (fica parado no máximo 1,4 s).

### Legenda (marca do estilo)
- Centrada em y ≈ 1000 de 1280 (abaixo do objeto).
- Blocos de 1 a 4 palavras; a palavra **entra subindo 7 px** e fica em negrito branco, e as anteriores do bloco passam a cinza regular.
- O bloco some (90 ms) e o próximo começa limpo.
- Nas cenas de citação **não há legenda**: a própria frase em itálico grande é o texto.

---

## 3. Estrutura narrativa

Arco de **ensaio cronológico**: *pergunta → história → virada → presente → nova pergunta*.

| Bloco | Função | Cenas típicas |
|---|---|---|
| Gancho (0–8 s) | Uma pessoa/data e uma pergunta | `retrato` + `citacao` |
| Contexto | O tempo passa, a resposta demora | `linhaTempo` |
| Marcos | 3–4 momentos concretos, um por cena | `retrato`, `visao`, `documento`, `chat` |
| Virada | O conceito com nome | `palavra` (palavra gigante) |
| Como funciona | Processo em etapas | `rota` |
| Prova | Um dado real com fonte | `grafico` |
| Fecho | Volta à pergunta inicial, transformada | `simbolo` + `citacao` final |

### Regras de texto
- Frases curtas, uma ideia por bloco de legenda. Comece cenas com âncoras concretas ("Em 1997,").
- **Só dados reais e verificáveis.** Cite a fonte no rótulo (ex.: "METR / 2025"); nada inventado.
- Termine com uma frase que devolve a pergunta ao espectador.

---

## 4. Catálogo de cenas (`tipo`)

| Tipo | Mostra | Use para |
|---|---|---|
| `retrato` | Objeto/foto em meio-tom com cantoneiras, etiqueta, rótulo e régua com valor | Pessoas, máquinas, objetos históricos |
| `citacao` | Ponto de luz → frase em itálico grande (sem legenda); `dissolver` desfaz no fim | Perguntas, frases de impacto, fecho |
| `linhaTempo` | Ano grande contando + linha com marcos que acendem | Passagem de décadas |
| `visao` | Moldura de imagem, varredura e caixa de deteção com % | Reconhecimento, "ver", análise |
| `documento` | Página wireframe com título em partículas e círculo de destaque | Artigos, leis, livros, contratos |
| `chat` | Telefone, pergunta, "digitando…", resposta e contador grande | Conversa, adoção, números de utilizadores |
| `palavra` | Nuvem que se condensa numa palavra gigante | O nome do conceito |
| `rota` | Caminho sinuoso de etapas com contador `01 / 06` | Processos e passos |
| `grafico` | Curva exponencial desenhada em partículas, com marcas "×2" | Crescimento com fonte |
| `simbolo` | Símbolo gigante em partículas que se desfaz num ponto | Transição para o fecho |

Para fotos reais em meio-tom: declare `window.IMAGENS_ROTEIRO = { nome: 'img/foto.jpg' }` e use `imagem: 'nome'` num `retrato`.

---

## 5. Som

Sintetizado por código (`sons.py`), sem bancos de som, cada efeito no quadro exato:

| Som | Quando |
|---|---|
| Cintilação (grãos agudos) | Partículas a formar |
| Sopro (whoosh) | Saída de cada cena |
| Tique | Cada passo de contador, ano e régua |
| Digitação | Etiquetas a serem escritas |
| Ping / bipe de trava | Marcos, deteção |
| Subida + impacto grave | Palavra gigante |
| Dissolução | Símbolo e frase final |

- **Ambiência:** "escura" (drone grave quase subliminar).
- **Mistura:** -20 LUFS, pico ≤ -2 dB, deixando espaço para a voz.
- **Ficheiros de saída:** `*-sfx.wav` (só efeitos) e `*-mix.wav` (efeitos + ambiência).

---

## 6. Como fazer um vídeo novo

1. Escreva `videos/modelo-particulas/roteiro.js` (ou peça ao Claude, ver secção 8).
2. Faça uma pré-visualização com quadros soltos:
```bash
node .claude/skills/motionmaxxing/scripts/render.mjs videos/modelo-particulas/index.html --width 1080 --height 1920 --still 2,10,20,30 /tmp/previa
```
3. Faça o render final (~5 min para 90 s):
```bash
node .claude/skills/motionmaxxing/scripts/render.mjs videos/modelo-particulas/index.html videos/modelo-particulas/saida/video.mp4 --width 1080 --height 1920 --grain 0.03 --crf 17
```
4. Gere os sons, a legenda e o roteiro de locução:
```bash
cd videos/modelo-particulas/saida && python3 ../sons.py video.mp4 && python3 ../exportar_roteiro.py video.mp4
```
5. Junte o áudio ao vídeo:
```bash
ffmpeg -i video.mp4 -i video-mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest video-com-som.mp4
```

### Checklist antes de publicar
- [ ] Todos os dados e datas verificados, com a fonte no rótulo.
- [ ] Nenhum objeto parado mais de ~1 s sem algo vivo (cintilação, contador, zoom).
- [ ] Legenda legível no celular; nada importante nos 18% inferiores (zona da interface).
- [ ] Final parado ≤ 1,4 s.
- [ ] Áudio em -20 LUFS; voz gravada pelo roteiro de locução.

---

## 7. Esqueleto de roteiro

```js
window.ROTEIRO = [
  { tipo: 'retrato', pintor: 'maquina', frases: ['Em 1950,', 'Alan Turing', 'fez uma pergunta', 'simples:'],
    etiqueta: 'ALAN TURING', rotulo: 'MATEMÁTICO / 1912–1954', iEtiqueta: 2,
    regua: { esq: '1936', dir: '1954', de: 0, ate: 1, texto: p => String(Math.round(1936 + p * 14)) } },
  { tipo: 'citacao', ponto: true, frases: ['As máquinas', ['podem pensar?', 0.5]], linhas: ['As máquinas', 'podem pensar?'] },
  { tipo: 'palavra', texto: 'AGENTES', iForma: 3, rotulo: 'SISTEMAS QUE AGEM SOZINHOS', frases: ['Isso tem nome:', ['agentes.', 0.5]] },
  { tipo: 'citacao', ponto: true, dissolver: 1.5, saida: 2.1, frases: ['É o que você', 'vai fazer com elas.'], linhas: ['É o que você', 'vai fazer com elas.'] },
];
```
- `frases`: cada texto vira um bloco de legenda; `['texto', 0.4]` segura 0,4 s a mais.
- Índices como `iEtiqueta`, `iForma` e `iDetecta` contam as palavras **dentro da cena**, a partir de 0.

---

## 8. Pedido pronto para o Claude

> Usando o **Template Shelton Douglas** (`videos/templates/Template-Shelton-Douglas.md` e o código em `videos/modelo-particulas/`), crie um vídeo vertical de ~75 s sobre **[TEMA]**. Estrutura de ensaio: gancho com uma pessoa/data e uma pergunta, 3–4 marcos concretos, a palavra-conceito gigante, um processo em etapas, um dado real com fonte e o fecho que devolve a pergunta. Só dados verificáveis. Gere o MP4 com sons, a legenda .srt e o roteiro de locução, e me mande.

---

## 9. Lições aprendidas
- O estilo vive da **sincronia palavra ↔ imagem**: cada etiqueta, número e forma aparece na palavra que o nomeia.
- Partículas finas em fundo escuro medem "pouco movimento" nos verificadores automáticos; a referência também mede assim. Mantenha cintilação e zoom para o quadro nunca morrer.
- Sem acesso a bancos de imagens, os retratos são desenhados por código; com fotos próprias, o meio-tom fica mais fiel à referência.
