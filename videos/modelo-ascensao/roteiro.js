/* =====================================================================
   ROTEIRO — "10 princípios de quem está crescendo" (com base bíblica)
   Versículos: Nova Versão Internacional (NVI), trechos.
   Tipos de cena: abertura · item · reflexo · valor · final · cta
   - '*palavra*' ou '*várias palavras*' = negrito na legenda
   - item: n (número), cor (cúpula), objeto (símbolo), frases (o princípio),
           verso: { blocos: [...], ref: 'LIVRO cap:vers' }  -> dito depois, em itálico, com selo
   Objetos: edificar, incluir, comunicar, limites, focar, paz, deixar,
            encorajar, apoiar, celebrar, reflexo, valor
   ===================================================================== */
window.ROTEIRO = [
  { tipo: 'abertura', frases: ['Só um lembrete *amigo,*', ['à luz da *Palavra.*', 0.2]] },

  { tipo: 'item', n: 1, cor: '#e9736f', objeto: 'edificar',
    frases: ['Pessoas *confiantes* *edificam.*'],
    verso: { blocos: ['“Edifiquem-se', '*uns aos outros.*”'], ref: '1 TESSALONICENSES 5:11' } },

  { tipo: 'item', n: 2, cor: '#ef8a50', objeto: 'incluir',
    frases: ['Pessoas *bondosas* *incluem.*'],
    verso: { blocos: ['“Aceitem-se uns aos outros,', 'da mesma forma que *Cristo os aceitou.*”'], ref: 'ROMANOS 15:7' } },

  { tipo: 'item', n: 3, cor: '#e7aa4c', objeto: 'comunicar',
    frases: ['Pessoas *maduras* *comunicam.*'],
    verso: { blocos: ['“Seguindo a *verdade em amor.*”'], ref: 'EFÉSIOS 4:15' } },

  { tipo: 'item', n: 4, cor: '#d8c04e', objeto: 'limites',
    frases: ['Pessoas *curadas* colocam *limites.*'],
    verso: { blocos: ['“Acima de tudo,', '*guarde o seu coração.*”'], ref: 'PROVÉRBIOS 4:23' } },

  { tipo: 'item', n: 5, cor: '#b3c652', objeto: 'focar',
    frases: ['Pessoas *focadas* não *competem.*'],
    verso: { blocos: ['“Cada um examine os próprios atos,', '*sem se comparar com ninguém.*”'], ref: 'GÁLATAS 6:4' } },

  { tipo: 'item', n: 6, cor: '#7cbf8a', objeto: 'paz',
    frases: ['Pessoas *firmes*', 'protegem a sua *paz.*'],
    verso: { blocos: ['“Guardarás em *perfeita paz*', 'aquele cujo *propósito está firme.*”'], ref: 'ISAÍAS 26:3' } },

  { tipo: 'item', n: 7, cor: '#58b3a8', objeto: 'deixar',
    frases: ['Pessoas que *crescem*', 'aprendem a *aceitar*', 'e a *deixar ir.*'],
    verso: { blocos: ['“Esquecendo-me das coisas', 'que *ficaram para trás.*”'], ref: 'FILIPENSES 3:13' } },

  { tipo: 'item', n: 8, cor: '#a28fd0', objeto: 'encorajar',
    frases: ['Pessoas *alegres* *encorajam.*'],
    verso: { blocos: ['“O coração bem disposto', 'é *remédio eficiente.*”'], ref: 'PROVÉRBIOS 17:22' } },

  { tipo: 'item', n: 9, cor: '#8a86cf', objeto: 'apoiar',
    frases: ['Pessoas *bem-sucedidas*', 'sempre *apoiam.*'],
    verso: { blocos: ['“Levem os fardos pesados', '*uns dos outros.*”'], ref: 'GÁLATAS 6:2' } },

  { tipo: 'item', n: 10, cor: '#c68bc9', objeto: 'celebrar',
    frases: ['Pessoas *seguras*', 'celebram *os outros.*'],
    verso: { blocos: ['“Alegrem-se', '*com os que se alegram.*”'], ref: 'ROMANOS 12:15' } },

  { tipo: 'reflexo', cor: '#9b7fc0', objeto: 'reflexo',
    frases: ['A forma como as pessoas', 'te tratam é um *reflexo*', 'do que vive *dentro delas,*'],
    verso: { blocos: ['“A boca fala', 'do que está *cheio o coração.*”'], ref: 'LUCAS 6:45' } },

  { tipo: 'valor', cor: '#8f78b6', objeto: 'valor',
    frases: ['não a medida', 'do seu *valor,*', ['meu *amigo.*', 0.2]],
    verso: { blocos: ['“Tu me fizeste', 'de modo *especial e admirável.*”'], ref: 'SALMOS 139:14' } },

  { tipo: 'final', cor: '#8f78b6',
    frases: ['Então, *cresça*', 'até ser a pessoa *desta lista,*'],
    verso: { blocos: ['“atingindo a medida', 'da *plenitude de Cristo.*”'], ref: 'EFÉSIOS 4:13' }, saidaExtra: 0.3 },

  { tipo: 'cta', cor: '#8f78b6', saida: 1.0,
    frases: ['Comente *ASCENDER,*', 'e eu te envio', 'as *afirmações bíblicas*', 'que vão te ajudar', ['a *chegar lá.*', 0.4]] },
];
