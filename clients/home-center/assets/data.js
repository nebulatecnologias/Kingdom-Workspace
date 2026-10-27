/*
 * Home Center — dados ilustrativos para demonstração.
 * Os totais de Outubro (até 26 Out) batem com o protótipo original: 18,4 M MT,
 * 2.890 visitas, 410 vendas, NPS 41, campanhas 1,42 M MT com retorno 2,2×.
 * Tudo o que o utilizador regista soma-se a estes valores e fica no navegador.
 */
window.HC_SEED = function () {
  const ORIGENS = ['espontanea', 'whatsapp', 'redes', 'empresas', 'site', 'outdoors', 'parcerias'];
  const o = (a) => Object.fromEntries(ORIGENS.map((k, i) => [k, a[i]]));

  const lojas = {
    angola: { nome: 'Av. de Angola', sub: 'Loja principal', morada: 'Av. de Angola 2356, Maputo', vendedores: 45, meta: 12500000, setembro: 10500000 },
    baia: { nome: 'Baía Mall', sub: 'Loja G69', morada: 'Baía Mall, loja G69, Maputo', vendedores: 12, meta: 4500000, setembro: 3650000 },
    matola: { nome: 'Matola', sub: 'Rua 11.117', morada: 'Rua 11.117, n.º 75, Matola', vendedores: 12, meta: 4000000, setembro: 3150000 }
  };

  // Totais do mês até 26 Out, por loja.
  const totais = {
    angola: { visitas: 1720, vendas: 236, valor: 11200000, recebido: 11200000, descontos: 660800, origem: o([104, 48, 27, 31, 12, 7, 7]) },
    baia: { visitas: 610, vendas: 92, valor: 3900000, recebido: 3874500, descontos: 288600, origem: o([45, 20, 12, 3, 5, 3, 4]) },
    matola: { visitas: 560, vendas: 82, valor: 3300000, recebido: 3300000, descontos: 293700, origem: o([40, 18, 10, 3, 4, 6, 1]) }
  };

  const F = (id, data, loja, visitas, vendas, valor, recebido, origem, obs) => ({ id, data, loja, visitas, vendas, valor, recebido, origem: o(origem), obs: obs || '', registado: data + 'T18:10' });
  const fechos = [
    F('f-a24', '2026-10-24', 'angola', 96, 14, 690000, 690000, [6, 3, 2, 1, 1, 0, 1]),
    F('f-b24', '2026-10-24', 'baia', 41, 7, 300000, 300000, [3, 2, 1, 0, 0, 0, 1]),
    F('f-m24', '2026-10-24', 'matola', 38, 6, 245000, 245000, [3, 1, 1, 0, 0, 1, 0]),
    F('f-a25', '2026-10-25', 'angola', 58, 7, 330000, 330000, [3, 2, 1, 0, 1, 0, 0]),
    F('f-b25', '2026-10-25', 'baia', 35, 5, 210000, 210000, [2, 1, 1, 0, 1, 0, 0]),
    F('f-m25', '2026-10-25', 'matola', 22, 3, 120000, 120000, [1, 1, 0, 0, 1, 0, 0]),
    F('f-a26', '2026-10-26', 'angola', 64, 9, 425000, 425000, [4, 2, 1, 1, 0, 1, 0]),
    F('f-b26', '2026-10-26', 'baia', 22, 3, 128000, 102500, [1, 1, 0, 0, 0, 1, 0], 'Pagamento por cartão de 25.500 MT por confirmar no extracto.'),
    F('f-m26', '2026-10-26', 'matola', 20, 3, 118000, 118000, [2, 0, 1, 0, 0, 0, 0])
  ];

  // Base = totais menos os fechos listados, para que apagar ou registar um fecho mexa nos números.
  const base = {};
  for (const k of Object.keys(totais)) {
    const t = totais[k];
    const fs = fechos.filter((f) => f.loja === k);
    const sum = (key) => fs.reduce((a, f) => a + f[key], 0);
    base[k] = {
      visitas: t.visitas - sum('visitas'),
      vendas: t.vendas - sum('vendas'),
      valor: t.valor - sum('valor'),
      recebido: t.recebido - sum('recebido'),
      descontos: t.descontos,
      origem: Object.fromEntries(ORIGENS.map((oo) => [oo, t.origem[oo] - fs.reduce((a, f) => a + f.origem[oo], 0)]))
    };
  }

  const msg = (de, txt, em) => ({ de, txt, em });
  const conversas = [
    { id: 'c1', tipo: 'conversa', canal: 'whatsapp', loja: 'angola', nome: 'Ana Muianga', recebida: '2026-10-26T20:14', estado: 'pendente', fora: true,
      msgs: [msg('cliente', 'Boa noite, o sofá de 3 lugares cinzento do vosso post ainda tem? Entregam na Matola?', '2026-10-26T20:14'), msg('auto', 'Olá Ana, obrigado pela mensagem. Estamos fora do horário de atendimento; um consultor responde a partir das 8h00. Enquanto isso, veja o catálogo: [link do catálogo]', '2026-10-26T20:14')],
      cliente: { tipo: 'Particular', historico: '1 compra anterior', total: 38900, ultima: 'Mesa de centro, Março' }, vendedor: 'Hélio Sitoe', tags: ['Sofás', 'Entrega na Matola'] },
    { id: 'c2', tipo: 'conversa', canal: 'site', loja: 'angola', nome: 'Escritórios Baobá, Lda', recebida: '2026-10-26T16:02', estado: 'pendente', fora: false, formulario: 'Formulário para empresas',
      msgs: [msg('cliente', 'Bom dia. Estamos a mudar de escritório e precisamos de orçamento para 24 secretárias, 24 cadeiras ergonómicas e 2 mesas de reunião. Prazo: fim de Novembro.', '2026-10-26T16:02')],
      cliente: { tipo: 'Empresa', historico: '2 encomendas anteriores', total: 1900000, ultima: 'Cadeiras de escritório, Junho' }, vendedor: 'Marta Nhantumbo', tags: ['Empresa', 'Orçamento'] },
    { id: 'c7', tipo: 'conversa', canal: 'whatsapp', loja: 'matola', nome: 'Fernando Massingue', recebida: '2026-10-26T19:32', estado: 'pendente', fora: true, pedido: 'HC-24815',
      msgs: [msg('cliente', 'Boa noite. A minha sala de jantar era para chegar no dia 24 e até agora nada. Alguém me pode dizer quando vem?', '2026-10-26T19:32'), msg('auto', 'Olá Fernando, obrigado pela mensagem. Estamos fora do horário de atendimento; um consultor responde a partir das 8h00.', '2026-10-26T19:32')],
      cliente: { tipo: 'Particular', historico: 'Pedido HC-24815', total: 118000, ultima: 'Conjunto de sala de jantar, Outubro' }, vendedor: 'Dércia Tembe', tags: ['Entrega atrasada', 'Cliente insatisfeito'] },
    { id: 'c4', tipo: 'conversa', canal: 'instagram', loja: null, nome: 'Sónia Langa', recebida: '2026-10-26T18:47', estado: 'pendente', fora: true, formulario: 'Comentário num post',
      msgs: [msg('cliente', 'Olá! Quanto custa a mesa de jantar de 6 lugares do último post? Tem em branco?', '2026-10-26T18:47'), msg('auto', 'Olá Sónia! Para preços e disponibilidade, fale connosco no WhatsApp: [link do WhatsApp]', '2026-10-26T18:47')],
      cliente: { tipo: 'Particular', historico: 'Sem compras anteriores', total: 0, ultima: '' }, vendedor: '', tags: ['Mesas de jantar', 'Novo contacto'] },
    { id: 'c12', tipo: 'conversa', canal: 'facebook', loja: 'matola', nome: 'Albertina Sitoe', recebida: '2026-10-26T17:55', estado: 'pendente', fora: true, formulario: 'Mensagem na página',
      msgs: [msg('cliente', 'Boa tarde. A loja da Matola tem guarda-roupas de 4 portas em exposição? Queria ver antes de comprar.', '2026-10-26T17:55')],
      cliente: { tipo: 'Particular', historico: 'Sem compras anteriores', total: 0, ultima: '' }, vendedor: '', tags: ['Quartos'] },
    { id: 'c8', tipo: 'conversa', canal: 'whatsapp', loja: 'baia', nome: 'Yolanda Chissano', recebida: '2026-10-27T07:58', estado: 'pendente', fora: true,
      msgs: [msg('cliente', 'Bom dia, têm colchões de casal em promoção? Preciso para esta semana.', '2026-10-27T07:58'), msg('auto', 'Olá Yolanda, um consultor responde a partir das 8h00.', '2026-10-27T07:58')],
      cliente: { tipo: 'Particular', historico: '2 compras', total: 61200, ultima: 'Cómoda, Maio' }, vendedor: 'Neusa Macuácua', tags: ['Colchões'] },
    { id: 'c10', tipo: 'conversa', canal: 'whatsapp', loja: 'angola', nome: 'Rui Sitoe', recebida: '2026-10-27T08:41', estado: 'pendente', fora: false,
      msgs: [msg('cliente', 'Bom dia. Tentei comprar a cama de solteiro com gavetas no site mas parei nos dados de entrega. Posso pagar por M-Pesa aqui?', '2026-10-27T08:41')],
      cliente: { tipo: 'Particular', historico: 'Compra abandonada no site', total: 0, ultima: '' }, vendedor: 'Albino Cossa', tags: ['Compra abandonada', 'Quartos'] },
    { id: 'c5', tipo: 'conversa', canal: 'whatsapp', loja: 'baia', nome: 'Jorge Matsinhe', recebida: '2026-10-26T11:20', estado: 'respondida', fora: false, respostaMin: 12,
      msgs: [msg('cliente', 'Já recebi a cama, obrigado! A equipa da montagem foi impecável.', '2026-10-26T11:20'), msg('equipa', 'Que bom saber, Jorge! Vamos enviar um inquérito de 1 minuto sobre a experiência. Obrigado pela preferência.', '2026-10-26T11:32')],
      cliente: { tipo: 'Particular', historico: '3 compras', total: 146500, ultima: 'Cama de casal, Outubro' }, vendedor: 'Celso Mabunda', tags: ['Quartos', 'Cliente satisfeito'] },
    { id: 'c6', tipo: 'conversa', canal: 'facebook', loja: null, nome: 'Telma Zandamela', recebida: '2026-10-26T09:05', estado: 'respondida', fora: false, respostaMin: 6, formulario: 'Mensagem na página',
      msgs: [msg('cliente', 'Fazem pagamento por M-Pesa? E prestações?', '2026-10-26T09:05'), msg('equipa', 'Bom dia, Telma! Aceitamos M-Pesa, e-Mola, cartão e transferência. As condições de prestações explicamos na loja ou por WhatsApp.', '2026-10-26T09:11')],
      cliente: { tipo: 'Particular', historico: 'Sem compras anteriores', total: 0, ultima: '' }, vendedor: 'Neusa Macuácua', tags: ['Pagamentos'] },
    { id: 'c11', tipo: 'conversa', canal: 'instagram', loja: null, nome: 'Dinis Macamo', recebida: '2026-10-26T15:10', estado: 'respondida', fora: false, respostaMin: 52, formulario: 'Mensagem directa',
      msgs: [msg('cliente', 'Fazem entregas em Marracuene?', '2026-10-26T15:10'), msg('equipa', 'Olá Dinis! Sim, com marcação prévia. Diga-nos o bairro e o produto para confirmarmos a data e o custo.', '2026-10-26T16:02')],
      cliente: { tipo: 'Particular', historico: 'Sem compras anteriores', total: 0, ultima: '' }, vendedor: '', tags: ['Entregas'] },

    // Avaliações públicas: as mesmas aparecem em Satisfação e NPS.
    { id: 'r1', tipo: 'avaliacao', canal: 'google', loja: 'matola', nome: 'Carlos Bila', recebida: '2026-10-21T10:30', estado: 'pendente', estrelas: 2, pedido: 'HC-24766',
      msgs: [msg('cliente', 'Montagem marcada para sábado e ninguém apareceu nem ligou. Perdi o dia todo à espera.', '2026-10-21T10:30')],
      sugestao: 'Carlos, pedimos desculpa pela falha na montagem. Já reagendámos para 31 de Outubro e o gerente da loja da Matola vai ligar-lhe hoje para confirmar.',
      cliente: { tipo: 'Particular', historico: 'Pedido HC-24766', total: 54000, ultima: 'Guarda-roupa de 3 portas' }, vendedor: 'Dércia Tembe', tags: ['Montagem', 'Cliente insatisfeito'] },
    { id: 'r2', tipo: 'avaliacao', canal: 'facebook', loja: null, nome: 'Edson Langa', recebida: '2026-10-15T21:02', estado: 'pendente', estrelas: 3,
      msgs: [msg('cliente', 'Bons móveis, mas ninguém responde às mensagens à noite.', '2026-10-15T21:02')],
      sugestao: 'Obrigado pelo comentário, Edson. Passámos a ter resposta automática fora de horas e um consultor responde a partir das 8h00.',
      cliente: { tipo: 'Particular', historico: '1 compra', total: 24500, ultima: 'Estante, Agosto' }, vendedor: '', tags: ['Atendimento'] },
    { id: 'r3', tipo: 'avaliacao', canal: 'google', loja: 'baia', nome: 'Patrícia Sitoe', recebida: '2026-10-08T14:20', estado: 'pendente', estrelas: 4,
      msgs: [msg('cliente', 'Loja bonita, mas tive de esperar para ser atendida.', '2026-10-08T14:20')],
      sugestao: 'Obrigado, Patrícia. Reforçámos o acolhimento: cada cliente deve ser recebido em menos de 1 minuto.',
      cliente: { tipo: 'Particular', historico: '1 compra', total: 32900, ultima: 'Cadeirão, Outubro' }, vendedor: 'Lina Bila', tags: ['Atendimento'] },
    { id: 'r4', tipo: 'avaliacao', canal: 'google', loja: 'angola', nome: 'Mariana Novela', recebida: '2026-09-16T11:45', estado: 'pendente', estrelas: 5,
      msgs: [msg('cliente', 'Óptima variedade e o vendedor Hélio ajudou muito a escolher.', '2026-09-16T11:45')],
      sugestao: 'Obrigado, Mariana! Vamos partilhar o seu elogio com o Hélio e com toda a equipa.',
      cliente: { tipo: 'Particular', historico: '2 compras', total: 88400, ultima: 'Sofá de 3 lugares, Setembro' }, vendedor: 'Hélio Sitoe', tags: ['Elogio'] },
    { id: 'r5', tipo: 'avaliacao', canal: 'facebook', loja: 'baia', nome: 'Lurdes Machava', recebida: '2026-10-18T19:40', estado: 'pendente', estrelas: 1,
      msgs: [msg('cliente', 'Paguei por M-Pesa e ninguém me confirmou a data de entrega.', '2026-10-18T19:40')],
      sugestao: 'Lurdes, lamentamos a falta de confirmação. A loja do Baía Mall vai contactá-la hoje por WhatsApp com a data de entrega.',
      cliente: { tipo: 'Particular', historico: '1 compra', total: 46900, ultima: 'Cómoda, Outubro' }, vendedor: 'Neusa Macuácua', tags: ['Entrega', 'Cliente insatisfeito'] },
    { id: 'r6', tipo: 'avaliacao', canal: 'google', loja: 'angola', nome: 'Hélder Mucavele', recebida: '2026-10-24T16:15', estado: 'pendente', estrelas: 4,
      msgs: [msg('cliente', 'Bom atendimento e boa variedade. Ao sábado o parque de estacionamento enche cedo.', '2026-10-24T16:15')],
      sugestao: 'Obrigado, Hélder! Ao sábado recomendamos visitar-nos de manhã. Até breve.',
      cliente: { tipo: 'Particular', historico: '1 compra', total: 27800, ultima: 'Mesa de apoio, Outubro' }, vendedor: '', tags: ['Elogio'] },
    { id: 'r7', tipo: 'avaliacao', canal: 'google', loja: 'baia', nome: 'Abílio Nhaca', recebida: '2026-10-25T10:05', estado: 'respondida', estrelas: 5, respostaMin: 95,
      msgs: [msg('cliente', 'Entrega no dia combinado e montagem rápida. Recomendo.', '2026-10-25T10:05'), msg('equipa', 'Obrigado, Abílio! É esse o nosso compromisso. Boas memórias na casa nova.', '2026-10-25T11:40')],
      sugestao: '', cliente: { tipo: 'Particular', historico: '1 compra', total: 71000, ultima: 'Quarto completo, Outubro' }, vendedor: 'Celso Mabunda', tags: ['Elogio'] }
  ];

  // passo = marcos concluídos: 1 recebido, 2 pago, 3 preparado, 4 entregue, 5 montado.
  const P = (id, cliente, canal, loja, valor, pagamento, passo, entrega, equipa, itens, criado, extra) => Object.assign({ id, cliente, canal, loja, valor, pagamento, passo, entrega, equipa, itens, criado, notas: [] }, extra || {});
  const pedidos = [
    P('HC-24843', 'Vasco Bila', 'loja', 'angola', 52000, 'Cartão', 2, null, '', 'Sapateira e espelho de parede', '2026-10-26T15:40'),
    P('HC-24840', 'Gil Macuácua', 'loja', 'angola', 89000, 'Prestações', 2, '2026-10-30', 'A', 'Sofá de canto e mesa de centro', '2026-10-25T11:05'),
    P('HC-24831', 'Lucas Novela', 'site', 'matola', 72400, 'M-Pesa', 2, '2026-10-29', 'C', 'Sofá-cama e mesa de apoio', '2026-10-24T21:12'),
    P('HC-24828', 'Escritórios Baobá, Lda', 'empresas', 'angola', 840000, 'Fatura a 30 dias', 2, '2026-11-04', 'A', '24 secretárias e 24 cadeiras', '2026-10-23T10:30'),
    P('HC-24822', 'Rosa Chauque', 'whatsapp', 'baia', 46900, 'e-Mola', 3, '2026-10-27', 'B', 'Cómoda de 6 gavetas', '2026-10-22T09:50'),
    P('HC-24815', 'Fernando Massingue', 'loja', 'matola', 118000, 'Cartão', 3, '2026-10-24', 'D', 'Conjunto de sala de jantar, 6 lugares', '2026-10-17T16:20'),
    P('HC-24812', 'Arlindo Tembe', 'loja', 'matola', 64500, 'Numerário', 3, '2026-10-25', 'C', 'Cama de casal e duas mesas de cabeceira', '2026-10-18T10:15'),
    P('HC-24809', 'Inês Manhiça', 'site', 'angola', 31500, 'Por pagar', 1, null, '', 'Cadeira de escritório', '2026-10-26T22:04'),
    P('HC-24806', 'Celeste Nhantumbo', 'whatsapp', 'baia', 57800, 'M-Pesa', 3, '2026-10-26', 'B', 'Estante modular e aparador', '2026-10-19T14:30'),
    P('HC-24802', 'Hotel Costa Azul', 'empresas', 'angola', 1120000, 'Fatura a 30 dias', 5, '2026-10-15', 'A', '40 camas e 40 mesas de cabeceira', '2026-09-28T09:00'),
    P('HC-24797', 'Amélia Cossa', 'loja', 'baia', 38600, 'Transferência', 5, '2026-10-23', 'B', 'Mesa de jantar extensível', '2026-10-16T12:40'),
    P('HC-24790', 'Paulo Cossa', 'whatsapp', 'angola', 63200, 'M-Pesa', 5, '2026-10-22', 'A', 'Cama de casal com colchão', '2026-10-14T17:25'),
    P('HC-24766', 'Carlos Bila', 'loja', 'matola', 54000, 'Cartão', 4, '2026-10-31', 'D', 'Guarda-roupa de 3 portas', '2026-10-09T11:10', { remarcada: true })
  ];
  pedidos.find((p) => p.id === 'HC-24766').notas.push({ em: '2026-10-21T12:00', txt: 'Montagem de 17 Out falhou; remarcada para 31 Out.' });

  const abandonadas = [
    { id: 'a1', cliente: 'Mércia Tembe', produto: 'Sofá de canto em L', valor: 96000, passo: 'Pagamento', quando: '2026-10-27T07:00', contacto: null },
    { id: 'a2', cliente: 'Rui Sitoe', produto: 'Cama de solteiro com gavetas', valor: 28500, passo: 'Dados de entrega', quando: '2026-10-26T13:20', contacto: null },
    { id: 'a3', cliente: 'Graça Mabunda', produto: 'Estante modular', valor: 41800, passo: 'Pagamento', quando: '2026-10-26T19:45', contacto: null },
    { id: 'a4', cliente: 'Nuno Langa', produto: 'Mesa de jantar, 8 lugares', valor: 87200, passo: 'Carrinho', quando: '2026-10-24T10:30', contacto: null }
  ];

  const V = (nome, vendas, n, at, score, nps) => ({ nome, vendas, n, at, score, aval: 2, nps });
  const vendedores = {
    angola: [V('Hélio Sitoe', 1020000, 18, 92, 92, 58), V('Marta Nhantumbo', 960000, 6, 14, 88, 61), V('Albino Cossa', 610000, 14, 88, 81, 47), V('Neide Muianga', 540000, 12, 79, 76, 45), V('Abel Novela', 205000, 5, 71, 54, 22)],
    baia: [V('Neusa Macuácua', 520000, 13, 70, 90, 52), V('Celso Mabunda', 470000, 11, 64, 86, 50), V('Lina Bila', 390000, 9, 61, 73, 37), V('Samuel Chauque', 300000, 7, 55, 68, 30), V('Vânia Massingue', 210000, 5, 52, 58, 25)],
    matola: [V('Dércia Tembe', 480000, 12, 66, 84, 46), V('Osvaldo Manhiça', 400000, 10, 63, 79, 41), V('Rita Zandamela', 330000, 8, 60, 70, 33), V('Ivo Langa', 250000, 6, 57, 61, 28), V('Telma Matsinhe', 190000, 5, 54, 55, 21)]
  };
  vendedores.angola[1].equipa = 'Empresas';

  // Colaboradores avaliados por QR code: histórico de Outubro (n avaliações e somas de estrelas e dos 3 critérios).
  // As notas novas chegam do Supabase e somam-se a estas.
  const K = (codigo, nome, funcao, loja, equipa, n, media, d) => ({
    codigo, nome, funcao, loja, equipa,
    aval: { n, s: [media].concat(d.map((x) => Math.min(5, media + x))).map((m) => Math.round(m * n)) }
  });
  const colaboradores = [
    K('HC-V001', 'Hélio Sitoe', 'vendedor', 'angola', null, 26, 4.8, [0.1, 0, -0.1]),
    K('HC-V002', 'Marta Nhantumbo', 'vendedor', 'angola', null, 9, 4.9, [0, 0.1, -0.1]),
    K('HC-V003', 'Albino Cossa', 'vendedor', 'angola', null, 21, 4.4, [0.2, -0.1, -0.2]),
    K('HC-V004', 'Neide Muianga', 'vendedor', 'angola', null, 18, 4.3, [0.3, -0.3, 0]),
    K('HC-V005', 'Abel Novela', 'vendedor', 'angola', null, 12, 3.6, [-0.1, -0.2, -0.5]),
    K('HC-V006', 'Neusa Macuácua', 'vendedor', 'baia', null, 19, 4.7, [0.2, 0, -0.1]),
    K('HC-V007', 'Celso Mabunda', 'vendedor', 'baia', null, 16, 4.6, [0.1, 0, -0.2]),
    K('HC-V008', 'Lina Bila', 'vendedor', 'baia', null, 13, 4.1, [0.3, -0.2, -0.4]),
    K('HC-V009', 'Samuel Chauque', 'vendedor', 'baia', null, 10, 3.9, [0, -0.3, -0.2]),
    K('HC-V010', 'Vânia Massingue', 'vendedor', 'baia', null, 8, 3.5, [0.1, -0.4, -0.3]),
    K('HC-V011', 'Dércia Tembe', 'vendedor', 'matola', null, 17, 4.5, [0.2, 0, -0.2]),
    K('HC-V012', 'Osvaldo Manhiça', 'vendedor', 'matola', null, 14, 4.2, [0, 0.1, -0.3]),
    K('HC-V013', 'Rita Zandamela', 'vendedor', 'matola', null, 11, 3.9, [0.2, -0.3, -0.2]),
    K('HC-V014', 'Ivo Langa', 'vendedor', 'matola', null, 9, 3.7, [0, -0.2, -0.4]),
    K('HC-V015', 'Telma Matsinhe', 'vendedor', 'matola', null, 8, 3.4, [0.1, -0.4, -0.3]),
    K('HC-M001', 'Joaquim Mabote', 'montagem', 'angola', 'A', 22, 4.7, [0.1, 0.1, -0.1]),
    K('HC-M002', 'Eusébio Cuna', 'montagem', 'angola', 'A', 18, 4.6, [-0.1, 0.2, 0]),
    K('HC-M003', 'Armando Sitoe', 'montagem', 'baia', 'B', 20, 4.5, [-0.2, 0.2, 0.1]),
    K('HC-M004', 'Lucas Chirindza', 'montagem', 'baia', 'B', 15, 4.4, [-0.3, 0.1, 0.1]),
    K('HC-M005', 'Benedito Nhamposse', 'montagem', 'matola', 'C', 17, 3.8, [-0.6, 0.2, -0.1]),
    K('HC-M006', 'Raul Manjate', 'montagem', 'matola', 'C', 12, 3.9, [-0.5, 0.1, 0]),
    K('HC-M007', 'Feliciano Mondlane', 'montagem', 'matola', 'D', 14, 3.5, [-0.7, 0, -0.3]),
    K('HC-M008', 'Zacarias Muchanga', 'montagem', 'matola', 'D', 10, 3.6, [-0.6, 0.1, -0.2])
  ];

  return {
    versao: 2,
    lojas,
    base,
    fechos,
    entregas: { angola: { total: 215, prazo: 189 }, baia: { total: 102, prazo: 83 }, matola: { total: 90, prazo: 68 } },
    meses: [['Mai', 15900000], ['Jun', 16400000], ['Jul', 17100000], ['Ago', 16800000], ['Set', 17300000]],
    margem: 0.34,
    pagamentos: [['Cartão', 34], ['Transferência bancária', 22], ['M-Pesa', 19], ['Numerário', 15], ['e-Mola', 6], ['Prestações', 4]],
    conversas,
    respostasRapidas: [
      { id: 'q1', titulo: 'Catálogo', texto: 'Olá {nome}! Aqui está o nosso catálogo actualizado: [link do catálogo]. Diga-me o espaço e o estilo que procura e eu sugiro o ambiente completo.' },
      { id: 'q2', titulo: 'Formas de pagamento', texto: 'Aceitamos M-Pesa, e-Mola, cartão, transferência e numerário. As condições de prestações explicamos na loja ou aqui no WhatsApp.' },
      { id: 'q3', titulo: 'Entrega e montagem', texto: 'Fazemos a entrega e a montagem com a nossa equipa. Diga-nos o bairro para confirmarmos a data.' },
      { id: 'q4', titulo: 'Pedido de desculpa', texto: '{nome}, pedimos desculpa pelo incómodo. Já estamos a tratar e voltamos a contactar hoje com uma solução.' }
    ],
    pedidos,
    abandonadas,
    vendedores,
    roteiro: {
      passos: ['Receber o cliente em menos de 1 minuto', 'Entender o espaço, o estilo e o orçamento', 'Apresentar o ambiente completo', 'Tratar objecções: prazo, preço e pagamento', 'Fechar e agendar a entrega com data'],
      lojas: { angola: { p: [64, 72, 58, 70, 81], n: 20 }, baia: { p: [78, 76, 66, 72, 80], n: 20 }, matola: { p: [55, 66, 52, 64, 78], n: 20 } }
    },
    avaliacoes: [],
    briefing: { data: '2026-10-27', titulo: 'Apresentar o ambiente completo, não só a peça', texto: 'Quem procura um sofá recebe também a proposta de mesa de centro, tapete e iluminação.', feito: {} },
    coaching: {},
    nps: {
      lojas: { angola: { p: 37, neu: 15, d: 10 }, baia: { p: 17, neu: 9, d: 5 }, matola: { p: 14, neu: 6, d: 5 } },
      equipas: { A: { p: 17, neu: 10, d: 2 }, B: { p: 18, neu: 11, d: 3 }, C: { p: 14, neu: 10, d: 5 }, D: { p: 11, neu: 10, d: 4 } },
      respostas: [],
      motivos: { 'Atraso na entrega': 23, 'Montagem em falta ou mal feita': 13, 'Atendimento na loja': 10, 'Produto danificado': 8, 'Outros': 6 }
    },
    detratores: [
      { id: 'd1', nome: 'Carlos Bila', nota: 2, loja: 'matola', equipa: 'D', motivo: 'Montagem em falta ou mal feita', comentario: 'A montagem marcada não aconteceu.', em: '2026-10-26T15:00', contacto: null },
      { id: 'd2', nome: 'Fernando Massingue', nota: 3, loja: 'matola', equipa: 'D', motivo: 'Atraso na entrega', comentario: 'Entrega atrasada 3 dias.', em: '2026-10-26T23:00', contacto: null },
      { id: 'd3', nome: 'Amélia Cossa', nota: 4, loja: 'baia', equipa: 'B', motivo: 'Produto danificado', comentario: 'Mesa entregue com um risco no tampo.', em: '2026-10-27T05:00', contacto: null }
    ],
    campanhas: [
      { id: 'k1', nome: 'Outdoor Av. Julius Nyerere', tipo: 'out', plataforma: 'Outdoor', medida: 'Código OUT-JN e QR', investimento: 420000, contactos: 96, conversas: 50, visitas: 22, vendas: 9, receita: 468000 },
      { id: 'k2', nome: 'Outdoor EN4, Matola', tipo: 'out', plataforma: 'Outdoor', medida: 'Código OUT-EN4 e QR', investimento: 380000, contactos: 54, conversas: 28, visitas: 11, vendas: 5, receita: 230000 },
      { id: 'k3', nome: 'Parceria [nome do parceiro]', tipo: 'par', plataforma: 'Parceria', medida: 'Código do parceiro', investimento: 150000, contactos: 41, conversas: 30, visitas: 14, vendas: 7, receita: 392000 },
      { id: 'k4', nome: 'Sala completa', tipo: 'dig', plataforma: 'Meta Ads, clique para WhatsApp', medida: 'Número de WhatsApp da campanha', investimento: 210000, contactos: 612, conversas: 340, visitas: 90, vendas: 22, receita: 1012000 },
      { id: 'k5', nome: 'Loja de móveis em Maputo', tipo: 'dig', plataforma: 'Google Ads e perfil do Google', medida: 'Ligação etiquetada para o site', investimento: 160000, contactos: 298, conversas: 170, visitas: 47, vendas: 11, receita: 605000 },
      { id: 'k6', nome: 'Escritório completo', tipo: 'dig', plataforma: 'LinkedIn, clientes empresariais', medida: 'Formulário para empresas', investimento: 100000, contactos: 135, conversas: 84, visitas: 30, vendas: 7, receita: 393000 }
    ],
    resultados: [],
    facturas: [
      { id: 'i1', empresa: 'Hotel Costa Azul', ref: 'Fatura de Setembro', valor: 1120000, emissao: '2026-09-15', vencimento: '2026-10-15', gestor: 'Marta Nhantumbo', paga: null },
      { id: 'i2', empresa: 'Escritórios Baobá, Lda', ref: 'Fatura de Outubro', valor: 840000, emissao: '2026-10-06', vencimento: '2026-11-05', gestor: 'Marta Nhantumbo', paga: null },
      { id: 'i3', empresa: 'Colégio Horizonte', ref: 'Fatura de Outubro', valor: 640000, emissao: '2026-10-21', vencimento: '2026-11-20', gestor: 'Marta Nhantumbo', paga: null }
    ],
    descontos: [],
    verificados: {},
    colaboradores: colaboradores
  };
};
