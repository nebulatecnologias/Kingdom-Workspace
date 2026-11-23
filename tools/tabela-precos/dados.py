# Tabela de preços da cooperação DT Company e Kingdom Company (uso interno).
# Decisões do Shelton a 23/11/2026: três modelos de venda (projeto, pacote, serviço pontual);
# hora consultiva a 6.400 MT; redes sociais em pacotes a partir de 20.400 MT por mês;
# Websites a partir de 15.000 MT; Aplicativos passam para Dashboards (a partir de 150.000 MT);
# CRM a partir de 90.000 MT. Os outros valores vêm do relatório reports/Preços de serviços B2B em Moçambique.md.
# Valores em MT, sem IVA. Português pós-1990.

HORA = 6400

MODELOS = {
    'projeto': ('Projeto', 'Âmbito fechado, com entregáveis, prazo e pagamento por marcos. O preço é «a partir de» e fecha-se depois do diagnóstico.'),
    'pacote': ('Pacote', 'Conjunto fixo e repetível, com preço fechado por mês, por turma ou por unidade.'),
    'pontual': ('Serviço pontual', f'Trabalho consultivo cobrado à hora, a {HORA:,} MT por hora. Na proposta indica-se a estimativa de horas.'.replace(',', '.')),
}

CONDICOES = [
    'Valores em meticais, sem IVA (16%).',
    'Propostas válidas por 30 dias.',
    'Projetos pagos por marcos ligados às entregas; o primeiro marco antes de começar.',
    'Sem descontos: para baixar o valor, retira-se âmbito ou propõe-se o plano abaixo.',
    'Deslocações fora de Maputo, licenças de software e verbas de anúncios à parte.',
    f'Horas fora do âmbito de um projeto: {HORA:,} MT por hora.'.replace(',', '.'),
]

