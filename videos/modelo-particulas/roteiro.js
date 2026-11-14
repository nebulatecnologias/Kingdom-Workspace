/* =====================================================================
   ROTEIRO — "O avanço da inteligência artificial"
   Cada cena: { tipo, frases, ...parâmetros do tipo }
   - frases: cada string vira um bloco de legenda; palavras entram uma a uma.
     Use ['texto', pausaExtraEmSegundos] para segurar mais tempo.
   - Índices (iEtiqueta, iDetecta, ...) contam as palavras DENTRO da cena, a partir de 0.
   Tipos disponíveis: retrato, citacao, linhaTempo, visao, documento, chat,
                      palavra, rota, grafico, simbolo
   ===================================================================== */
window.ROTEIRO = [
  { tipo: 'retrato', pintor: 'maquina', celula: 7,
    frases: ['Em 1950,', 'Alan Turing', 'fez uma pergunta', 'simples:'],
    etiqueta: 'ALAN TURING', rotulo: 'MATEMÁTICO / 1912–1954', iEtiqueta: 2,
    regua: { esq: '1936', dir: '1954', de: 0, ate: 1, texto: p => String(Math.round(1936 + p * 14)) } },

  { tipo: 'citacao', ponto: true, frases: ['As máquinas', ['podem pensar?', 0.5]],
    linhas: ['As máquinas', 'podem pensar?'] },

  { tipo: 'linhaTempo', rotulo: 'ANO', de: 1956, ate: 1997,
    frases: ['Por décadas,', 'a resposta', 'foi:', 'ainda não.'],
    marcos: [[1956, 'DARTMOUTH'], [1966, 'ELIZA'], [1974, '1º INVERNO'], [1987, '2º INVERNO'], [1997, 'DEEP BLUE']] },

  { tipo: 'retrato', pintor: 'rei', celula: 7, caixa: [200, 250, 320, 460],
    frases: ['Em 1997,', 'uma máquina', 'vence Kasparov', 'no xadrez.'],
    etiqueta: 'DEEP BLUE', rotulo: 'IBM / 1997', iEtiqueta: 0,
    regua: { esq: 'PARTIDA 1', dir: 'PARTIDA 6', de: 0, ate: 6, texto: p => p > 0.98 ? '3½ – 2½' : 'Partida ' + (1 + Math.floor(p * 5.99)) } },

  { tipo: 'visao', frases: ['Em 2012,', 'ela aprende', ['a ver.', 0.3]],
    etiqueta: 'ALEXNET', rotulo: 'IMAGENET / 2012', iDetecta: 4, deteccao: 'GATO', confianca: 98 },

  { tipo: 'documento', frases: ['Em 2017,', 'um artigo', 'do Google', ['muda tudo.', 0.3]],
    arquivo: 'ATTENTION_IS_ALL_YOU_NEED.PDF', titulo: ['Attention Is All', 'You Need'],
    rodape: 'GOOGLE · 8 AUTORES · 2017', iDestaque: 6, destaque: 'TRANSFORMER' },

  { tipo: 'chat', frases: ['Em 2022,', 'ela aprende', 'a conversar.', 'Cem milhões', 'de pessoas', ['em dois meses.', 0.2]],
    pergunta: ['O que é inteligência', 'artificial?'], iPergunta: 2, iResposta: 4,
    contador: { iInicio: 6, iFim: 7, de: 0, ate: 100, sufixo: ' M', etiqueta: 'USUÁRIOS', rotulo: 'EM 2 MESES', iRotulo: 11 } },

  { tipo: 'palavra', texto: 'AGENTES', iForma: 11, rotulo: 'SISTEMAS QUE AGEM SOZINHOS',
    frases: ['Hoje,', 'ela já não', 'só responde.', 'Ela age.', 'Isso tem nome:', ['agentes.', 0.5]] },

  { tipo: 'rota', rotulo: 'ETAPAS',
    frases: ['Recebe', 'um objetivo,', 'pesquisa,', 'planeja,', 'executa,', 'testa', ['e entrega.', 0.3]],
    etapas: [['OBJETIVO', 2], ['PESQUISA', 3], ['PLANO', 4], ['EXECUÇÃO', 5], ['TESTE', 6], ['ENTREGA', 8]] },

  { tipo: 'grafico', etiqueta: 'METR', rotulo: 'TAREFAS QUE A IA FAZ SOZINHA',
    frases: ['E o tamanho', 'das tarefas', 'que ela faz', 'sozinha', 'dobra', 'a cada', ['sete meses.', 0.4]],
    iDobra: 9, anos: ['2019', '2025'], inicio: 'SEGUNDOS', fim: '≈ 1 HORA', dobras: 10 },

  { tipo: 'simbolo', texto: '?', tamanho: 520, dx: -10, iDispersa: 12,
    frases: ['A pergunta', 'de Turing', 'mudou.', 'Não é mais', 'se as máquinas', ['podem pensar.', 0.3]] },

  { tipo: 'citacao', ponto: true, saida: 2.1, dissolver: 1.5, frases: ['É o que você', 'vai fazer com elas.'],
    linhas: ['É o que você', 'vai fazer com elas.'], tamanho: 46 },
];
