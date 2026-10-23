// Dados fictícios do protótipo. Nenhum nome, valor ou condomínio é real.

export type Channel = "mpesa" | "emola" | "banco" | "numerario";

export const CHANNELS: Record<Channel, { label: string; short: string; prefix: string }> = {
  mpesa: { label: "M-Pesa", short: "M-PESA", prefix: "84/85" },
  emola: { label: "e-Mola", short: "E-MOLA", prefix: "86/87" },
  banco: { label: "Banco", short: "BANCO", prefix: "" },
  numerario: { label: "Numerário", short: "NUMERÁRIO", prefix: "" },
};

export const TODAY = "Sexta-feira, 23 de Outubro de 2026";
export const TODAY_SHORT = "23/10/2026";
export const CYCLE = "Outubro 2026";

export const USER = { name: "Helena Macuácua", first: "Helena", role: "Gestora de cobranças", initials: "HM" };

export type Condominio = {
  id: string;
  code: string;
  name: string;
  bairro: string;
  fraccoes: number;
  quotaMedia: number;
  facturado: number;
  cobrado: number;
  emAtraso: number;
  devedores: number;
  admin: string;
};

export const CONDOMINIOS: Condominio[] = [
  { id: "polana-mar", code: "PM", name: "Edifício Polana Mar", bairro: "Polana Cimento", fraccoes: 64, quotaMedia: 9500, facturado: 608000, cobrado: 541120, emAtraso: 142500, devedores: 6, admin: "Rui Chilaule" },
  { id: "julius-nyerere", code: "JN", name: "Torres Julius Nyerere", bairro: "Sommerschield", fraccoes: 120, quotaMedia: 7800, facturado: 936000, cobrado: 786240, emAtraso: 351000, devedores: 19, admin: "Anabela Zimba" },
  { id: "costa-do-sol", code: "CS", name: "Residencial Costa do Sol", bairro: "Costa do Sol", fraccoes: 48, quotaMedia: 11000, facturado: 528000, cobrado: 475200, emAtraso: 99000, devedores: 4, admin: "Rui Chilaule" },
  { id: "triunfo-garden", code: "TG", name: "Condomínio Triunfo Garden", bairro: "Triunfo", fraccoes: 86, quotaMedia: 6500, facturado: 559000, cobrado: 452790, emAtraso: 247000, devedores: 13, admin: "Inácio Matsinhe" },
  { id: "24-julho", code: "VJ", name: "Edifício 24 de Julho", bairro: "Central", fraccoes: 72, quotaMedia: 4800, facturado: 345600, cobrado: 238470, emAtraso: 196150, devedores: 12, admin: "Teresa Machava" },
  { id: "malhangalene", code: "MJ", name: "Condomínio Malhangalene Jardim", bairro: "Malhangalene", fraccoes: 40, quotaMedia: 5200, facturado: 208000, cobrado: 148560, emAtraso: 90800, devedores: 4, admin: "Inácio Matsinhe" },
];

export const PORTFOLIO = {
  condominios: CONDOMINIOS.length,
  fraccoes: CONDOMINIOS.reduce((s, c) => s + c.fraccoes, 0), // 430
  facturado: CONDOMINIOS.reduce((s, c) => s + c.facturado, 0), // 3 184 600
  cobrado: 2642380,
  cobradoVar: 3.2, // vs. mesmo dia de Setembro
  facturadoVar: 1.8,
  emAtraso: 1126450,
  emAtrasoVar: -4.6,
  devedores: 58,
  taxaInadimplencia: 13.5,
  reconciliados: 598,
  pagamentosMes: 612,
  automaticos: 566,
  manuais: 32,
  pendentes: 14,
  diasParaFecho: 8,
};