# serviço: (nome, modelo, unidade, [(plano, preço, rótulo do preço ou None, [inclui])] , sobe com)
AREAS = [
    ('Estratégia', [
        ('Plano de Negócios', 'projeto', 'por plano', [
            ('Essencial', 35000, None, ['Plano para crédito bancário ou candidatura', 'Projeções a 3 anos e modelo financeiro']),
            ('Profissional', 65000, None, ['Plano para investidores, com estudo de mercado', 'Pitch deck e modelo financeiro editável']),
            ('Premium', 120000, None, ['Vários cenários ou unidades de negócio', 'Preparação da reunião com bancos ou investidores']),
        ], 'Dimensão do negócio, número de cenários e prazo de submissão.'),
        ('Planeamento Estratégico', 'projeto', 'por projeto', [
            ('Essencial', 75000, None, ['Diagnóstico por questionário', '1 dia de sessão com a direção e plano de ação']),
            ('Profissional', 150000, None, ['Diagnóstico com entrevistas e 2 sessões', 'Metas, indicadores e responsáveis']),
            ('Premium', 280000, None, ['Planeamento por áreas', 'Acompanhamento trimestral da execução']),
        ], 'Número de áreas e de participantes, e acompanhamento ao longo do ano.'),
        ('Advisory (Aconselhamento Empresarial)', 'pontual', 'à hora', [
            ('Sessão', HORA, 'por hora', ['Análise de uma decisão com o dono ou a direção', 'Online ou presencial em Maputo']),
            ('Meio dia', 4 * HORA, '4 horas', ['Cenários, riscos e recomendação por escrito']),
            ('Banco de horas', 10 * HORA, '10 horas', ['Para usar em 3 meses, ao mesmo preço por hora']),
        ], 'Número de horas. Não há desconto por volume.'),
    ]),
    ('Compliance e Governança', [
        ('Programa de Compliance e Integridade', 'projeto', 'por projeto', [
            ('Essencial', 95000, None, ['Mapa de riscos, código de conduta e 3 políticas', '1 sessão de formação']),
            ('Profissional', 180000, None, ['Todas as políticas e controlos anti-fraude', 'Canal de denúncia e 2 sessões de formação']),
            ('Premium', 350000, None, ['Programa completo com testes aos controlos', 'Acompanhamento durante 6 meses']),
        ], 'Número de áreas, de locais e de colaboradores a formar.'),
        ('Due Diligence de Terceiros', 'pacote', 'por terceiro verificado', [
            ('Essencial', 12000, None, ['Triagem documental: registo, sócios, sanções e fontes abertas', 'Classificação de risco']),
            ('Profissional', 45000, None, ['Visita ao local em Maputo', 'Confirmação dos beneficiários efetivos']),
            ('Premium', 120000, None, ['Verificação reforçada, com entrevistas', 'Verificação fora de Maputo']),
        ], 'Número de terceiros, localização e urgência.'),
        ('Apuramento Interno de Denúncias e Desvios', 'pontual', 'à hora, com estimativa', [
            ('Caso simples', 12 * HORA, 'até 12 horas', ['Uma denúncia, uma área, até 5 entrevistas']),
            ('Caso médio', 25 * HORA, 'até 25 horas', ['Várias áreas, até 12 entrevistas e 12 meses de registos']),
            ('Caso complexo', 50 * HORA, 'até 50 horas', ['Análise de dados e relatório para o conselho']),
        ], 'Entrevistas, volume de documentos, urgência e trabalho fora de horas.'),
        ('Governança Corporativa e Familiar', 'projeto', 'por projeto', [
            ('Essencial', 85000, None, ['Diagnóstico de governança', 'Matriz de decisões e alçadas']),
            ('Profissional', 180000, None, ['Regimentos da administração e dos comités', 'Conselho consultivo']),
            ('Premium', 380000, None, ['Regras de governança familiar', 'Plano de sucessão na gestão']),
        ], 'Número de sócios, de gerações e de órgãos.'),
    ]),
    ('Marca e Apresentação', [
        ('Identidade Visual', 'projeto', 'por projeto', [
            ('Essencial', 18000, None, ['Logótipo, paleta e tipografia', 'Guia de marca resumido']),
            ('Profissional', 38000, None, ['Manual de identidade visual', 'Aplicações em 5 materiais']),
            ('Premium', 75000, None, ['Posicionamento e conceito da marca', 'Papelaria, digital e sinalética']),
        ], 'Número de propostas de logótipo e de aplicações.'),
        ('Modelos de Propostas Técnicas', 'projeto', 'por proposta', [
            ('Essencial', 18500, None, ['Concurso de bens ou serviços simples', 'Até 20 páginas e modelo editável']),
            ('Profissional', 38000, None, ['Concurso de consultoria ou de ONG', 'Metodologia e plano de trabalho']),
            ('Premium', 65000, None, ['Concurso com vários lotes ou em consórcio', 'Acompanhamento até aos esclarecimentos']),
        ], 'Complexidade do caderno de encargos e prazo até à submissão.'),
        ('Perfis Corporativos', 'projeto', 'por documento', [
            ('Essencial', 12500, None, ['Até 8 páginas, com entrevista de 1 hora', 'Versão em PDF']),
            ('Profissional', 25000, None, ['Até 16 páginas e portefólio de projetos', 'Versões em PDF, PPTX e DOCX']),
            ('Premium', 45000, None, ['Até 24 páginas, com infografias', 'Versões editáveis e para impressão']),
        ], 'Número de páginas e de projetos a apresentar.'),
    ]),
    ('Comunicação e Marketing', [
        ('Produção Audiovisual', 'projeto', 'por vídeo', [
            ('Essencial', 35000, None, ['Vídeo até 1 minuto', 'Meio dia de filmagem e edição']),
            ('Profissional', 75000, None, ['Vídeo institucional até 3 minutos', '1 dia de filmagem e 3 versões curtas']),
            ('Premium', 140000, None, ['2 dias de filmagem, drone e fotografia', '6 versões curtas para as redes']),
        ], 'Dias de filmagem (diária adicional 30.000 MT), locais e animação.'),
        ('Gestão de Redes Sociais', 'pacote', 'por mês · mínimo 3 meses', [
            ('Essencial', 20400, None, ['1 a 2 redes, 12 publicações por mês', 'Relatório mensal']),
            ('Profissional', 36000, None, ['2 a 3 redes, 20 publicações e 2 vídeos curtos', 'Relatório mensal']),
            ('Premium', 60000, None, ['Até 4 redes, 30 publicações e 4 vídeos curtos', 'Gestão de anúncios (verba à parte)']),
        ], 'Número de redes, de publicações e de vídeos.'),
        ('Produção de Campanhas Publicitárias', 'projeto', 'por campanha · verba à parte', [
            ('Essencial', 25000, None, ['1 plataforma, 4 criativos e 1 vídeo curto', '30 dias de gestão e relatório']),
            ('Profissional', 55000, None, ['2 plataformas, 8 criativos e 2 vídeos', '30 dias de gestão e relatório']),
            ('Premium', 110000, None, ['Campanha de lançamento em vários canais', '60 dias de gestão e relatório']),
        ], 'Número de plataformas, de criativos e duração da campanha.'),
    ]),
    ('Tecnologia', [
        ('Websites', 'projeto', 'por projeto · manutenção mensal', [
            ('Essencial', 15000, None, ['One pager com âmbito fechado', 'Publicação no domínio da empresa']),
            ('Profissional', 35000, None, ['Site até 6 páginas, com blog', 'Formulários e botões de contacto']),
            ('Premium', 65000, None, ['Site completo ou loja online', 'Pagamentos e gestão de conteúdos']),
        ], 'Número de páginas, loja online e integrações. Manutenção desde 1.500 MT por mês.'),
        ('Dashboards e Aplicativos', 'projeto', 'por projeto · manutenção mensal', [
            ('Essencial', 150000, None, ['Painel de gestão com 1 a 3 fontes de dados', 'Ou aplicação simples, com formação']),
            ('Profissional', 240000, None, ['Vários painéis ou aplicação com perfis de acesso', 'Formação da equipa']),
            ('Premium', 350000, None, ['Sistema à medida com vários módulos', 'Por exemplo, pedidos, stock e caixa']),
        ], 'Fontes de dados, módulos e utilizadores. Manutenção desde 5.000 MT por mês.'),
        ('CRM e Sistemas de Vendas', 'projeto', 'por projeto · licenças à parte', [
            ('Essencial', 90000, None, ['CRM configurado para uma equipa', 'Importação de contactos e formação']),
            ('Profissional', 150000, None, ['Processo comercial mapeado e automatizações', 'Painel de vendas']),
            ('Premium', 240000, None, ['Integração com outros sistemas', 'Várias equipas ou lojas']),
        ], 'Utilizadores, equipas e integrações. Manutenção desde 5.000 MT por mês.'),
    ]),
    ('Formação de Equipas', [
        ('Liderança Corporativa', 'pacote', 'por turma até 15 pessoas', [
            ('Essencial', 95000, None, ['1 dia de formação']),
            ('Profissional', 180000, None, ['2 dias, com plano de desenvolvimento individual']),
            ('Premium', 420000, None, ['Programa de 3 a 6 meses, com sessões individuais']),
        ], 'Pessoa a mais: 5.000 MT por dia.'),
        ('Atendimento ao Cliente', 'pacote', 'por turma até 15 pessoas', [
            ('Essencial', 75000, None, ['1 dia, com simulações e guia de padrões']),
            ('Profissional', 140000, None, ['2 dias, com reclamações por canal']),
            ('Premium', 260000, None, ['Programa de 3 meses, com cliente mistério']),
        ], 'Pessoa a mais: 3.500 MT por dia. Turnos e locais repetem sessões.'),
        ('Vendas', 'pacote', 'por turma até 15 pessoas', [
            ('Essencial', 85000, None, ['9 horas em 3 sessões']),
            ('Profissional', 160000, None, ['2 dias, com guião de vendas da empresa']),
            ('Premium', 320000, None, ['Programa de 3 meses, com metas por vendedor']),
        ], 'Pessoa a mais: 4.000 MT por dia.'),
        ('Marketing', 'pacote', 'por turma até 15 pessoas', [
            ('Essencial', 80000, None, ['1 dia, com exercícios na marca da empresa']),
            ('Profissional', 150000, None, ['2 dias, com plano de ação para 90 dias']),
            ('Premium', 280000, None, ['Programa de 3 meses, com acompanhamento']),
        ], 'Pessoa a mais: 4.000 MT por dia.'),
    ]),
]
NOTA_AREA = {
    'Compliance e Governança': 'Não prestamos serviços jurídicos nem de contabilidade. Quando um tema o exige, indicamo-lo por escrito e o cliente contrata diretamente o profissional habilitado.',
    'Formação de Equipas': 'Todos os planos incluem avaliação antes e depois, registo de presenças, certificados de participação e relatório final.',
}

EXTRAS = [
    ('Hora consultiva', f'{HORA:,} MT por hora'.replace(',', '.'), 'Advisory, apuramentos e qualquer trabalho fora do âmbito de um projeto.'),
    ('Banco de horas', '10 horas · 64.000 MT', 'Para usar em 3 meses. Mesmo preço por hora, sem desconto.'),
    ('Manutenção de websites', 'desde 1.500 MT por mês', 'Alojamento, certificado de segurança, atualizações e cópias de segurança.'),
    ('Manutenção de sistemas', 'desde 5.000 MT por mês', 'Dashboards, aplicativos e CRM. O valor depende do número de utilizadores.'),
    ('Diária de filmagem', '30.000 MT por dia', 'Dias de filmagem além dos incluídos no plano.'),
    ('Pessoa a mais na formação', '3.500 a 5.000 MT por dia', 'Acima de 15 participantes por turma.'),
    ('Terceiro adicional', 'preço do plano por terceiro', 'Na due diligence, cada terceiro paga o seu plano.'),
    ('À parte', 'custo real', 'Licenças de software, verbas de anúncios, deslocações fora de Maputo.'),
]
