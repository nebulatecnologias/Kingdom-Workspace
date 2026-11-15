# Modelo de vídeo "ascensão" (9:16)

Estilo do vídeo de referência em inglês ("Just a friendly reminder… Confident people uplift…"):
cúpula luminosa que muda de cor a cada item (vermelho → violeta), figura humana com luz de contorno
rosa/ciano, número 3D, objeto simbólico por princípio, holofotes, torre de 10 discos (a "lista"),
contorno de cabeça no final e legenda karaokê em duas linhas (palavra dita acende, palavra-chave em negrito).

Nesta versão cada princípio é seguido de um **versículo** (itálico na legenda) com **selo da referência**.
Fonte: Google Sans em todos os textos. Saída: 1080×1920, 30 fps, com efeitos sonoros e pad ambiente.

## Arquivos
| arquivo | papel |
|---|---|
| `motor.js` | motor gráfico (não muda entre vídeos) |
| `roteiro.js` | **o único arquivo que muda por vídeo** |
| `sons.py` | sintetiza efeitos + pad (`--ambiencia luz`) e normaliza a -20 LUFS |
| `exportar_roteiro.py` | gera `*-legenda.srt` e `*-roteiro-locucao.txt` |

## Gerar
```bash
node .claude/skills/motionmaxxing/scripts/render.mjs videos/modelo-ascensao/index.html videos/modelo-ascensao/saida/mudo.mp4 --width 1080 --height 1920 --grain 0.04 --crf 17
```
```bash
cd videos/modelo-ascensao/saida && python3 ../sons.py mudo.mp4 --ambiencia luz && python3 ../exportar_roteiro.py mudo.mp4
```
```bash
ffmpeg -i mudo.mp4 -i mudo-mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest video.mp4
```

## Tipos de cena
| tipo | o que mostra | campos |
|---|---|---|
| `abertura` | torre de discos se montando | `frases` |
| `item` | cúpula + figura + número + objeto; depois o versículo | `n`, `cor`, `objeto`, `frases`, `verso{blocos, ref}` |
| `reflexo` | espelho dourado; coração no peito quando a palavra "coração" é dita | `frases`, `verso` |
| `valor` | régua (a "medida") que se apaga em "valor"; aura dourada em "especial" | `frases`, `verso` |
| `final` | torre com ✓ a cada item | `frases`, `verso` |
| `cta` | contorno de cabeça + selo "COMENTE ASCENDER" → "SUBA PARA A LISTA" | `frases`, `selo1`, `selo2` |

Objetos: `edificar`, `incluir`, `comunicar`, `limites`, `focar`, `paz`, `deixar`, `encorajar`, `apoiar`, `celebrar`.

Negrito na legenda: `*palavra*` ou `*várias palavras*`. Pausa extra: `['texto', 0.4]`.
Ritmo: `window.RITMO = { base, porLetra, virgula, ponto, verso }` em `roteiro.js`.
