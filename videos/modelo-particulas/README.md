# Modelo de vídeo "partículas" (9:16)

Recria o estilo do vídeo de referência: fundo escuro com vinheta e grão, objetos em pontilhado/partículas,
wireframes com etiquetas mono, régua com ano em serifa, contadores, palavra gigante feita de partículas,
citação em serifa itálica e legenda palavra-a-palavra (palavra atual em negrito branco, anteriores em cinza).

Saída: 1080×1920, 30 fps, MP4 sem áudio + legenda `.srt` + roteiro de locução com tempos.

## Arquivos

| arquivo | papel |
|---|---|
| `motor.js` | motor gráfico (não muda entre vídeos): partículas, meio-tom, tipos de cena, legenda, transições |
| `roteiro.js` | **o único arquivo que muda por vídeo**: texto e cenas |
| `index.html` | junta os dois |
| `exportar_roteiro.py` | gera `*-legenda.srt` e `*-roteiro-locucao.txt` a partir do render |
| `saida/` | vídeos gerados |

## Fazer um vídeo novo

1. Edite `roteiro.js` (ou peça ao Claude: "faz um vídeo sobre X neste modelo").
2. Renderize:

```bash
node .claude/skills/motionmaxxing/scripts/render.mjs videos/modelo-particulas/index.html videos/modelo-particulas/saida/video.mp4 --width 1080 --height 1920 --grain 0.03 --crf 17
```

3. Gere legenda e roteiro de locução:

```bash
python3 videos/modelo-particulas/exportar_roteiro.py videos/modelo-particulas/saida/video.mp4
```

Pré-visualizar quadros soltos: `render.mjs ... --still 2,10,20 pasta/`.

## Tipos de cena

| tipo | o que mostra | parâmetros principais |
|---|---|---|
| `retrato` | objeto/foto em meio-tom com cantoneiras, etiqueta e régua com ano | `pintor` (`maquina`, `rei`) ou `imagem`, `etiqueta`, `rotulo`, `regua{esq,dir,de,ate,texto(p)}` |
| `citacao` | ponto vivo → frase em serifa itálica (sem legenda) | `linhas`, `ponto`, `dissolver` (seg. finais em partículas) |
| `linhaTempo` | contador de ano + linha com marcos | `de`, `ate`, `marcos[[ano,'NOME']]` |
| `visao` | moldura de imagem, varredura e caixa de deteção | `etiqueta`, `rotulo`, `iDetecta`, `deteccao`, `confianca` |
| `documento` | documento wireframe com título em partículas e destaque circular | `arquivo`, `titulo`, `rodape`, `iDestaque`, `destaque` |
| `chat` | telefone, pergunta, "digitando", resposta, contador grande | `pergunta`, `iPergunta`, `iResposta`, `contador{...}` |
| `palavra` | nuvem de partículas que forma uma palavra gigante | `texto`, `iForma`, `rotulo` |
| `rota` | caminho sinuoso de etapas com contador `01 / 06` | `etapas[['NOME', iPalavra]]` |
| `grafico` | curva exponencial desenhada em partículas | `etiqueta`, `rotulo`, `iDobra`, `anos`, `inicio`, `fim` |
| `simbolo` | símbolo gigante em partículas que se dispersa num ponto | `texto`, `tamanho`, `iDispersa` |

Os índices `i...` contam as palavras **dentro da cena**, a partir de 0. As frases viram blocos de legenda;
`['texto', 0.4]` segura 0,4 s a mais depois do bloco.

### Fotos reais em meio-tom
Em `index.html`, antes de `roteiro.js`, declare `window.IMAGENS_ROTEIRO = { turing: 'img/turing.jpg' }`
e use `imagem: 'turing'` numa cena `retrato`.

## Ritmo e voz
O ritmo padrão é ~2,8 palavras/s (`window.RITMO` em `roteiro.js` ajusta `base`, `porLetra`, `virgula`, `ponto`).
Grave a voz lendo `*-roteiro-locucao.txt` no tempo indicado, ou grave livremente e re-sincronize
os tempos das palavras ao áudio (transcrição com marcação de tempo → tempos no roteiro).
