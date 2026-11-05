export type Lang = "pt" | "en";

export interface Service {
  num: string;
  title: string;
  pain: string;
  deliverables: string[];
  retainer?: string;
  model?: string;
  boundary?: string;
}

export interface Pillar {
  num: string;
  slug: string;
  name: string;
  promise: string;
  note?: string;
  boundary?: string;
  services: Service[];
}

export interface Dict {
  langName: string;
  htmlLang: string;
  meta: { title: string; description: string };
  nav: {
    pillars: string;
    approach: string;
    contact: string;
    cta: string;
    menuLabel: string;
  };
  hero: {
    h1: string;
    sub: string;
    ctaPrimary: string;
    ctaSecondary: string;
    facts: { value: string; label: string }[];
    dossier: {
      heading: string;
      note: string;
      rows: { item: string; status: string; state: "done" | "active" | "scheduled" }[];
    };
  };
  pillarsSection: {
    heading: string;
    intro: string;
    viewPillar: string;
    servicesLabel: string;
  };
  approach: {
    heading: string;
    intro: string;
    steps: { title: string; body: string }[];
  };
  boundaries: {
    heading: string;
    intro: string;
    partners: { role: string; scope: string }[];
  };
  cta: {
    heading: string;
    body: string;
    button: string;
    note: string;
  };
  footer: {
    tagline: string;
    pillarsHeading: string;
    companyHeading: string;
    approach: string;
    contact: string;
    languageHeading: string;
    legal: string;
    provisional: string;
  };
  pillarPage: {
    pillarLabel: string;
    painLabel: string;
    deliverablesLabel: string;
    retainerLabel: string;
    modelLabel: string;
    boundaryLabel: string;
    noteLabel: string;
    prev: string;
    next: string;
    allPillars: string;
  };
  pillars: Pillar[];
}