/** Cobrado por mês e canal, em milhares de MT (Nov/2025 – Out/2026; Outubro até hoje). */
export const MONTHLY = [
  { m: "Nov", year: 2025, mpesa: 1180, emola: 420, banco: 690, numerario: 160 },
  { m: "Dez", year: 2025, mpesa: 1210, emola: 455, banco: 640, numerario: 150 },
  { m: "Jan", year: 2026, mpesa: 1095, emola: 430, banco: 610, numerario: 140 },
  { m: "Fev", year: 2026, mpesa: 1240, emola: 480, banco: 620, numerario: 130 },
  { m: "Mar", year: 2026, mpesa: 1290, emola: 510, banco: 590, numerario: 120 },
  { m: "Abr", year: 2026, mpesa: 1310, emola: 540, banco: 560, numerario: 110 },
  { m: "Mai", year: 2026, mpesa: 1335, emola: 575, banco: 540, numerario: 100 },
  { m: "Jun", year: 2026, mpesa: 1290, emola: 590, banco: 530, numerario: 95 },
  { m: "Jul", year: 2026, mpesa: 1360, emola: 610, banco: 510, numerario: 90 },
  { m: "Ago", year: 2026, mpesa: 1385, emola: 640, banco: 495, numerario: 85 },
  { m: "Set", year: 2026, mpesa: 1420, emola: 668, banco: 488, numerario: 80 },
  { m: "Out", year: 2026, mpesa: 1402.9, emola: 688.23, banco: 476.25, numerario: 75 },
];

export const CHANNEL_MONTH: Record<Channel, number> = {
  mpesa: 1402900,
  emola: 688230,
  banco: 476250,
  numerario: 75000,
};

export type Booth = {
  channel: Channel;
  hoje: number;
  count: number;
  open: boolean;
  note: string;
};

export const BOOTHS: Booth[] = [
  { channel: "mpesa", hoje: 96450, count: 18, open: true, note: "Último às 10:42" },
  { channel: "emola", hoje: 41200, count: 9, open: true, note: "Último às 10:31" },
  { channel: "banco", hoje: 52300, count: 4, open: true, note: "Extracto das 08:00" },
  { channel: "numerario", hoje: 6000, count: 1, open: false, note: "Fechado às 09:15" },
];

export type PaymentStatus = "recebido" | "reconciliado" | "a-reconciliar" | "parcial" | "por-identificar";

export type Payment = {
  id: string;
  txId: string;
  channel: Channel;
  payer: string;
  phone?: string;
  fraccao: string;
  condominio: string;
  invoice?: string;
  time: string;
  date: string;
  amount: number;
  status: PaymentStatus;
};

export const PAYMENTS: Payment[] = [
  { id: "p1", txId: "SJN4K7Q2LM", channel: "mpesa", payer: "Armando Sitoe", phone: "+258 84 312 0871", fraccao: "PM-B1-4A", condominio: "Edifício Polana Mar", invoice: "FT 2026/10-0041", time: "10:42", date: "23/10/2026", amount: 9500, status: "reconciliado" },
  { id: "p2", txId: "CI2610.1031.B07415", channel: "emola", payer: "Fátima Cossa", phone: "+258 86 455 2190", fraccao: "TG-C2-1B", condominio: "Condomínio Triunfo Garden", invoice: "FT 2026/10-0287", time: "10:31", date: "23/10/2026", amount: 6500, status: "reconciliado" },
  { id: "p3", txId: "SJN3H1X9PD", channel: "mpesa", payer: "Jorge A. Nhantumbo", phone: "+258 85 020 7744", fraccao: "?", condominio: "Torres Julius Nyerere", time: "10:18", date: "23/10/2026", amount: 7800, status: "por-identificar" },
  { id: "p4", txId: "TRF-BCI-0098214", channel: "banco", payer: "Graça Muianga", fraccao: "CS-T1-7C", condominio: "Residencial Costa do Sol", invoice: "FT 2026/10-0176", time: "08:00", date: "23/10/2026", amount: 22000, status: "reconciliado" },
  { id: "p5", txId: "SJN2W8R4TB", channel: "mpesa", payer: "Paulo Mabunda", phone: "+258 84 778 3301", fraccao: "VJ-A-2D", condominio: "Edifício 24 de Julho", invoice: "FT 2026/10-0352", time: "09:57", date: "23/10/2026", amount: 2400, status: "parcial" },
  { id: "p6", txId: "CI2610.0944.A91822", channel: "emola", payer: "Rosa Tembe", phone: "+258 87 301 6620", fraccao: "JN-T2-11F", condominio: "Torres Julius Nyerere", invoice: "FT 2026/10-0133", time: "09:44", date: "23/10/2026", amount: 7800, status: "reconciliado" },
  { id: "p7", txId: "SJN1D5M7KC", channel: "mpesa", payer: "Ernesto Langa", phone: "+258 84 190 4456", fraccao: "MJ-B-3A", condominio: "Condomínio Malhangalene Jardim", invoice: "FT 2026/10-0401", time: "09:21", date: "23/10/2026", amount: 5200, status: "reconciliado" },
  { id: "p8", txId: "CX-0231", channel: "numerario", payer: "Dinis Bila", fraccao: "VJ-B-5B", condominio: "Edifício 24 de Julho", invoice: "FT 2026/10-0366", time: "09:15", date: "23/10/2026", amount: 6000, status: "reconciliado" },
];

