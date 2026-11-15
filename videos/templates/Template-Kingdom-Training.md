# Template Kingdom Training

Direção do modelo de vídeo da **Kingdom Training** (@kingdomtraining.center): princípios de vida e liderança **ligados a princípios bíblicos**. É uma lista numerada que sobe de cor em cor, com a marca presente do primeiro ao último segundo.

- **Código do modelo:** `videos/modelo-ascensao/`
- **Editor visual:** [Estúdio Kingdom](https://claude.ai/artifact/W9UwgwyZhVBCDb3MsHz3S4), em `videos/editor/`
- **Vídeo de exemplo:** "10 princípios à luz da Palavra" (`saida/principios-biblicos.mp4`, 1:32)
- **Referência de origem:** `Shelton_Douglas_Ingles.mp4`, adaptado para português, com versículos e com a identidade da marca

---

## 1. Identidade em uma frase

Um **lembrete amigo, à luz da Palavra**. Cada princípio é dito de forma curta ("Pessoas *confiantes* *edificam*.") e logo **confirmado por um versículo** com a referência num selo. A cena **sobe de tom** a cada item, como uma escada de crescimento (a "ascensão"). O tom é acolhedor, reflexivo e esperançoso.

| Item | Valor |
|---|---|
| Formato | Vertical 9:16, 1080×1920, 30 fps |
| Duração típica | 80–95 s (com 10 itens + versículos) |
| Ritmo de fala | ~3 palavras/s; versículos ligeiramente mais lentos |
| Narração | Gravada depois, sobre a trilha (que fica ~12 dB abaixo da voz) |
| Tradução bíblica | NVI (trechos curtos e fiéis; confira sempre na sua Bíblia) |

---

## 2. Identidade da marca (obrigatória em todo vídeo)

### Paleta: só 3 cores e os seus tons
| Cor | Faixa | Uso |
|---|---|---|
| **Laranja** | `#B83600` (queimado) → `#FF4B00` → `#FF7A27` → `#FFBB8C` (pêssego) | Cúpulas, números, torre, objetos, selo verificado, botão |
| **Grafite** | `#121110` → `#1A1917` → `#33322F` | Fundo, figuras humanas, botão "Seguindo" |
| **Branco** | `#FFFFFF` / branco quente `#FFE6D5` | Legenda, brilhos, holofotes, contornos |

Proibido: roxo, azul, verde, arco-íris, dourado puro. Qualquer elemento novo usa tons destas três cores.

### Tipografia
**Google Sans** em tudo (ficheiros em `fontes/`): legenda 26 px (palavra-chave 600, resto 400), versículos em **itálico**, selos em 11,5 px MAIÚSCULAS com espaçamento.

### Elementos fixos da marca
| Elemento | Especificação |
|---|---|
| **Abertura (2 s)** | Fundo escuro → símbolo laranja grande (140 px) no centro sobe até o topo encolhendo para 46 px. O conteúdo é revelado num círculo que se abre a partir do logo, com zoom out 1,15× → 1×. O conteúdo começa aos 1,2 s. Som: cintilação + subida + ping no pouso. |
| **Logo no topo** | Símbolo laranja centrado (y = 92, 46 px), com brilho laranja suave, no ponto de onde nasce o holofote. Fica em todas as cenas. |
| **Marca d'água** | `@kingdomtraining.center` em branco a 40%, com selo de verificado laranja, logo abaixo da legenda (y = 1050). Fica em todas as cenas. |
| **Encerramento (3,6 s)** | O movimento inverso da abertura: tudo se fecha num círculo em direção ao logo, que desce e cresce até o centro. Depois entram "Siga a página", o @ com o selo e o botão **Seguir** (laranja), que um cursor toca e vira **Seguindo ✓** (grafite). O último quadro fica parado ~1 s. |

Tudo isto é configurado no topo do `roteiro.js`: `MARCA_DAGUA`, `LOGO_TOPO`, `INTRO_LOGO`, `OUTRO_LOGO`.

---

## 3. Direção visual das cenas

- **Mundo:** fundo grafite com estrelas finas, três **holofotes** brancos vindos do alto e fios de luz que descem até a cabeça da figura.
- **Cúpula:** um "planeta" que ocupa a metade inferior, com anéis no chão, meridianos, órbitas com pontos que andam e luz sob os pés. **A cor muda a cada item**, do laranja queimado (1) ao pêssego (10), e a transição entre cores é suave.
- **Figura principal:** silhueta humana em grafite, com luz de contorno laranja à esquerda e branca à direita, sempre ao centro. É ela que "vive" cada princípio.
- **Número 3D:** número grande extrudado em laranja com face clara e brilho em estrela, no canto superior direito. Entra com uma pequena mola e sai subindo.
- **Objeto simbólico por princípio:**

| Objeto | Princípio de exemplo |
|---|---|
| `edificar` | coluna de luz que eleva outra pessoa |
| `incluir` | figuras no horizonte que se aproximam; brilho no peito |
| `comunicar` | ondas de voz em direção a duas pessoas |
| `limites` | cilindro de luz no chão + raios que batem e voltam |
| `focar` | moldura de foco; outras figuras desfocadas |
| `paz` | nuvem com chuva parada por um escudo |
| `deixar` | esferas de luz que sobem e somem |
| `encorajar` | sol listrado atrás da figura |
| `apoiar` | moeda com troféu e arcos de apoio |
| `celebrar` | brilhos que acendem em várias pessoas + confete |
| `reflexo` | espelho; coração no peito quando se diz "coração" |
| `valor` | régua (a "medida") que se apaga; aura em "especial" |

- **Torre da lista:** 10 discos em degradê laranja empilhados (abertura); no fim ganham um ✓ cada, e depois ficam dentro do contorno de uma cabeça (a lista "na mente").

### Legenda karaokê (marca do estilo)
- Duas linhas centradas em y ≈ 958. O bloco inteiro aparece **apagado** (30%) e cada palavra **acende** com brilho branco quando é dita.
- Palavras-chave em negrito: marque com `*palavra*` ou `*várias palavras*`.
- Versículos em itálico, entre aspas “ ”.

### Selo da referência bíblica
Pílula escura com contorno branco, uma pequena cruz, o livro em regular e capítulo:versículo em negrito (ex.: "✝ PROVÉRBIOS **4:23**"). Aparece quando o versículo começa e fica até o fim da cena.

---

## 4. Estrutura narrativa

| Bloco | Conteúdo | Tipo |
|---|---|---|
| Abertura da marca (0–2 s) | Logo sobe e revela | automático |
| Gancho | "Só um lembrete amigo, à luz da Palavra." + torre | `abertura` |
| 10 itens | "Pessoas *[qualidade]* *[atitude]*." → versículo + selo | `item` (n, cor, objeto, verso) |
| Virada reflexiva | "A forma como as pessoas te tratam é um reflexo do que vive dentro delas" → Lc 6:45 | `reflexo` |
| Valor | "não a medida do seu valor, meu amigo." → Sl 139:14 | `valor` |
| Convite | "Então, cresça até ser a pessoa desta lista" → Ef 4:13; torre com ✓ | `final` |
| Chamada | "Comente ASCENDER e eu te envio as afirmações bíblicas…" | `cta` |
| Encerramento da marca | Logo ao centro + Seguir → Seguindo | automático |

### Regras de texto
- Cada princípio tem **5 palavras ou menos**: "Pessoas + qualidade + atitude". Negrito na qualidade e na atitude.
- O versículo **confirma o princípio**, não o repete. Use um trecho curto (até 2 blocos de legenda) e a referência exata.
- Princípios em ordem que **cresce**: dos relacionais (edificar, incluir) aos interiores (paz, deixar ir) e aos generosos (apoiar, celebrar).
- O fecho sempre volta ao valor da pessoa diante de Deus e convida a crescer.
- A palavra-chave da chamada (ex.: ASCENDER) deve ser a mesma da sua automação de mensagens.

### Pares princípio ↔ versículo já usados (NVI)
| # | Princípio | Versículo |
|---|---|---|
| 1 | Confiantes edificam | 1 Ts 5:11 "Edifiquem-se uns aos outros" |
| 2 | Bondosas incluem | Rm 15:7 "Aceitem-se uns aos outros…" |
| 3 | Maduras comunicam | Ef 4:15 "Seguindo a verdade em amor" |
| 4 | Curadas colocam limites | Pv 4:23 "Acima de tudo, guarde o seu coração" |
| 5 | Focadas não competem | Gl 6:4 "…sem se comparar com ninguém" |
| 6 | Firmes protegem a paz | Is 26:3 "perfeita paz… propósito está firme" |
| 7 | Crescem e deixam ir | Fp 3:13 "Esquecendo-me das coisas que ficaram para trás" |
| 8 | Alegres encorajam | Pv 17:22 "O coração bem disposto é remédio eficiente" |
| 9 | Bem-sucedidas apoiam | Gl 6:2 "Levem os fardos pesados uns dos outros" |
| 10 | Seguras celebram | Rm 12:15 "Alegrem-se com os que se alegram" |
| — | Reflexo · valor · convite | Lc 6:45 · Sl 139:14 · Ef 4:13 |

---

## 5. Som

### Trilha sonora reflexiva (composta por código, `TRILHA` no roteiro)
- **Instrumentos:** piano + pad caloroso + baixo, em **Ré maior a 72 BPM**.
- **Progressão:** Si menor – Sol – Ré – Lá, que soa introspectiva e esperançosa. Cada cena tem 2 acordes, que mudam com os cortes.
- **Arco emocional:**
  - **Abertura:** só pad.
  - **Itens 1 → 10:** a intensidade cresce de 45% a 78%; o arpejo de piano ganha presença e há uma melodia no topo.
  - **Reflexo:** recua para quase só piano (28%). É o momento de introspecção.
  - **Lista:** chega ao auge (88%).
  - **Encerramento:** cadência **Sol → Ré**, o "amém" da música sacra.

### Efeitos (sincronizados ao quadro, afinados em Ré maior)
| Momento | Som |
|---|---|
| Transições | Sopro |
| Número de cada item | Ping que sobe na escala |
| Início de cada versículo | Ping agudo |
| Objetos | Cintilação, varredura (chuva), trava (limites), pop (apoio) |
| ✓ da lista | Pings ascendentes |
| Encerramento | Impacto suave, pop do botão, clique do toque, ping |

### Mistura
- Total em **-20 LUFS**, pico ≤ -2 dB. A trilha fica ~12 dB abaixo de uma voz a -16 LUFS.
- **Ficheiros de saída:**
  - `*-mix.wav`: trilha + efeitos;
  - `*-sfx.wav`: só efeitos;
  - `*-trilha.wav`: só música, para mixar com a sua voz.

---

## 6. Como fazer um vídeo novo

**Opção A, pelo editor (recomendado):** abra o [Estúdio Kingdom](https://claude.ai/artifact/W9UwgwyZhVBCDb3MsHz3S4) e escreva no painel **Direção para o Claude**. O pedido chega automaticamente à sessão, que aplica, renderiza e responde no próprio editor.

**Opção B, por comandos:**
1. Edite `videos/modelo-ascensao/roteiro.js`. Os elementos da marca já estão configurados no topo; troque só `ROTEIRO`.
2. Faça o render (~5 min):
```bash
node .claude/skills/motionmaxxing/scripts/render.mjs videos/modelo-ascensao/index.html videos/modelo-ascensao/saida/mudo.mp4 --width 1080 --height 1920 --grain 0.04 --crf 17
```
3. Gere a trilha, os efeitos, a legenda e o roteiro de locução:
```bash
cd videos/modelo-ascensao/saida && python3 ../sons.py mudo.mp4 && python3 ../exportar_roteiro.py mudo.mp4
```
4. Junte o áudio ao vídeo:
```bash
ffmpeg -i mudo.mp4 -i mudo-mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest video.mp4
```
Opções do `sons.py`: `--nivel-trilha -8` (volume da música em dB), `--sem-trilha`, `--ambiencia luz|escura`.

### Checklist antes de publicar
- [ ] Cada versículo conferido na tradução escolhida, com a referência exata no selo.
- [ ] Só laranja, grafite e branco em todos os quadros.
- [ ] Abertura (logo sobe) e encerramento (logo desce + Seguir) presentes.
- [ ] @ e logo visíveis do início ao fim.
- [ ] Palavra-chave da chamada igual à da automação de mensagens.
- [ ] Final parado ≤ 1,4 s; áudio em -20 LUFS; voz gravada pelo roteiro de locução.

---

## 7. Esqueleto de roteiro

```js
window.MARCA_DAGUA = { texto: '@kingdomtraining.center', y: 1050, tamanho: 17, opacidade: 0.4, opacidadeSelo: 0.8 };
window.LOGO_TOPO   = { src: 'logo-kingdom.png', y: 92, tamanho: 46, opacidade: 0.95 };
window.INTRO_LOGO  = { duracao: 2.0, inicioConteudo: 1.2, tamanhoInicial: 140, yInicial: 600, zoom: 1.15 };
window.OUTRO_LOGO  = { duracao: 3.6, descida: 1.4, yLogo: 470, tamanhoLogo: 130, zoom: 1.15,
  chamada: 'Siga a página', handle: '@kingdomtraining.center', botao: 'Seguir', botaoFeito: 'Seguindo' };
window.TRILHA      = { estilo: 'reflexiva', bpm: 72, tom: 'Ré maior' };

window.ROTEIRO = [
  { tipo: 'abertura', frases: ['Só um lembrete *amigo,*', ['à luz da *Palavra.*', 0.2]] },
  { tipo: 'item', n: 1, cor: '#b83600', objeto: 'edificar',
    frases: ['Pessoas *confiantes* *edificam.*'],
    verso: { blocos: ['“Edifiquem-se', '*uns aos outros.*”'], ref: '1 TESSALONICENSES 5:11' } },
  // … itens 2 a 10, com a cor a subir: #cc3d00 #e04400 #f04a00 #ff5200 #ff6301 #ff7a27 #ff8f47 #ffa468 #ffbb8c
  { tipo: 'reflexo', cor: '#e05a10', objeto: 'reflexo', frases: ['A forma como as pessoas', 'te tratam é um *reflexo*', 'do que vive *dentro delas,*'],
    verso: { blocos: ['“A boca fala', 'do que está *cheio o coração.*”'], ref: 'LUCAS 6:45' } },
  { tipo: 'valor', cor: '#ff7a27', objeto: 'valor', frases: ['não a medida', 'do seu *valor,*', ['meu *amigo.*', 0.2]],
    verso: { blocos: ['“Tu me fizeste', 'de modo *especial e admirável.*”'], ref: 'SALMOS 139:14' } },
  { tipo: 'final', cor: '#ff7a27', frases: ['Então, *cresça*', 'até ser a pessoa *desta lista,*'],
    verso: { blocos: ['“atingindo a medida', 'da *plenitude de Cristo.*”'], ref: 'EFÉSIOS 4:13' } },
  { tipo: 'cta', cor: '#ff7a27', saida: 1.0,
    frases: ['Comente *ASCENDER,*', 'e eu te envio', 'as *afirmações bíblicas*', 'que vão te ajudar', ['a *chegar lá.*', 0.4]] },
];
```
O número de itens pode variar (5, 7, 10). Mantenha a cor a subir do queimado ao pêssego.

---

## 8. Pedido pronto para o Claude

> Usando o **Template Kingdom Training** (`videos/templates/Template-Kingdom-Training.md` e o código em `videos/modelo-ascensao/`), crie um vídeo vertical em português sobre **[TEMA, ex.: "7 hábitos de quem lidera bem"]**. Cada princípio deve ter no máximo 5 palavras e ser confirmado por um versículo (NVI) com a referência no selo. Mantenha a identidade da marca: só laranja, grafite e branco; logo no topo; marca d'água @kingdomtraining.center; abertura com o logo a subir; encerramento com Seguir → Seguindo; e trilha reflexiva. Chamada final: "Comente **[PALAVRA]**". Gere o MP4 com som, a trilha separada, a legenda .srt e o roteiro de locução, e me mande. Atualize também o editor.

---

## 9. Lições aprendidas
- A força do formato está no **par princípio → versículo**: o princípio dá a ideia, a Palavra dá autoridade e profundidade.
- A subida de cor da cúpula e a intensidade crescente da trilha **contam a ascensão sem palavras**; não quebre essa ordem.
- O recuo da música no "reflexo" é o momento emocional do vídeo; deixe silêncio respirar ali.
- O selo verificado, o @ e o botão Seguir usam a paleta da marca, e não o azul do Instagram, para manter a identidade.
- Confira sempre os versículos na tradução que a sua audiência usa (NVI, ARA ou ARC) antes de publicar.
