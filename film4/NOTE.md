# NOTE: Reel "Cinco perguntas", O Conselheiro (vertical, 59,9 s)

Entrega: `O-Conselheiro-cinco-perguntas-9x16.mp4` (1080×1920, 30 fps, com som) e `index.html` editável.

- Formato do reel 10x Mindset do próprio utilizador: figura a traço pontilhado num anel com aura ondulada, pontos de progresso, legendas palavra a palavra com as palavras-chave a negrito e brilho.
- Guião novo, aprovado: "Cinco perguntas que destravam qualquer decisão difícil", com o fecho "Marca o teu Advising. O link está na bio."
- Figura e desenhos novos: um pensador com a mão no queixo e um desenho por pergunta (lanterna, iceberg sintoma/causa, ampulheta de 6 meses, caixa delegada à equipa, degraus "esta semana"). No fecho surgem as interrogações e "alguém que veja o que tu não estás a ver"; termina com o selo do Conselheiro e o botão.
- Marca: café #2D1E17, off-white #EDE6DC, laranja #FF5E1E nos elementos activos, Google Sans.
- Voz: ElevenLabs George (eleven_v3). Ficou com ~60 s em vez dos 70 previstos, porque a voz é mais rápida do que estimei.
- Som: voz, cama ambiente (sem permissão de música na chave), um toque por pergunta e o encaixe do selo.
- `look.py --expect 59.9 --expect-audio`: **G0 PASS**, **G2 PASS**, **G3 PASS** (pausa final 0,47 s, último plano 6 %). Áudio a −14,0 LUFS, pico real −1,3 dBFS. `lint.mjs`: **G5 PASS**. `selfTest`: **PASS** (0 desajustes).
- Nota: na primeira versão o G0 falhou por falta de movimento, porque a análise é a 96×54 px e o traço fino não chegava. A correção foi pôr a luz quente por trás da figura a "respirar" e o anel a rodar devagar.