/** Pagamentos que vão "chegar" durante a demonstração ao vivo. */
export const INCOMING: Omit<Payment, "id" | "time" | "date" | "status">[] = [
  { txId: "SJP6B2N8QA", channel: "mpesa", payer: "Lurdes Chilaule", phone: "+258 84 602 1175", fraccao: "JN-T1-6B", condominio: "Torres Julius Nyerere", invoice: "FT 2026/10-0098", amount: 7800 },
  { txId: "CI2610.1049.C33017", channel: "emola", payer: "Samuel Guambe", phone: "+258 86 233 9054", fraccao: "TG-A1-2C", condominio: "Condomínio Triunfo Garden", invoice: "FT 2026/10-0244", amount: 6500 },
  { txId: "SJP7C4T1WZ", channel: "mpesa", payer: "Celeste Manhique", phone: "+258 85 911 3380", fraccao: "?", condominio: "Edifício Polana Mar", amount: 10000 },
  { txId: "SJP8D9F3GH", channel: "mpesa", payer: "Hélder Mucavele", phone: "+258 84 445 0912", fraccao: "CS-T2-3A", condominio: "Residencial Costa do Sol", invoice: "FT 2026/10-0190", amount: 11000 },
  { txId: "CI2610.1107.D58840", channel: "emola", payer: "Olga Novela", phone: "+258 87 120 4467", fraccao: "VJ-A-6C", condominio: "Edifício 24 de Julho", invoice: "FT 2026/10-0347", amount: 4800 },
];

export type ExceptionKind = "referencia" | "parcial" | "a-mais" | "desconhecido" | "duplicado";

export const EXCEPTION_LABEL: Record<ExceptionKind, string> = {
  referencia: "Referência inválida",
  parcial: "Valor parcial",
  "a-mais": "Valor a mais",
  desconhecido: "Pagador desconhecido",
  duplicado: "Possível duplicado",
};

export type Suggestion = {
  invoice: string;
  fraccao: string;
  condomino: string;
  condominio: string;
  due: number;
  confidence: number;
  reasons: string[];
};

export type ReconException = {
  id: string;
  kind: ExceptionKind;
  channel: Channel;
  txId: string;
  payer: string;
  phone?: string;
  referenceUsed?: string;
  amount: number;
  received: string;
  suggestions: Suggestion[];
};

