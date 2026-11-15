/* =====================================================================
   ROTEIRO DE EDIÇÃO — "Kingdom Founders" (bruto IMG_E5326.MOV)
   Estilo: referência "Shelton Brother" (pessoa a falar + grafismos), identidade Kingdom Training.
   Tempos em segundos do vídeo JÁ EDITADO (corte da tomada repetida aplicado).
   Índices (i, iAnos, iToque…) = posição da palavra em FALAS.palavras (ver falas.js).
   modo: 'split' (grafismo em cima + apresentador no cartão) | 'full' (apresentador em ecrã inteiro)
   tipos de grafismo: pergunta, meta, equacao, crescimento, formula, oferta (claro: true), chamada
   ===================================================================== */
window.DURACAO_VIDEO = 66.75;
window.FOCO_Y = 0.43;   // altura do rosto no quadro original (0 topo – 1 base)
window.PALAVRAS_DESTAQUE = /^(duro|eficiente|eficiência|método|conhecimento|ambiente|frequência|resultados|Kingdom|Founders|20|100|milhão|milhões|link|turma|cima|MT)$/i;

window.SECOES = [
  { t0: 0, t1: 4.6, modo: 'split', tipo: 'pergunta', titulo: 'Crescer *na vida*',
    cartoes: [{ i: 9, icone: 'subir', texto: 'Crescer na vida' }, { i: 14, icone: 'martelo', texto: 'Trabalhar duro' }], iPergunta: 15 },
  { t0: 4.6, t1: 13.2, modo: 'split', tipo: 'meta', titulo: 'Trabalho duro *por anos*',
    anos: 20, iAnos: 31, meta: '100 mil MT por mês', iMeta: 38, chega: 0.32, iTrava: 44, textoTrava: 'E a meta não chega.' },
  { t0: 13.2, t1: 18.3, modo: 'full', cortes: [16.85] },
  { t0: 18.3, t1: 24.55, modo: 'split', tipo: 'equacao', titulo: 'Trabalho *eficiente*',
    itens: [{ i: 66, icone: 'martelo', texto: 'Trabalho' }, { i: 76, icone: 'raio', texto: 'Eficiência' }, { i: 79, icone: 'chave', texto: 'Método' }] },
  { t0: 24.55, t1: 34.15, modo: 'split', tipo: 'crescimento', titulo: 'Quem encontrou *um método*',
    iAnos: 90, rotulos: ['Ano 1', 'Ano 2', 'Ano 3', 'Depois'],
    etapas: [{ i: 96, texto: '100 mil MT' }, { i: 100, texto: '1 milhão MT' }, { i: 103, texto: '10 milhões MT' }],
    iUnico: 106, textoUnico: 'em um único ano' },
  { t0: 34.15, t1: 36.4, modo: 'full' },
  { t0: 36.4, t1: 44.62, modo: 'split', tipo: 'formula', titulo: 'O que eles *entenderam*', circulo: ['A', 'fórmula'],
    itens: [{ i: 120, icone: 'livro', texto: 'Conhecimento certo' }, { i: 124, icone: 'pessoas', texto: 'Ambiente certo' },
            { i: 129, icone: 'ondas', texto: 'Frequência' }, { i: 134, icone: 'alvo', texto: 'Resultados' }] },
  { t0: 44.62, t1: 55.35, modo: 'split', tipo: 'oferta', claro: true, titulo: 'Kingdom *Founders*', iTitulo: 148,
    itens: [{ i: 155, icone: 'livro', texto: 'Conhecimento certo' }, { i: 160, icone: 'pessoas', texto: 'Ambiente certo' },
            { i: 165, icone: 'alvo', texto: 'Resultados este ano' }, { i: 177, icone: 'subir', texto: '…e no próximo ano' }] },
  { t0: 55.35, t1: 63.05, modo: 'split', tipo: 'chamada', titulo: 'A próxima *turma*',
    programa: 'Kingdom Founders', subtitulo: 'Próxima turma', lista: ['Conhecimento certo', 'Ambiente certo', 'Resultados'],
    botao: 'Quero fazer parte', botaoFeito: 'Vou fazer parte ✓', iToque: 193, iLink: 182, textoLink: 'Link abaixo' },
  { t0: 63.05, t1: 66.75, modo: 'full' },
];

// Fecho com a marca (depois do fim da fala)
window.FECHO = { duracao: 2.2, titulo: 'Kingdom *Founders*', handle: '@kingdomtraining.center' };

// Trilha motivacional discreta por baixo da voz: Ré maior, 96 BPM (I–V–vi–IV), cresce até a chamada
window.TRILHA = { bpm: 96, acordes: [
  [0, 'D', .40, 2.3], [2.3, 'A', .40, 2.3], [4.6, 'Bm', .45, 4.3], [8.9, 'G', .45, 4.3], [13.2, 'Em', .30, 2.5], [15.7, 'A', .30, 2.6],
  [18.3, 'D', .50, 3.1], [21.4, 'A', .50, 3.15], [24.55, 'Bm', .60, 4.8], [29.35, 'G', .62, 4.8], [34.15, 'Em', .35, 2.25],
  [36.4, 'D', .60, 4.1], [40.5, 'A', .64, 4.12], [44.62, 'G', .66, 5.36], [49.98, 'D', .68, 5.37], [55.35, 'Bm', .70, 3.85],
  [59.2, 'A', .70, 3.85], [63.05, 'G', .55, 1.85], [64.9, 'A', .55, 1.85], [66.75, 'D', .5, 2.2]] };