const pt: Dict = {
  langName: "Português",
  htmlLang: "pt",
  meta: {
    title: "DT Company — Business Advisory & Development",
    description:
      "DT Company — Business Advisory & Development: consultoria em compliance e governança, fiscalidade, incorporação e ESG em Moçambique, com entregáveis verificáveis e uma rede de parceiros certificados.",
  },
  nav: {
    pillars: "Pilares",
    approach: "Abordagem",
    contact: "Contactos",
    cta: "Contacte-nos",
    menuLabel: "Abrir menu",
  },
  hero: {
    h1: "Confiança para investir, operar e crescer em Moçambique.",
    sub: "A DT Company — Business Advisory & Development apoia empresas e investidores em compliance e governança, fiscalidade, incorporação e ESG, com entregáveis verificáveis e uma rede de parceiros certificados.",
    ctaPrimary: "Agendar uma reunião",
    ctaSecondary: "Conhecer os quatro pilares",
    facts: [
      { value: "4", label: "pilares de actuação" },
      { value: "12", label: "serviços com entregáveis definidos" },
      { value: "3", label: "parcerias certificadas: jurídica, contabilística e ambiental" },
    ],
    dossier: {
      heading: "Dossier do cliente",
      note: "Exemplo ilustrativo de acompanhamento",
      rows: [
        { item: "Certidão de quitação", status: "Emitida", state: "done" },
        { item: "Registo de investimento — Banco de Moçambique", status: "Em curso", state: "active" },
        { item: "DIRE e autorizações de trabalho", status: "3 activos", state: "done" },
        { item: "Relatório E&S ao financiador", status: "Trimestral", state: "scheduled" },
        { item: "Calendário fiscal com alertas", status: "Em dia", state: "done" },
      ],
    },
  },
  pillarsSection: {
    heading: "Serviços estruturados em quatro pilares.",
    intro:
      "Cada mandato parte de um desafio concreto do cliente e conclui com instrumentos que permanecem na organização — políticas, dossiers, registos, certidões e calendários de obrigações.",
    viewPillar: "Explorar o pilar",
    servicesLabel: "serviços",
  },
  approach: {
    heading: "A nossa abordagem",
    intro:
      "Um método único, aplicado com o mesmo rigor em todos os pilares — do diagnóstico ao acompanhamento contínuo.",
    steps: [
      {
        title: "Diagnóstico orientado ao desafio",
        body: "Partimos da questão concreta que condiciona o negócio — uma inspecção agendada, um financiamento condicionado, um concurso iminente — e não de diagnósticos genéricos.",
      },
      {
        title: "Entregáveis verificáveis",
        body: "Cada mandato conclui com instrumentos concretos: políticas, dossiers, registos, certidões e calendários de obrigações. O cliente dispõe de evidência objectiva do trabalho realizado.",
      },
      {
        title: "Acompanhamento contínuo",
        body: "Quando adequado, propomos regimes de avença — compliance officer externo, secretariado societário, monitorização de fornecedores e calendário fiscal com alertas — para manter a organização permanentemente em conformidade.",
      },
    ],
  },
  boundaries: {
    heading: "Âmbito de actuação e parcerias certificadas",
    intro:
      "A delimitação rigorosa do âmbito é parte integrante do serviço. A DT Company gere, organiza e acompanha; os actos legalmente reservados são executados por parceiros certificados, sob a nossa coordenação.",
    partners: [
      {
        role: "Advogado parceiro",
        scope:
          "Estatutos à medida, acordos parassociais, documentos sucessórios e contencioso fiscal em tribunal.",
      },
      {
        role: "Contabilista certificado parceiro",
        scope:
          "Em Moçambique, as declarações fiscais e as demonstrações financeiras são obrigatoriamente assinadas por contabilistas certificados.",
      },
      {
        role: "Consultores ambientais registados",
        scope:
          "Os estudos de impacto ambiental são elaborados por consultores registados, coordenados pela DT Company.",
      },
    ],
  },
  cta: {
    heading: "Uma inspecção agendada, um financiamento condicionado ou uma operação por instalar?",
    body: "Apresente-nos o desafio. Respondemos com os entregáveis, os prazos e o âmbito — por escrito.",
    button: "Contactar a equipa",
    note: "Canais de contacto definitivos em breve — esta via é provisória.",
  },
  footer: {
    tagline: "Business Advisory & Development — Moçambique",
    pillarsHeading: "Pilares",
    companyHeading: "Empresa",
    approach: "Abordagem",
    contact: "Contactos",
    languageHeading: "Idioma",
    legal: "DT Company — Business Advisory & Development. Todos os direitos reservados.",
    provisional: "Canais de contacto e morada em actualização.",
  },
  pillarPage: {
    pillarLabel: "Pilar",
    painLabel: "O desafio",
    deliverablesLabel: "Entregáveis",
    retainerLabel: "Regime de avença",
    modelLabel: "Modelo de honorários",
    boundaryLabel: "Âmbito e parceiros",
    noteLabel: "Nota importante",
    prev: "Pilar anterior",
    next: "Pilar seguinte",
    allPillars: "Todos os pilares",
  },
  pillars: [
    {
      num: "1",
      slug: "compliance-e-governanca",
      name: "Compliance e Governança",
      promise:
        "Estruturas de integridade, verificação de terceiros e governança que sustentam o acesso a contratos, crédito e investimento.",
      boundary:
        "Acordos parassociais, estatutos e documentos sucessórios são redigidos pelo advogado parceiro.",
      services: [
        {
          num: "1.1",
          title: "Programa de Compliance e Integridade",
          pain:
            "A ausência de regras internas e de controlos adequados expõe a organização a fraude e compromete o acesso a contratos e financiamento.",
          deliverables: [
            "Mapa de riscos de compliance e fraude",
            "Código de conduta",
            "Políticas: anticorrupção, conflitos de interesse, ofertas e hospitalidade, pagamentos e alteração de NIB",
            "Canal de denúncia, implementado pela nossa equipa tecnológica",
            "Formação da equipa e da direcção, com registo de presenças",
          ],
          retainer: "Compliance officer externo, com reporte mensal à administração.",
        },
        {
          num: "1.2",
          title: "Due Diligence de Terceiros",
          pain:
            "Perdas relevantes têm origem em fornecedores, parceiros, sócios ou vendedores cuja identidade, idoneidade e situação real não foram verificadas.",
          deliverables: [
            "Relatório de verificação: existência, beneficiários efectivos, exposição política, sanções, reputação e documentação",
            "Classificação de risco: baixo, médio ou alto",
            "Sinais de alerta e pontos a confirmar antes da assinatura",
            "Para terrenos e imóveis: verificação do DUAT, registos, titulares e ocupantes",
          ],
          retainer: "Monitorização periódica da base de fornecedores.",
        },
        {
          num: "1.3",
          title: "Governança Corporativa e Familiar",
          pain:
            "A dependência de uma única pessoa, conflitos entre sócios ou familiares e documentação societária desorganizada comprometem o acesso a crédito e investimento.",
          deliverables: [
            "Diagnóstico de governança",
            "Matriz de delegação de competências: quem aprova o quê, e até que valor",
            "Regimentos da administração, dos comités e do conselho consultivo",
            "Regras de governança familiar e plano de sucessão na gestão",
          ],
          retainer:
            "Secretariado societário: calendário de obrigações, convocatórias, actas e livros sociais.",
        },
      ],
    },
    {
      num: "2",
      slug: "tax",
      name: "Tax",
      promise:
        "Optimização de benefícios fiscais, regularização e preparação de inspecções — em articulação com contabilistas certificados.",
      note:
        "Em Moçambique, as declarações fiscais e as demonstrações financeiras são obrigatoriamente assinadas por contabilistas certificados, e o contencioso fiscal em tribunal é conduzido por advogados. Neste pilar, a DT Company assume a gestão, a organização e o acompanhamento dos processos, em articulação com um contabilista certificado parceiro — tal como sucede com o advogado parceiro.",
      services: [
        {
          num: "2.1",
          title: "Benefícios Fiscais e Aduaneiros do Investimento",
          pain:
            "Investidores suportam direitos e impostos por inteiro sobre equipamento e investimento por não terem requerido os benefícios a que tinham direito — ou perdem-nos por incumprimento das obrigações subsequentes.",
          deliverables: [
            "Estudo dos benefícios aplicáveis ao projecto",
            "Dossier de candidatura e submissão do projecto de investimento",
            "Lista de bens com isenção aduaneira aprovada",
            "Calendário das obrigações associadas à manutenção dos benefícios",
            "Relatório da poupança obtida",
          ],
          model: "Honorário fixo, acrescido de percentagem da poupança obtida.",
        },
        {
          num: "2.2",
          title: "Regularização Fiscal e Certidão de Quitação",
          pain:
            "Sem certidão de quitação, a empresa fica excluída de concursos públicos, não recebe pagamentos do Estado e enfrenta restrições junto da banca — frequentemente sem visibilidade sobre a sua própria posição fiscal.",
          deliverables: [
            "Levantamento da situação fiscal: dívidas, declarações em falta e coimas",
            "Plano de regularização, incluindo pedidos de pagamento em prestações",
            "Obtenção da certidão de quitação",
            "Calendário fiscal anual com alertas de prazos",
          ],
          retainer: "Acompanhamento mensal para manutenção da conformidade fiscal.",
        },
        {
          num: "2.3",
          title: "Preparação e Acompanhamento de Inspecções Fiscais",
          pain:
            "Inspecções fiscais enfrentadas sem documentação organizada nem preparação adequada resultam em liquidações adicionais e multas significativas.",
          deliverables: [
            "Revisão fiscal preventiva, com identificação de riscos e contingências",
            "Dossier de documentação organizado para a inspecção",
            "Acompanhamento durante a inspecção e resposta aos pedidos da Autoridade Tributária",
            "Relatório final com as correcções a implementar",
            "Encaminhamento para o advogado parceiro em caso de contestação judicial",
          ],
        },
      ],
    },
    {
      num: "3",
      slug: "incorporacao",
      name: "Incorporação",
      promise:
        "Entrada no mercado, licenciamento e mobilidade internacional de quadros — geridos de ponta a ponta.",
      services: [
        {
          num: "3.1",
          title: "Constituição e Licenciamento de Empresas",
          pain:
            "A constituição de uma empresa consome meses entre registos, licenças e entidades distintas — com custos fixos a decorrer antes de a operação poder iniciar.",
          deliverables: [
            "Mapa de requisitos legais e custos para o negócio específico",
            "Acompanhamento do registo da empresa, com modelos de estatutos padrão",
            "NUIT, inscrição no INSS e licença de actividade",
            "Dossier digital com toda a documentação da empresa",
            "Calendário das primeiras obrigações: renovações e declarações",
          ],
          boundary:
            "Estatutos à medida e acordos parassociais são remetidos ao advogado parceiro.",
        },
        {
          num: "3.2",
          title: "Instalação de Empresas Estrangeiras",
          pain:
            "Empresas estrangeiras que seleccionam inadequadamente a forma de entrada, ou que não registam o investimento, enfrentam posteriormente dificuldades na repatriação de lucros e de capital.",
          deliverables: [
            "Análise comparativa das formas de entrada — filial, sucursal ou escritório de representação — na perspectiva prática e operacional",
            "Registo do projecto de investimento",
            "Acompanhamento do registo do investimento estrangeiro junto do Banco de Moçambique",
            "Abertura de conta bancária e instalação operacional",
            "Articulação com o serviço 2.1 — Benefícios Fiscais e Aduaneiros",
          ],
        },
        {
          num: "3.3",
          title: "Gestão de Quadros Estrangeiros",
          pain:
            "Quotas, autorizações de trabalho, vistos e DIRE atrasam a entrada em funções de técnicos estrangeiros e expõem a empresa a sanções.",
          deliverables: [
            "Cálculo da quota disponível de trabalhadores estrangeiros",
            "Pedidos de autorização de trabalho e de visto",
            "Condução do processo de DIRE",
            "Registo integral dos expatriados, com alertas de renovação",
          ],
          retainer: "Regime de avença indexado ao número de expatriados geridos.",
        },
      ],
    },
    {
      num: "4",
      slug: "consultoria-esg",
      name: "Consultoria ESG",
      promise:
        "Sistemas de gestão ambiental e social e evidências que respondem às exigências de financiadores e clientes internacionais.",
      boundary:
        "Os estudos de impacto ambiental são elaborados por consultores ambientais registados, coordenados pela DT Company.",
      services: [
        {
          num: "4.1",
          title: "Sistema de Gestão Ambiental e Social para Financiamento",
          pain:
            "O financiamento é aprovado, mas o desembolso fica condicionado à existência de um sistema de gestão ambiental e social conforme os requisitos do financiador.",
          deliverables: [
            "Diagnóstico face aos requisitos do financiador",
            "Políticas ambientais, sociais e de saúde e segurança",
            "Procedimentos, responsáveis e registos",
            "Plano de acção ambiental e social",
            "Reporte periódico ao financiador",
          ],
        },
        {
          num: "4.2",
          title: "Preparação para Clientes Internacionais",
          pain:
            "Fornecedores e exportadores perdem clientes multinacionais e europeus por não conseguirem evidenciar boas práticas laborais, ambientais e de direitos humanos.",
          deliverables: [
            "Resposta aos questionários ESG dos clientes",
            "Políticas de direitos humanos, condições de trabalho e combate ao trabalho infantil",
            "Dossier de evidências organizado: registos, fotografias e certificados",
            "Avaliação dos fornecedores do próprio cliente",
            "Plano de melhoria para as avaliações subsequentes",
          ],
        },
        {
          num: "4.3",
          title: "Relação com Comunidades e Mecanismo de Queixas",
          pain:
            "Projectos em zonas rurais ou costeiras são suspensos por conflitos com comunidades que não foram envolvidas nem dispõem de um canal formal para apresentar queixas.",
          deliverables: [
            "Mapeamento das comunidades e partes interessadas",
            "Plano de envolvimento e comunicação com as comunidades",
            "Mecanismo de queixas: procedimento, canal e registo",
            "Reporte periódico das queixas e das respostas",
            "Acompanhamento de reuniões e consultas públicas",
          ],
        },
      ],
    },
  ],
};