export const EXCEPTIONS: ReconException[] = [
  {
    id: "e1", kind: "desconhecido", channel: "mpesa", txId: "SJN3H1X9PD", payer: "JORGE A NHANTUMBO", phone: "+258 85 020 7744", amount: 7800, received: "Hoje, 10:18",
    suggestions: [
      { invoice: "FT 2026/10-0121", fraccao: "JN-T2-4D", condomino: "Jorge Nhantumbo", condominio: "Torres Julius Nyerere", due: 7800, confidence: 94, reasons: ["Nome do titular coincide", "Valor igual à quota", "Sem pagamento este mês"] },
      { invoice: "FT 2026/10-0122", fraccao: "JN-T2-4E", condomino: "Marta Nhantumbo", condominio: "Torres Julius Nyerere", due: 7800, confidence: 41, reasons: ["Apelido coincide", "Valor igual à quota"] },
    ],
  },
  {
    id: "e2", kind: "parcial", channel: "mpesa", txId: "SJN2W8R4TB", payer: "PAULO MABUNDA", phone: "+258 84 778 3301", referenceUsed: "VJ2D1026", amount: 2400, received: "Hoje, 09:57",
    suggestions: [
      { invoice: "FT 2026/10-0352", fraccao: "VJ-A-2D", condomino: "Paulo Mabunda", condominio: "Edifício 24 de Julho", due: 4800, confidence: 99, reasons: ["Referência certa", "Telefone registado", "Paga 50% da factura"] },
    ],
  },
  {
    id: "e3", kind: "referencia", channel: "emola", txId: "CI2610.0812.F22093", payer: "ANA MUCHANGA", phone: "+258 86 701 2236", referenceUsed: "TG1C1062", amount: 6500, received: "Hoje, 08:12",
    suggestions: [
      { invoice: "FT 2026/10-0261", fraccao: "TG-C1-2B", condomino: "Ana Muchanga", condominio: "Condomínio Triunfo Garden", due: 6500, confidence: 88, reasons: ["Referência com 2 dígitos trocados", "Telefone registado", "Valor igual"] },
    ],
  },
  {
    id: "e4", kind: "a-mais", channel: "banco", txId: "TRF-MBIM-5521087", payer: "CARLOS E. MATE", referenceUsed: "CS3B1026", amount: 33000, received: "Hoje, 08:00",
    suggestions: [
      { invoice: "FT 2026/10-0181", fraccao: "CS-T1-3B", condomino: "Carlos Mate", condominio: "Residencial Costa do Sol", due: 11000, confidence: 97, reasons: ["Referência certa", "Paga 3 meses (Out–Dez)"] },
    ],
  },
  {
    id: "e5", kind: "duplicado", channel: "mpesa", txId: "SJM9Q2L6VE", payer: "BEATRIZ SIMANGO", phone: "+258 84 556 1029", referenceUsed: "PM2C1026", amount: 9500, received: "Ontem, 19:47",
    suggestions: [
      { invoice: "FT 2026/10-0058", fraccao: "PM-B2-2C", condomino: "Beatriz Simango", condominio: "Edifício Polana Mar", due: 0, confidence: 96, reasons: ["Factura já paga ontem às 19:45", "Mesmo valor e referência"] },
    ],
  },
  {
    id: "e6", kind: "desconhecido", channel: "emola", txId: "CI2610.2212.G10454", payer: "NELSON TIVANE", phone: "+258 87 990 3318", amount: 5000, received: "Ontem, 22:12",
    suggestions: [
      { invoice: "FT 2026/09-0398", fraccao: "MJ-A-1C", condomino: "Nelson Tivane", condominio: "Condomínio Malhangalene Jardim", due: 5200, confidence: 72, reasons: ["Nome coincide", "Dívida de Setembro em aberto", "Valor 200 MT abaixo"] },
    ],
  },
];

export const EXCEPTION_TOTALS = { count: 14, amount: 186400 };

export type Ageing = { bucket: string; label: string; fraccoes: number; amount: number };

export const AGEING: Ageing[] = [
  { bucket: "0-30", label: "Até 30 dias", fraccoes: 31, amount: 286500 },
  { bucket: "31-60", label: "31 a 60 dias", fraccoes: 12, amount: 214300 },
  { bucket: "61-90", label: "61 a 90 dias", fraccoes: 6, amount: 212850 },
  { bucket: "90+", label: "Mais de 90 dias", fraccoes: 9, amount: 412800 },
];

export type DebtorState = "sem-contacto" | "lembrete" | "acordo" | "juridico";

export const DEBTOR_STATE: Record<DebtorState, string> = {
  "sem-contacto": "Sem contacto",
  lembrete: "Lembrete enviado",
  acordo: "Acordo activo",
  juridico: "Cobrança jurídica",
};

export type Debtor = {
  id: string;
  fraccao: string;
  condomino: string;
  condominio: string;
  phone: string;
  meses: number;
  divida: number;
  dias: number;
  ultimoPagamento: string;
  state: DebtorState;
  channel: Channel;
};

