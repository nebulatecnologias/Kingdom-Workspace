# NOTE: Reel "Sete sinais", Kingdom Founders (vertical, 57 s)

Entrega: `Kingdom-Founders-sete-sinais-9x16.mp4` (1080×1920, 30 fps, H.264 + AAC), `index.html` editável, `captions.js`, `audio/`.

## O que é
- Guião original da Kingdom (aprovado pelo utilizador): "Sete sinais de que o teu negócio depende demasiado de ti", com chamada final "Segue a Kingdom Founders" e @kingdomfounderss.
- Voz: ElevenLabs, George, modelo eleven_v3 (voz B escolhida pelo utilizador). 55,4 s de locução, entrada aos 0,3 s.
- Marca Kingdom Founders: fundo preto com luz âmbar no topo; dourado #C29D5A nos números e na palavra-chave de cada legenda (Instrument Serif itálico); texto em Aptos SemiBold. Os traços activos e os pontos de progresso estão a laranja #FF5E1E, como o utilizador pediu.

## Relação com a referência (`referencias/referencia-1.mp4`, de outro criador)
- Fica do estilo geral: traço fino luminoso num fundo escuro, legendas palavra a palavra, pontos de progresso no topo, lista numerada.
- É original: o guião, o tema, o globo da Founders no início e no fim, os sete desenhos (férias e telefone, decisões a convergir, gráfico parado, cabeça com processos emaranhados, documento corrigido, fogos, caminhos sem começo), os traços que se arrumam no "É ordem", a tipografia e as cores.
- Não foi usado nenhum plano, desenho, texto ou som da referência.

## Números medidos
- `look.py --expect 57 --expect-audio`:
  - **G0 PASS:** 57,00 s, com áudio.
  - **G2 PASS:** nenhuma sequência de mais de 3 frames planos.
  - **G3 PASS:** o vídeo acaba em movimento; o último plano dura 1,97 s, 3 % do filme.
  - Áudio: −14,0 LUFS, pico real −1,3 dBFS, audível até aos 56,92 s.
- `lint.mjs`: **GATE G5 PASS**.
- `Motion.selfTest`: **PASS**, 24 amostras, 131 elementos, 0 desajustes.
- **Movimento:** variação média de 0,2/255, muito abaixo da banda humana. É calmo de propósito, como a referência (0,4/255). O que está vivo em cada momento são as legendas e o desenho dos traços.

## Som
- Voz com a música a baixar 6 dB enquanto se fala.
- Cama ambiente: a chave da ElevenLabs não tem `music_generation`, por isso é um bed de 21 s feito com o endpoint de efeitos sonoros e repetido com transições suaves.
- Efeitos: um toque suave em cada número, o encaixe no "É ordem" com a música a descer antes, e um sopro quente no final.

## O que ainda melhoraria
- Uma partitura a sério (precisa da permissão de música na chave).
- Há ~0,5 s quase vazios no início dos sinais 2 e 6, enquanto o desenho começa.
- O sotaque da voz não foi verificado por mim (não consigo ouvir).