const en: Dict = {
  langName: "English",
  htmlLang: "en",
  meta: {
    title: "DT Company — Business Advisory & Development",
    description:
      "DT Company — Business Advisory & Development: advisory in compliance and governance, tax, incorporation and ESG in Mozambique, delivered through verifiable deliverables and a network of certified partners.",
  },
  nav: {
    pillars: "Pillars",
    approach: "Approach",
    contact: "Contact",
    cta: "Contact us",
    menuLabel: "Open menu",
  },
  hero: {
    h1: "Confidence to invest, operate and grow in Mozambique.",
    sub: "DT Company — Business Advisory & Development advises companies and investors on compliance and governance, tax, incorporation and ESG, through verifiable deliverables and a network of certified partners.",
    ctaPrimary: "Schedule a meeting",
    ctaSecondary: "Explore the four pillars",
    facts: [
      { value: "4", label: "pillars of practice" },
      { value: "12", label: "services with defined deliverables" },
      { value: "3", label: "certified partnerships: legal, accounting and environmental" },
    ],
    dossier: {
      heading: "Client dossier",
      note: "Illustrative engagement overview",
      rows: [
        { item: "Tax clearance certificate", status: "Issued", state: "done" },
        { item: "Investment registration — Bank of Mozambique", status: "In progress", state: "active" },
        { item: "DIRE and work permits", status: "3 active", state: "done" },
        { item: "E&S report to the lender", status: "Quarterly", state: "scheduled" },
        { item: "Tax calendar with alerts", status: "Current", state: "done" },
      ],
    },
  },
  pillarsSection: {
    heading: "Services structured across four pillars.",
    intro:
      "Every engagement begins with a specific client challenge and concludes with instruments that remain within the organisation — policies, dossiers, registers, certificates and obligation calendars.",
    viewPillar: "Explore the pillar",
    servicesLabel: "services",
  },
  approach: {
    heading: "Our approach",
    intro:
      "One method, applied with the same rigour across every pillar — from diagnosis to ongoing counsel.",
    steps: [
      {
        title: "Challenge-led diagnosis",
        body: "We begin with the specific matter conditioning the business — a scheduled inspection, conditioned financing, an imminent tender — rather than generic diagnostics.",
      },
      {
        title: "Verifiable deliverables",
        body: "Every engagement concludes with concrete instruments: policies, dossiers, registers, certificates and obligation calendars. Clients hold objective evidence of the work performed.",
      },
      {
        title: "Ongoing counsel",
        body: "Where appropriate, we propose retainer arrangements — external compliance officer, corporate secretariat, supplier monitoring and a tax calendar with alerts — to keep the organisation permanently in good standing.",
      },
    ],
  },
  boundaries: {
    heading: "Scope of practice and certified partnerships",
    intro:
      "Rigorous delimitation of scope is an integral part of the service. DT Company manages, organises and follows through; legally reserved acts are performed by certified partners under our coordination.",
    partners: [
      {
        role: "Partner lawyer",
        scope:
          "Tailor-made articles of association, shareholder agreements, succession documents and tax litigation before the courts.",
      },
      {
        role: "Partner certified accountant",
        scope:
          "In Mozambique, tax returns and financial statements must by law be signed by certified accountants.",
      },
      {
        role: "Registered environmental consultants",
        scope:
          "Environmental impact studies are prepared by registered consultants, coordinated by DT Company.",
      },
    ],
  },
  cta: {
    heading: "An inspection scheduled, financing conditioned, or an operation to establish?",
    body: "Present us with the challenge. We respond with deliverables, timelines and scope — in writing.",
    button: "Contact the team",
    note: "Definitive contact channels coming soon — this route is provisional.",
  },
  footer: {
    tagline: "Business Advisory & Development — Mozambique",
    pillarsHeading: "Pillars",
    companyHeading: "Company",
    approach: "Approach",
    contact: "Contact",
    languageHeading: "Language",
    legal: "DT Company — Business Advisory & Development. All rights reserved.",
    provisional: "Contact details and address being finalised.",
  },
  pillarPage: {
    pillarLabel: "Pillar",
    painLabel: "The challenge",
    deliverablesLabel: "Deliverables",
    retainerLabel: "Retainer arrangement",
    modelLabel: "Fee model",
    boundaryLabel: "Scope and partners",
    noteLabel: "Important note",
    prev: "Previous pillar",
    next: "Next pillar",
    allPillars: "All pillars",
  },
  pillars: [
    {
      num: "1",
      slug: "compliance-governance",
      name: "Compliance & Governance",
      promise:
        "Integrity frameworks, third-party verification and governance that underpin access to contracts, credit and investment.",
      boundary:
        "Shareholder agreements, articles of association and succession documents are drafted by the partner lawyer.",
      services: [
        {
          num: "1.1",
          title: "Compliance and Integrity Programme",
          pain:
            "The absence of internal rules and adequate controls exposes the organisation to fraud and compromises access to contracts and financing.",
          deliverables: [
            "Compliance and fraud risk map",
            "Code of conduct",
            "Policies: anti-corruption, conflicts of interest, gifts and hospitality, payments and bank-account changes",
            "Whistleblowing channel, implemented by our technology team",
            "Training for staff and management, with attendance records",
          ],
          retainer: "External compliance officer, reporting monthly to the board.",
        },
        {
          num: "1.2",
          title: "Third-Party Due Diligence",
          pain:
            "Material losses originate with suppliers, partners, shareholders or sellers whose identity, standing and actual circumstances were never verified.",
          deliverables: [
            "Verification report: existence, beneficial owners, political exposure, sanctions, reputation and documentation",
            "Risk rating: low, medium or high",
            "Red flags and points to confirm prior to signature",
            "For land and property: DUAT verification, registries, title holders and occupants",
          ],
          retainer: "Periodic monitoring of the supplier base.",
        },
        {
          num: "1.3",
          title: "Corporate and Family Governance",
          pain:
            "Dependence on a single individual, disputes among shareholders or family members, and disorganised corporate records compromise access to credit and investment.",
          deliverables: [
            "Governance diagnostic",
            "Delegation-of-authority matrix: who approves what, and up to what amount",
            "Charters for the board, committees and advisory council",
            "Family governance rules and a management succession plan",
          ],
          retainer:
            "Corporate secretariat: obligations calendar, meeting notices, minutes and statutory books.",
        },
      ],
    },
    {
      num: "2",
      slug: "tax",
      name: "Tax",
      promise:
        "Tax benefit optimisation, regularisation and inspection readiness — in coordination with certified accountants.",
      note:
        "In Mozambique, tax returns and financial statements must by law be signed by certified accountants, and tax litigation before the courts is conducted by lawyers. Within this pillar, DT Company manages, organises and follows through on proceedings, in coordination with a partner certified accountant — as it does with the partner lawyer.",
      services: [
        {
          num: "2.1",
          title: "Investment Tax and Customs Benefits",
          pain:
            "Investors bear full duties and taxes on equipment and investment because the benefits to which they were entitled were never applied for — or are forfeited through non-compliance with subsequent obligations.",
          deliverables: [
            "Study of the benefits applicable to the project",
            "Application dossier and submission of the investment project",
            "Schedule of goods with approved customs exemption",
            "Calendar of obligations attached to maintaining the benefits",
            "Report on the savings achieved",
          ],
          model: "Fixed fee, plus a percentage of the savings achieved.",
        },
        {
          num: "2.2",
          title: "Tax Regularisation and Clearance Certificate",
          pain:
            "Without a tax clearance certificate, a company is excluded from public tenders, receives no payments from the State and faces restrictions with banks — frequently without visibility of its own tax position.",
          deliverables: [
            "Assessment of the tax position: debts, outstanding returns and penalties",
            "Regularisation plan, including applications for payment in instalments",
            "Securing of the tax clearance certificate",
            "Annual tax calendar with deadline alerts",
          ],
          retainer: "Monthly counsel to maintain tax compliance.",
        },
        {
          num: "2.3",
          title: "Tax Inspection Preparation and Support",
          pain:
            "Tax inspections faced without organised documentation or adequate preparation result in additional assessments and significant penalties.",
          deliverables: [
            "Preventive tax review, identifying risks and contingencies",
            "Organised documentation dossier for the inspection",
            "Support throughout the inspection and responses to the Tax Authority's requests",
            "Final report setting out the corrections to implement",
            "Referral to the partner lawyer in the event of judicial challenge",
          ],
        },
      ],
    },
    {
      num: "3",
      slug: "incorporation",
      name: "Incorporation",
      promise:
        "Market entry, licensing and international staff mobility — managed end to end.",
      services: [
        {
          num: "3.1",
          title: "Company Formation and Licensing",
          pain:
            "Incorporating a company consumes months across registrations, licences and separate authorities — with fixed costs accruing before operations can commence.",
          deliverables: [
            "Map of legal requirements and costs for the specific business",
            "Support through company registration, with standard articles templates",
            "NUIT, INSS registration and operating licence",
            "Digital dossier containing the company's full documentation",
            "Calendar of initial obligations: renewals and filings",
          ],
          boundary:
            "Tailor-made articles and shareholder agreements are referred to the partner lawyer.",
        },
        {
          num: "3.2",
          title: "Establishment of Foreign Companies",
          pain:
            "Foreign companies that select an unsuitable entry structure, or fail to register their investment, subsequently face difficulties repatriating profits and capital.",
          deliverables: [
            "Comparative analysis of entry structures — subsidiary, branch or representation office — from a practical, operational standpoint",
            "Registration of the investment project",
            "Support with registering the foreign investment with the Bank of Mozambique",
            "Bank account opening and operational establishment",
            "Coordination with service 2.1 — Investment Tax and Customs Benefits",
          ],
        },
        {
          num: "3.3",
          title: "Expatriate Staff Management",
          pain:
            "Quotas, work permits, visas and DIRE delay the deployment of foreign specialists and expose the company to sanctions.",
          deliverables: [
            "Calculation of the available foreign-worker quota",
            "Work permit and visa applications",
            "Conduct of the DIRE process",
            "Complete register of expatriates, with renewal alerts",
          ],
          retainer: "Retainer arrangement indexed to the number of expatriates under management.",
        },
      ],
    },
    {
      num: "4",
      slug: "esg-advisory",
      name: "ESG Advisory",
      promise:
        "Environmental and social management systems and evidence that meet the requirements of lenders and international clients.",
      boundary:
        "Environmental impact studies are prepared by registered environmental consultants, coordinated by DT Company.",
      services: [
        {
          num: "4.1",
          title: "Environmental and Social Management System for Financing",
          pain:
            "Financing is approved, yet disbursement remains conditional on an environmental and social management system that meets the lender's requirements.",
          deliverables: [
            "Diagnostic against the lender's requirements",
            "Environmental, social, and health and safety policies",
            "Procedures, accountabilities and records",
            "Environmental and social action plan",
            "Periodic reporting to the lender",
          ],
        },
        {
          num: "4.2",
          title: "Readiness for International Clients",
          pain:
            "Suppliers and exporters lose multinational and European clients for want of demonstrable labour, environmental and human-rights practices.",
          deliverables: [
            "Responses to clients' ESG questionnaires",
            "Policies on human rights, working conditions and the elimination of child labour",
            "Organised evidence dossier: records, photographs and certificates",
            "Assessment of the client's own suppliers",
            "Improvement plan for subsequent assessments",
          ],
        },
        {
          num: "4.3",
          title: "Community Relations and Grievance Mechanism",
          pain:
            "Projects in rural and coastal areas are suspended over disputes with communities that were never engaged and lack a formal channel through which to raise grievances.",
          deliverables: [
            "Mapping of communities and stakeholders",
            "Community engagement and communication plan",
            "Grievance mechanism: procedure, channel and register",
            "Periodic reporting on grievances and responses",
            "Support at meetings and public consultations",
          ],
        },
      ],
    },
  ],
};

export const dictionaries: Record<Lang, Dict> = { pt, en };

export const languages: Lang[] = ["pt", "en"];

export function getDict(lang: string): Dict {
  return dictionaries[(lang as Lang) in dictionaries ? (lang as Lang) : "pt"];
}

export function isLang(value: string): value is Lang {
  return value === "pt" || value === "en";
}

/** Map a pillar slug from one language to the other (same index). */
export function alternateSlug(slug: string, from: Lang, to: Lang): string | null {
  const idx = dictionaries[from].pillars.findIndex((p) => p.slug === slug);
  if (idx === -1) return null;
  return dictionaries[to].pillars[idx].slug;
}

/** Provisional contact route — replace with the real address when provided. */
export const CONTACT_HREF = "mailto:contacto@dtcompany.example";