export const DEBTORS: Debtor[] = [
  { id: "d1", fraccao: "JN-T1-9A", condomino: "Alberto Macamo", condominio: "Torres Julius Nyerere", phone: "+258 84 301 2287", meses: 7, divida: 54600, dias: 205, ultimoPagamento: "02/03/2026", state: "juridico", channel: "mpesa" },
  { id: "d2", fraccao: "VJ-B-1A", condomino: "Esperança Nhaca", condominio: "Edifício 24 de Julho", phone: "+258 86 118 9043", meses: 6, divida: 28800, dias: 176, ultimoPagamento: "30/04/2026", state: "acordo", channel: "emola" },
  { id: "d3", fraccao: "PM-B3-8B", condomino: "Vasco Ubisse", condominio: "Edifício Polana Mar", phone: "+258 84 912 6670", meses: 5, divida: 47500, dias: 147, ultimoPagamento: "28/05/2026", state: "lembrete", channel: "mpesa" },
  { id: "d4", fraccao: "TG-B2-4A", condomino: "Glória Mussa", condominio: "Condomínio Triunfo Garden", phone: "+258 87 240 5518", meses: 5, divida: 32500, dias: 141, ultimoPagamento: "03/06/2026", state: "sem-contacto", channel: "emola" },
  { id: "d5", fraccao: "JN-T3-2C", condomino: "Fernando Cumbe", condominio: "Torres Julius Nyerere", phone: "+258 85 667 0034", meses: 4, divida: 31200, dias: 115, ultimoPagamento: "30/06/2026", state: "lembrete", channel: "mpesa" },
  { id: "d6", fraccao: "VJ-A-4B", condomino: "Isabel Chongo", condominio: "Edifício 24 de Julho", phone: "+258 84 033 7781", meses: 4, divida: 19200, dias: 108, ultimoPagamento: "06/07/2026", state: "acordo", channel: "mpesa" },
  { id: "d7", fraccao: "CS-T2-5D", condomino: "Ricardo Bata", condominio: "Residencial Costa do Sol", phone: "+258 86 590 1126", meses: 3, divida: 33000, dias: 84, ultimoPagamento: "31/07/2026", state: "lembrete", channel: "emola" },
  { id: "d8", fraccao: "MJ-B-2B", condomino: "Celina Mavie", condominio: "Condomínio Malhangalene Jardim", phone: "+258 84 728 3309", meses: 3, divida: 15600, dias: 79, ultimoPagamento: "05/08/2026", state: "sem-contacto", channel: "mpesa" },
  { id: "d9", fraccao: "TG-A2-6D", condomino: "Domingos Sambo", condominio: "Condomínio Triunfo Garden", phone: "+258 87 455 0920", meses: 2, divida: 13000, dias: 53, ultimoPagamento: "31/08/2026", state: "lembrete", channel: "emola" },
  { id: "d10", fraccao: "JN-T2-7A", condomino: "Luísa Maposse", condominio: "Torres Julius Nyerere", phone: "+258 84 880 1452", meses: 2, divida: 15600, dias: 48, ultimoPagamento: "04/09/2026", state: "sem-contacto", channel: "mpesa" },
  { id: "d11", fraccao: "PM-B1-6C", condomino: "Óscar Massinga", condominio: "Edifício Polana Mar", phone: "+258 85 302 7718", meses: 1, divida: 9500, dias: 22, ultimoPagamento: "30/09/2026", state: "sem-contacto", channel: "mpesa" },
  { id: "d12", fraccao: "VJ-B-3C", condomino: "Amélia Cuna", condominio: "Edifício 24 de Julho", phone: "+258 86 207 6631", meses: 1, divida: 4800, dias: 22, ultimoPagamento: "30/09/2026", state: "lembrete", channel: "emola" },
];

export type InvoiceStatus = "paga" | "parcial" | "em-aberto" | "vencida";

export const INVOICE_STATUS: Record<InvoiceStatus, string> = {
  paga: "Paga",
  parcial: "Parcial",
  "em-aberto": "Em aberto",
  vencida: "Vencida",
};

export type Invoice = {
  number: string;
  fraccao: string;
  condomino: string;
  condominio: string;
  reference: string;
  issued: string;
  due: string;
  amount: number;
  paid: number;
  status: InvoiceStatus;
};

