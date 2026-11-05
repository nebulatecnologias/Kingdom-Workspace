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
      "Consultoria em Moçambique: compliance e governança, tax, incorporação de empresas e consultoria ESG. Entregáveis verificáveis e fronteiras claras com advogados e contabilistas parceiros.",
  },
  nav: {
    pillars: "Pilares",
    approach: "Abordagem",
    contact: "Contactos",
    cta: "Falar connosco",
    menuLabel: "Abrir menu",
  },
  hero: {
    h1: "A consultoria que destrava contratos, financiamento e licenças.",
    sub: "A DT Company organiza, regulariza e acompanha — compliance, tax, incorporação e ESG em Moçambique — com entregáveis que se verificam e fronteiras claras sobre o que pertence aos parceiros certificados.",
    ctaPrimary: "Falar connosco",
    ctaSecondary: "Ver os quatro pilares",
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
    heading: "Quatro pilares. Doze serviços. Entregáveis que se verificam.",
    intro:
      "Cada serviço começa na dor concreta do cliente e termina em documentos, dossiers e calendários que ficam na empresa — não em relatórios de gaveta.",
    viewPillar: "Ver o pilar",
    servicesLabel: "serviços",
  },
  approach: {
    heading: "Como trabalhamos",
    intro: "O mesmo método em todos os pilares, do diagnóstico ao acompanhamento.",
    steps: [
      {
        title: "A dor primeiro",
        body: "Começamos no problema que trava o negócio — a inspecção marcada, o financiamento retido, o concurso a fechar — e não num diagnóstico genérico.",
      },
      {
        title: "Entregáveis verificáveis",
        body: "Cada serviço termina em documentos concretos: políticas, dossiers, registos, certidões, calendários de obrigações. O cliente consegue apontar para o que recebeu.",
      },
      {
        title: "Avença para manter em dia",
        body: "Quando faz sentido, propomos acompanhamento mensal — compliance officer externo, secretariado societário, monitorização de fornecedores, calendário fiscal com alertas.",
      },
    ],
  },
  boundaries: {
    heading: "O que não fazemos — e com quem o fazemos",
    intro:
      "Dizer onde termina o nosso trabalho é parte do serviço. A DT Company gere, organiza e acompanha; os actos reservados pertencem aos parceiros certificados.",
    partners: [
      {
        role: "Advogado parceiro",
        scope:
          "Estatutos à medida, acordos entre sócios, documentos de herança e litígio fiscal em tribunal.",
      },
      {
        role: "Contabilista certificado parceiro",
        scope:
          "Em Moçambique, as declarações fiscais e as contas têm de ser assinadas por contabilistas certificados.",
      },
      {
        role: "Consultores ambientais registados",
        scope:
          "Estudos de impacto ambiental são feitos por consultores registados, que a DT Company coordena.",
      },
    ],
  },
  cta: {
    heading: "Tem uma inspecção marcada, um financiamento retido ou uma empresa para instalar?",
    body: "Conte-nos a dor. Respondemos com os entregáveis, o prazo e a fronteira — por escrito.",
    button: "Falar connosco",
    note: "Contactos definitivos em breve — esta via de contacto é provisória.",
  },
  footer: {
    tagline: "Business Advisory & Development — Moçambique",
    pillarsHeading: "Pilares",
    companyHeading: "Empresa",
    approach: "Abordagem",
    contact: "Contactos",
    languageHeading: "Idioma",
    legal: "DT Company — Business Advisory & Development. Todos os direitos reservados.",
    provisional: "Contactos e morada em actualização.",
  },
  pillarPage: {
    pillarLabel: "Pilar",
    painLabel: "A dor",
    deliverablesLabel: "Entregáveis",
    retainerLabel: "Opção de avença",
    modelLabel: "Modelo",
    boundaryLabel: "Fronteira",
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
        "Regras internas, verificação de terceiros e governança que destravam contratos, crédito e investimento.",
      boundary:
        "Acordos entre sócios, estatutos e documentos de herança são redigidos pelo advogado parceiro.",
      services: [
        {
          num: "1.1",
          title: "Programa de Compliance e Integridade",
          pain:
            "Empresas perdem contratos e financiamentos por não terem regras internas, e sofrem fraudes por falta de controlos.",
          deliverables: [
            "Mapa de riscos de compliance e fraude",
            "Código de conduta",
            "Políticas: anticorrupção, conflitos de interesse, ofertas e brindes, pagamentos e mudança de NIB",
            "Canal de denúncia (montado pela nossa equipa tecnológica)",
            "Formação da equipa e da direcção, com registo de presenças",
          ],
          retainer: "Compliance officer externo com relatório mensal.",
        },
        {
          num: "1.2",
          title: "Due Diligence de Terceiros",
          pain:
            "Dinheiro perdido com fornecedores, parceiros, sócios ou vendedores que não são o que dizem.",
          deliverables: [
            "Relatório de verificação (existência, donos reais, ligações políticas, sanções, reputação, documentos)",
            "Classificação de risco: baixo, médio ou alto",
            "Lista de sinais de alerta e de pontos a confirmar antes de assinar",
            "Para terrenos e imóveis: relatório de verificação do DUAT, registos, titulares e ocupantes",
          ],
          retainer: "Monitorização periódica da base de fornecedores.",
        },
        {
          num: "1.3",
          title: "Governança Corporativa e Familiar",
          pain:
            "Empresas que dependem de uma pessoa, conflitos entre sócios ou familiares, e documentação societária desorganizada que trava crédito e investimento.",
          deliverables: [
            "Diagnóstico de governança",
            "Matriz de decisões (quem aprova o quê e até que valor)",
            "Regimentos da administração, comités e conselho consultivo",
            "Regras de governança familiar e plano de sucessão na gestão",
          ],
          retainer:
            "Secretariado societário (calendário de obrigações, convocatórias, actas, livros).",
        },
      ],
    },
    {
      num: "2",
      slug: "tax",
      name: "Tax",
      promise:
        "Benefícios aproveitados, dívidas regularizadas e inspecções sem sustos — com contabilista certificado parceiro.",
      note:
        "Em Moçambique, as declarações fiscais e as contas têm de ser assinadas por contabilistas certificados, e o litígio fiscal em tribunal é de advogados. Neste pilar a DT Company gere, organiza e acompanha, com um contabilista certificado parceiro — tal como tem o advogado parceiro.",
      services: [
        {
          num: "2.1",
          title: "Benefícios Fiscais e Aduaneiros do Investimento",
          pain:
            "Investidores pagam direitos e impostos por inteiro sobre equipamento e investimento porque não pediram os benefícios a que tinham direito, ou perdem-nos por não cumprir as obrigações depois.",
          deliverables: [
            "Estudo dos benefícios aplicáveis ao projecto",
            "Dossier de candidatura e submissão do projecto de investimento",
            "Lista de bens com isenção aduaneira aprovada",
            "Calendário das obrigações para manter os benefícios",
            "Relatório da poupança obtida",
          ],
          model: "Valor fixo mais percentagem da poupança.",
        },
        {
          num: "2.2",
          title: "Regularização Fiscal e Certidão de Quitação",
          pain:
            "Empresas sem certidão de quitação ficam fora de concursos públicos, não recebem pagamentos do Estado e têm problemas com bancos. Muitas nem sabem exactamente o que devem.",
          deliverables: [
            "Levantamento da situação fiscal (dívidas, declarações em falta, coimas)",
            "Plano de regularização, incluindo pedidos de pagamento em prestações",
            "Obtenção da certidão de quitação",
            "Calendário fiscal anual com alertas de prazos",
          ],
          retainer: "Acompanhamento mensal para manter a empresa em dia.",
        },
        {
          num: "2.3",
          title: "Preparação e Acompanhamento de Inspecções Fiscais",
          pain:
            "A inspecção chega, a empresa não tem documentos organizados, não sabe responder e acaba com liquidações e multas pesadas.",
          deliverables: [
            "Revisão fiscal preventiva com identificação de riscos e contingências",
            "Pasta de documentação organizada para a inspecção",
            "Acompanhamento durante a inspecção e resposta aos pedidos da Autoridade Tributária",
            "Relatório final com as correcções a fazer",
            "Encaminhamento para o advogado se houver contestação judicial",
          ],
        },
      ],
    },
    {
      num: "3",
      slug: "incorporacao",
      name: "Incorporação",
      promise:
        "Da constituição ao expatriado a trabalhar: a empresa instalada e em dia, sem meses perdidos.",
      services: [
        {
          num: "3.1",
          title: "Constituição e Licenciamento de Empresas",
          pain:
            "Quem quer abrir uma empresa perde meses entre registos, licenças e entidades diferentes, e paga renda de um espaço que ainda não pode abrir.",
          deliverables: [
            "Mapa de requisitos legais e custos do negócio específico",
            "Acompanhamento do registo da empresa (com modelos de estatutos padrão)",
            "NUIT, inscrição no INSS e licença de actividade",
            "Pasta digital com todos os documentos da empresa",
            "Calendário das primeiras obrigações (renovações, declarações)",
          ],
          boundary: "Estatutos à medida e acordos entre sócios vão para o advogado parceiro.",
        },
        {
          num: "3.2",
          title: "Instalação de Empresas Estrangeiras",
          pain:
            "Empresas estrangeiras não conhecem o sistema moçambicano, escolhem mal a forma de entrar e, por não registarem o investimento, têm depois dificuldades em repatriar lucros e capital.",
          deliverables: [
            "Comparação das formas de entrada (filial, sucursal, escritório de representação) do ponto de vista prático e operacional",
            "Registo do projecto de investimento",
            "Acompanhamento do registo do investimento estrangeiro junto do Banco de Moçambique",
            "Abertura de conta bancária e instalação operacional",
            "Ligação ao serviço 2.1 (benefícios fiscais)",
          ],
        },
        {
          num: "3.3",
          title: "Gestão de Quadros Estrangeiros",
          pain:
            "Empresas não conseguem pôr os técnicos estrangeiros a trabalhar a tempo por causa das quotas, autorizações de trabalho, vistos e DIRE, e arriscam multas.",
          deliverables: [
            "Cálculo da quota de trabalhadores estrangeiros disponível",
            "Pedidos de autorização de trabalho e de visto",
            "Processo de DIRE",
            "Registo de todos os expatriados com alertas de renovação",
          ],
          retainer: "Avença por número de expatriados geridos.",
        },
      ],
    },
    {
      num: "4",
      slug: "consultoria-esg",
      name: "Consultoria ESG",
      promise:
        "Sistemas e evidências que libertam financiamento e mantêm clientes internacionais.",
      boundary:
        "Estudos de impacto ambiental são feitos por consultores ambientais registados, que a DT Company coordena.",
      services: [
        {
          num: "4.1",
          title: "Sistema de Gestão Ambiental e Social para Financiamento",
          pain:
            "O financiamento é aprovado, mas o banco ou financiador internacional só liberta o dinheiro quando a empresa tiver um sistema de gestão ambiental e social.",
          deliverables: [
            "Diagnóstico face aos requisitos do financiador",
            "Políticas ambientais, sociais, de saúde e segurança",
            "Procedimentos, responsáveis e registos",
            "Plano de acção ambiental e social",
            "Relatório periódico ao financiador",
          ],
        },
        {
          num: "4.2",
          title: "Pronto para Clientes Internacionais",
          pain:
            "Fornecedores e exportadores perdem clientes multinacionais e europeus por não conseguirem provar boas práticas laborais, ambientais e de direitos humanos.",
          deliverables: [
            "Resposta aos questionários ESG dos clientes",
            "Políticas de direitos humanos, condições de trabalho e combate ao trabalho infantil",
            "Pasta de evidências organizada (registos, fotografias, certificados)",
            "Avaliação dos próprios fornecedores do cliente",
            "Plano de melhoria para as próximas avaliações",
          ],
        },
        {
          num: "4.3",
          title: "Relação com Comunidades e Mecanismo de Queixas",
          pain:
            "Projectos em zonas rurais ou costeiras param por conflitos com comunidades que não foram ouvidas ou que não têm onde apresentar queixas.",
          deliverables: [
            "Mapa das comunidades e partes interessadas",
            "Plano de envolvimento e comunicação com as comunidades",
            "Mecanismo de queixas (procedimento, canal e registo)",
            "Relatórios periódicos das queixas e respostas",
            "Acompanhamento de reuniões e consultas",
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
      "Advisory firm in Mozambique: compliance and governance, tax, company incorporation and ESG advisory. Verifiable deliverables and honest boundaries with partner lawyers and certified accountants.",
  },
  nav: {
    pillars: "Pillars",
    approach: "Approach",
    contact: "Contact",
    cta: "Talk to us",
    menuLabel: "Open menu",
  },
  hero: {
    h1: "The advisory that unlocks contracts, financing and licences.",
    sub: "DT Company organises, regularises and follows through — compliance, tax, incorporation and ESG in Mozambique — with deliverables you can verify and honest boundaries on what belongs to certified partners.",
    ctaPrimary: "Talk to us",
    ctaSecondary: "See the four pillars",
    facts: [
      { value: "4", label: "pillars of practice" },
      { value: "12", label: "services with defined deliverables" },
      { value: "3", label: "certified partnerships: legal, accounting and environmental" },
    ],
    dossier: {
      heading: "Client dossier",
      note: "Illustrative follow-up example",
      rows: [
        { item: "Tax clearance certificate", status: "Issued", state: "done" },
        { item: "Investment registration — Bank of Mozambique", status: "In progress", state: "active" },
        { item: "DIRE and work permits", status: "3 active", state: "done" },
        { item: "E&S report to the lender", status: "Quarterly", state: "scheduled" },
        { item: "Tax calendar with alerts", status: "Up to date", state: "done" },
      ],
    },
  },
  pillarsSection: {
    heading: "Four pillars. Twelve services. Deliverables you can verify.",
    intro:
      "Every service starts from the client's concrete pain and ends in documents, dossiers and calendars that stay with the company — not drawer reports.",
    viewPillar: "View pillar",
    servicesLabel: "services",
  },
  approach: {
    heading: "How we work",
    intro: "The same method across every pillar, from diagnosis to follow-up.",
    steps: [
      {
        title: "The pain first",
        body: "We start from the problem blocking the business — the scheduled inspection, the withheld financing, the closing tender — not from a generic diagnostic.",
      },
      {
        title: "Verifiable deliverables",
        body: "Every service ends in concrete documents: policies, dossiers, registers, certificates, obligation calendars. The client can point to what they received.",
      },
      {
        title: "A retainer to stay current",
        body: "Where it makes sense, we propose monthly follow-up — external compliance officer, corporate secretariat, supplier monitoring, a tax calendar with alerts.",
      },
    ],
  },
  boundaries: {
    heading: "What we don't do — and who we do it with",
    intro:
      "Saying where our work ends is part of the service. DT Company manages, organises and follows through; reserved acts belong to certified partners.",
    partners: [
      {
        role: "Partner lawyer",
        scope:
          "Tailor-made articles of association, shareholder agreements, inheritance documents and tax litigation in court.",
      },
      {
        role: "Partner certified accountant",
        scope:
          "In Mozambique, tax returns and financial statements must be signed by certified accountants.",
      },
      {
        role: "Registered environmental consultants",
        scope:
          "Environmental impact studies are carried out by registered consultants, coordinated by DT Company.",
      },
    ],
  },
  cta: {
    heading: "An inspection scheduled, financing withheld, or a company to set up?",
    body: "Tell us the pain. We reply with the deliverables, the timeline and the boundary — in writing.",
    button: "Talk to us",
    note: "Definitive contact details coming soon — this contact route is provisional.",
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
    painLabel: "The pain",
    deliverablesLabel: "Deliverables",
    retainerLabel: "Retainer option",
    modelLabel: "Model",
    boundaryLabel: "Boundary",
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
        "Internal rules, third-party verification and governance that unlock contracts, credit and investment.",
      boundary:
        "Shareholder agreements, articles of association and inheritance documents are drafted by the partner lawyer.",
      services: [
        {
          num: "1.1",
          title: "Compliance and Integrity Programme",
          pain:
            "Companies lose contracts and financing for lacking internal rules, and suffer fraud for lack of controls.",
          deliverables: [
            "Compliance and fraud risk map",
            "Code of conduct",
            "Policies: anti-corruption, conflicts of interest, gifts and hospitality, payments and bank-account changes",
            "Whistleblowing channel (set up by our technology team)",
            "Training for staff and management, with attendance records",
          ],
          retainer: "External compliance officer with a monthly report.",
        },
        {
          num: "1.2",
          title: "Third-Party Due Diligence",
          pain:
            "Money lost to suppliers, partners, shareholders or sellers who are not what they claim to be.",
          deliverables: [
            "Verification report (existence, beneficial owners, political connections, sanctions, reputation, documents)",
            "Risk rating: low, medium or high",
            "List of red flags and points to confirm before signing",
            "For land and property: DUAT verification report, registries, title holders and occupants",
          ],
          retainer: "Periodic monitoring of the supplier base.",
        },
        {
          num: "1.3",
          title: "Corporate and Family Governance",
          pain:
            "Companies that depend on one person, conflicts between shareholders or family members, and disorganised corporate records that block credit and investment.",
          deliverables: [
            "Governance diagnostic",
            "Decision matrix (who approves what, and up to what amount)",
            "Charters for the board, committees and advisory council",
            "Family governance rules and a management succession plan",
          ],
          retainer:
            "Corporate secretariat (obligations calendar, meeting notices, minutes, statutory books).",
        },
      ],
    },
    {
      num: "2",
      slug: "tax",
      name: "Tax",
      promise:
        "Benefits captured, debts regularised and inspections without surprises — with a partner certified accountant.",
      note:
        "In Mozambique, tax returns and financial statements must be signed by certified accountants, and tax litigation in court belongs to lawyers. In this pillar DT Company manages, organises and follows through, with a partner certified accountant — just as it has the partner lawyer.",
      services: [
        {
          num: "2.1",
          title: "Investment Tax and Customs Benefits",
          pain:
            "Investors pay full duties and taxes on equipment and investment because they never applied for the benefits they were entitled to, or lose them by failing to meet the obligations afterwards.",
          deliverables: [
            "Study of the benefits applicable to the project",
            "Application dossier and submission of the investment project",
            "List of goods with approved customs exemption",
            "Calendar of obligations to keep the benefits",
            "Report on the savings obtained",
          ],
          model: "Fixed fee plus a percentage of the savings.",
        },
        {
          num: "2.2",
          title: "Tax Regularisation and Clearance Certificate",
          pain:
            "Companies without a tax clearance certificate are shut out of public tenders, don't get paid by the State and run into problems with banks. Many don't even know exactly what they owe.",
          deliverables: [
            "Assessment of the tax position (debts, missing returns, fines)",
            "Regularisation plan, including requests for payment in instalments",
            "Obtaining the tax clearance certificate",
            "Annual tax calendar with deadline alerts",
          ],
          retainer: "Monthly follow-up to keep the company current.",
        },
        {
          num: "2.3",
          title: "Tax Inspection Preparation and Support",
          pain:
            "The inspection arrives, the company has no organised documents, doesn't know how to respond, and ends up with heavy assessments and fines.",
          deliverables: [
            "Preventive tax review identifying risks and contingencies",
            "Organised documentation folder for the inspection",
            "Support during the inspection and responses to the Tax Authority's requests",
            "Final report with the corrections to make",
            "Referral to the lawyer if there is a court challenge",
          ],
        },
      ],
    },
    {
      num: "3",
      slug: "incorporation",
      name: "Incorporation",
      promise:
        "From incorporation to the expatriate at work: the company installed and current, without lost months.",
      services: [
        {
          num: "3.1",
          title: "Company Formation and Licensing",
          pain:
            "Anyone opening a company loses months between registrations, licences and different authorities, and pays rent on premises they still cannot open.",
          deliverables: [
            "Map of legal requirements and costs for the specific business",
            "Support through company registration (with standard articles templates)",
            "NUIT, INSS registration and operating licence",
            "Digital folder with all company documents",
            "Calendar of the first obligations (renewals, filings)",
          ],
          boundary:
            "Tailor-made articles and shareholder agreements go to the partner lawyer.",
        },
        {
          num: "3.2",
          title: "Setting Up Foreign Companies",
          pain:
            "Foreign companies don't know the Mozambican system, choose the wrong way in and, by failing to register the investment, later struggle to repatriate profits and capital.",
          deliverables: [
            "Comparison of entry forms (subsidiary, branch, representation office) from a practical, operational standpoint",
            "Registration of the investment project",
            "Support with registering the foreign investment with the Bank of Mozambique",
            "Bank account opening and operational set-up",
            "Link to service 2.1 (tax benefits)",
          ],
        },
        {
          num: "3.3",
          title: "Expatriate Staff Management",
          pain:
            "Companies can't get foreign technicians working on time because of quotas, work permits, visas and DIRE, and risk fines.",
          deliverables: [
            "Calculation of the available foreign-worker quota",
            "Work permit and visa applications",
            "DIRE process",
            "Register of all expatriates with renewal alerts",
          ],
          retainer: "Retainer per number of expatriates managed.",
        },
      ],
    },
    {
      num: "4",
      slug: "esg-advisory",
      name: "ESG Advisory",
      promise:
        "Systems and evidence that release financing and keep international clients.",
      boundary:
        "Environmental impact studies are carried out by registered environmental consultants, coordinated by DT Company.",
      services: [
        {
          num: "4.1",
          title: "Environmental and Social Management System for Financing",
          pain:
            "The financing is approved, but the bank or international lender only releases the money once the company has an environmental and social management system.",
          deliverables: [
            "Diagnostic against the lender's requirements",
            "Environmental, social, health and safety policies",
            "Procedures, owners and records",
            "Environmental and social action plan",
            "Periodic report to the lender",
          ],
        },
        {
          num: "4.2",
          title: "Ready for International Clients",
          pain:
            "Suppliers and exporters lose multinational and European clients because they cannot prove good labour, environmental and human-rights practices.",
          deliverables: [
            "Responses to clients' ESG questionnaires",
            "Policies on human rights, working conditions and combating child labour",
            "Organised evidence folder (records, photographs, certificates)",
            "Assessment of the client's own suppliers",
            "Improvement plan for the next assessments",
          ],
        },
        {
          num: "4.3",
          title: "Community Relations and Grievance Mechanism",
          pain:
            "Projects in rural or coastal areas stall over conflicts with communities that were never heard or have nowhere to lodge complaints.",
          deliverables: [
            "Map of communities and stakeholders",
            "Community engagement and communication plan",
            "Grievance mechanism (procedure, channel and register)",
            "Periodic reports on grievances and responses",
            "Support at meetings and consultations",
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