export const INVOICES: Invoice[] = [
  { number: "FT 2026/10-0041", fraccao: "PM-B1-4A", condomino: "Armando Sitoe", condominio: "Edifício Polana Mar", reference: "PM4A1026", issued: "01/10/2026", due: "10/10/2026", amount: 9500, paid: 9500, status: "paga" },
  { number: "FT 2026/10-0098", fraccao: "JN-T1-6B", condomino: "Lurdes Chilaule", condominio: "Torres Julius Nyerere", reference: "JN6B1026", issued: "01/10/2026", due: "10/10/2026", amount: 7800, paid: 0, status: "vencida" },
  { number: "FT 2026/10-0121", fraccao: "JN-T2-4D", condomino: "Jorge Nhantumbo", condominio: "Torres Julius Nyerere", reference: "JN4D1026", issued: "01/10/2026", due: "10/10/2026", amount: 7800, paid: 0, status: "vencida" },
  { number: "FT 2026/10-0176", fraccao: "CS-T1-7C", condomino: "Graça Muianga", condominio: "Residencial Costa do Sol", reference: "CS7C1026", issued: "01/10/2026", due: "10/10/2026", amount: 22000, paid: 22000, status: "paga" },
  { number: "FT 2026/10-0244", fraccao: "TG-A1-2C", condomino: "Samuel Guambe", condominio: "Condomínio Triunfo Garden", reference: "TG2C1026", issued: "01/10/2026", due: "10/10/2026", amount: 6500, paid: 0, status: "vencida" },
  { number: "FT 2026/10-0287", fraccao: "TG-C2-1B", condomino: "Fátima Cossa", condominio: "Condomínio Triunfo Garden", reference: "TG1B1026", issued: "01/10/2026", due: "10/10/2026", amount: 6500, paid: 6500, status: "paga" },
  { number: "FT 2026/10-0352", fraccao: "VJ-A-2D", condomino: "Paulo Mabunda", condominio: "Edifício 24 de Julho", reference: "VJ2D1026", issued: "01/10/2026", due: "10/10/2026", amount: 4800, paid: 2400, status: "parcial" },
  { number: "FT 2026/10-0366", fraccao: "VJ-B-5B", condomino: "Dinis Bila", condominio: "Edifício 24 de Julho", reference: "VJ5B1026", issued: "01/10/2026", due: "10/10/2026", amount: 6000, paid: 6000, status: "paga" },
  { number: "FT 2026/10-0401", fraccao: "MJ-B-3A", condomino: "Ernesto Langa", condominio: "Condomínio Malhangalene Jardim", reference: "MJ3A1026", issued: "01/10/2026", due: "10/10/2026", amount: 5200, paid: 5200, status: "paga" },
  { number: "FT 2026/10-0415", fraccao: "MJ-A-4D", condomino: "Rita Mabjaia", condominio: "Condomínio Malhangalene Jardim", reference: "MJ4D1026", issued: "15/10/2026", due: "31/10/2026", amount: 18500, paid: 0, status: "em-aberto" },
];

export type Agreement = {
  id: string;
  fraccao: string;
  condomino: string;
  condominio: string;
  total: number;
  prestacao: number;
  pagas: number;
  numPrestacoes: number;
  proxima: string;
  channel: Channel;
  estado: "em-dia" | "vence-hoje" | "atrasado";
};

export const AGREEMENTS: Agreement[] = [
  { id: "a1", fraccao: "VJ-B-1A", condomino: "Esperança Nhaca", condominio: "Edifício 24 de Julho", total: 28800, prestacao: 4800, pagas: 2, numPrestacoes: 6, proxima: "23/10/2026", channel: "emola", estado: "vence-hoje" },
  { id: "a2", fraccao: "VJ-A-4B", condomino: "Isabel Chongo", condominio: "Edifício 24 de Julho", total: 19200, prestacao: 4800, pagas: 1, numPrestacoes: 4, proxima: "23/10/2026", channel: "mpesa", estado: "vence-hoje" },
  { id: "a3", fraccao: "TG-B1-3C", condomino: "Mário Chirindza", condominio: "Condomínio Triunfo Garden", total: 39000, prestacao: 18000, pagas: 0, numPrestacoes: 2, proxima: "23/10/2026", channel: "mpesa", estado: "vence-hoje" },
  { id: "a4", fraccao: "JN-T3-8D", condomino: "Sónia Uamusse", condominio: "Torres Julius Nyerere", total: 46800, prestacao: 7800, pagas: 4, numPrestacoes: 6, proxima: "05/11/2026", channel: "mpesa", estado: "em-dia" },
  { id: "a5", fraccao: "PM-B2-5A", condomino: "Abel Nhamuave", condominio: "Edifício Polana Mar", total: 57000, prestacao: 9500, pagas: 3, numPrestacoes: 6, proxima: "15/10/2026", channel: "emola", estado: "atrasado" },
];

export const AGREEMENTS_TODAY = { count: 3, amount: 27600 };
