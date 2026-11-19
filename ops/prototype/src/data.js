// Kingdom Ops — sample data (synthetic). Field names are the production column names
// (see docs/kingdom-ops/plano-desenvolvimento.md §3). The Supabase seed is generated from this file.
'use strict';

const TZ = 'Africa/Maputo';
// Fixed "now" so the prototype always looks the same: Wednesday 19 Nov 2026, 09:45 in Maputo.
const NOW = new Date('2026-11-19T09:45:00+02:00');
const ME = 'p1';

const profiles = [
  { id: 'p1', full_name: 'Ana Cossa', role: 'admin', job_title: 'Diretora', phone_whatsapp: '+258 84 210 3344', avatar_url: null, active: true },
  { id: 'p2', full_name: 'Bruno Macuácua', role: 'member', job_title: 'Consultor sénior', phone_whatsapp: '+258 82 551 7781', avatar_url: null, active: true },
  { id: 'p3', full_name: 'Carla Sitoe', role: 'member', job_title: 'Comercial', phone_whatsapp: '+258 86 904 1120', avatar_url: null, active: true },
  { id: 'p4', full_name: 'Dário Nhantumbo', role: 'member', job_title: 'Marketing', phone_whatsapp: '+258 87 330 6652', avatar_url: null, active: true },
];

const pipelines = [
  { id: 'pl1', slug: 'reunioes', name: 'Reuniões', kind: 'meetings', icon: 'calendar', position: 1 },
  { id: 'pl2', slug: 'vendas', name: 'Vendas', kind: 'sales', icon: 'target', position: 2 },
  { id: 'pl3', slug: 'projetos', name: 'Projetos', kind: 'projects', icon: 'briefcase', position: 3 },
  { id: 'pl4', slug: 'campanhas', name: 'Campanhas', kind: 'campaigns', icon: 'megaphone', position: 4 },
  { id: 'pl5', slug: 'tarefas', name: 'Tarefas', kind: 'tasks', icon: 'check-square', position: 5 },
];

// tone: neutral | info | warning | danger | success
const pipeline_stages = [
  { id: 's_agendado', pipeline_id: 'pl1', name: 'Agendado', position: 1, tone: 'neutral', is_done: false, is_lost: false, requires_note: false, requires_reschedule: false },
  { id: 's_emcurso', pipeline_id: 'pl1', name: 'Em curso', position: 2, tone: 'info', is_done: false, is_lost: false, requires_note: false, requires_reschedule: false },
  { id: 's_adiada', pipeline_id: 'pl1', name: 'Adiada', position: 3, tone: 'warning', is_done: false, is_lost: false, requires_note: false, requires_reschedule: true },
  { id: 's_cancelada', pipeline_id: 'pl1', name: 'Cancelada', position: 4, tone: 'danger', is_done: false, is_lost: true, requires_note: true, requires_reschedule: false },
  { id: 's_concluida', pipeline_id: 'pl1', name: 'Concluída', position: 5, tone: 'success', is_done: true, is_lost: false, requires_note: false, requires_reschedule: false },

  { id: 'v_lead', pipeline_id: 'pl2', name: 'Lead', position: 1, tone: 'neutral', is_done: false, is_lost: false, requires_note: false, requires_reschedule: false },
  { id: 'v_contactado', pipeline_id: 'pl2', name: 'Contactado', position: 2, tone: 'neutral', is_done: false, is_lost: false, requires_note: false, requires_reschedule: false },
  { id: 'v_proposta', pipeline_id: 'pl2', name: 'Proposta', position: 3, tone: 'info', is_done: false, is_lost: false, requires_note: false, requires_reschedule: false },
  { id: 'v_negociacao', pipeline_id: 'pl2', name: 'Negociação', position: 4, tone: 'warning', is_done: false, is_lost: false, requires_note: false, requires_reschedule: false },
  { id: 'v_ganho', pipeline_id: 'pl2', name: 'Ganho', position: 5, tone: 'success', is_done: true, is_lost: false, requires_note: false, requires_reschedule: false },
  { id: 'v_perdido', pipeline_id: 'pl2', name: 'Perdido', position: 6, tone: 'danger', is_done: false, is_lost: true, requires_note: true, requires_reschedule: false },

  { id: 'pj_kickoff', pipeline_id: 'pl3', name: 'Kickoff', position: 1, tone: 'neutral', is_done: false, is_lost: false, requires_note: false, requires_reschedule: false },
  { id: 'pj_curso', pipeline_id: 'pl3', name: 'Em curso', position: 2, tone: 'info', is_done: false, is_lost: false, requires_note: false, requires_reschedule: false },
  { id: 'pj_revisao', pipeline_id: 'pl3', name: 'Em revisão', position: 3, tone: 'info', is_done: false, is_lost: false, requires_note: false, requires_reschedule: false },
  { id: 'pj_bloqueado', pipeline_id: 'pl3', name: 'Bloqueado', position: 4, tone: 'warning', is_done: false, is_lost: false, requires_note: true, requires_reschedule: false },
  { id: 'pj_entregue', pipeline_id: 'pl3', name: 'Entregue', position: 5, tone: 'success', is_done: true, is_lost: false, requires_note: false, requires_reschedule: false },

  { id: 'c_ideia', pipeline_id: 'pl4', name: 'Ideia', position: 1, tone: 'neutral', is_done: false, is_lost: false, requires_note: false, requires_reschedule: false },
  { id: 'c_plano', pipeline_id: 'pl4', name: 'Planeamento', position: 2, tone: 'neutral', is_done: false, is_lost: false, requires_note: false, requires_reschedule: false },
  { id: 'c_producao', pipeline_id: 'pl4', name: 'Em produção', position: 3, tone: 'info', is_done: false, is_lost: false, requires_note: false, requires_reschedule: false },
  { id: 'c_noar', pipeline_id: 'pl4', name: 'No ar', position: 4, tone: 'success', is_done: false, is_lost: false, requires_note: false, requires_reschedule: false },
  { id: 'c_terminada', pipeline_id: 'pl4', name: 'Terminada', position: 5, tone: 'neutral', is_done: true, is_lost: false, requires_note: false, requires_reschedule: false },

  { id: 't_afazer', pipeline_id: 'pl5', name: 'A fazer', position: 1, tone: 'neutral', is_done: false, is_lost: false, requires_note: false, requires_reschedule: false },
  { id: 't_curso', pipeline_id: 'pl5', name: 'Em curso', position: 2, tone: 'info', is_done: false, is_lost: false, requires_note: false, requires_reschedule: false },
  { id: 't_bloqueada', pipeline_id: 'pl5', name: 'Bloqueada', position: 3, tone: 'warning', is_done: false, is_lost: false, requires_note: true, requires_reschedule: false },
  { id: 't_concluida', pipeline_id: 'pl5', name: 'Concluída', position: 4, tone: 'success', is_done: true, is_lost: false, requires_note: false, requires_reschedule: false },
];

// Helper to write Maputo timestamps compactly.
const at = (d, t) => `${d}T${t}:00+02:00`;

const cards = [
  // ----- Reuniões (kind: meetings) -----
  { id: 'c1', pipeline_id: 'pl1', stage_id: 's_agendado', title: 'Diagnóstico de processos comerciais', owner_id: 'p2', starts_at: at('2026-11-19', '10:30'), ends_at: at('2026-11-19', '11:30'), location_kind: 'in_person', location: 'Escritório Agro Sul, Av. 25 de Setembro, Maputo', contact_name: 'Teresa Mondlane', contact_role: 'Diretora Geral', contact_phone: '+258 84 777 1020', contact_email: 'teresa.mondlane@agrosul.example', company_name: 'Agro Sul Moçambique, Lda', company_sector: 'Agro-indústria', value_cents: null, due_at: null, description: 'Primeira reunião de diagnóstico. Levar o questionário de processos e o caso da Clínica Bela Vista.', position: 1, stage_changed_at: at('2026-11-12', '15:10'), created_at: at('2026-11-12', '15:10') },
  { id: 'c2', pipeline_id: 'pl1', stage_id: 's_agendado', title: 'Apresentação da proposta de ERP', owner_id: 'p3', starts_at: at('2026-11-19', '14:00'), ends_at: at('2026-11-19', '15:00'), location_kind: 'online', location: 'https://meet.google.com/kgd-ops-demo', contact_name: 'Sérgio Langa', contact_role: 'Diretor de Operações', contact_phone: '+258 82 331 4455', contact_email: 'slanga@maputologistica.example', company_name: 'Maputo Logística, SA', company_sector: 'Logística', value_cents: null, due_at: null, description: 'Mostrar a proposta v2 com o módulo de frota. Decisor final presente.', position: 2, stage_changed_at: at('2026-11-14', '09:20'), created_at: at('2026-11-14', '09:20') },
  { id: 'c3', pipeline_id: 'pl1', stage_id: 's_agendado', title: 'Formação da equipa de vendas', owner_id: 'p1', starts_at: at('2026-11-19', '16:30'), ends_at: at('2026-11-19', '18:00'), location_kind: 'in_person', location: 'Sala de formação Kingdom, Maputo', contact_name: 'Luísa Tembe', contact_role: 'Coordenadora', contact_phone: '+258 86 120 9988', contact_email: 'ltembe@horizonte.example', company_name: 'Escola Horizonte', company_sector: 'Educação', value_cents: null, due_at: null, description: 'Sessão 2 de 4. Tema: funil e acompanhamento.', position: 3, stage_changed_at: at('2026-11-10', '11:00'), created_at: at('2026-11-10', '11:00') },
  { id: 'c4', pipeline_id: 'pl1', stage_id: 's_concluida', title: 'Kickoff do projeto de loja online', owner_id: 'p2', starts_at: at('2026-11-18', '09:00'), ends_at: at('2026-11-18', '10:30'), location_kind: 'in_person', location: 'Sede Nhamacoa Tech, Matola', contact_name: 'Ivan Mabjaia', contact_role: 'CEO', contact_phone: '+258 84 905 2210', contact_email: 'ivan@nhamacoa.example', company_name: 'Nhamacoa Tech', company_sector: 'Tecnologia', value_cents: null, due_at: null, description: 'Arranque oficial. Definir equipa, calendário e canais.', position: 1, stage_changed_at: at('2026-11-18', '10:40'), created_at: at('2026-11-05', '16:00') },
  { id: 'c5', pipeline_id: 'pl1', stage_id: 's_concluida', title: 'Revisão do plano de marketing 2027', owner_id: 'p4', starts_at: at('2026-11-17', '15:00'), ends_at: at('2026-11-17', '16:00'), location_kind: 'online', location: 'https://meet.google.com/kgd-mkt-2027', contact_name: 'Dr. Paulo Chissano', contact_role: 'Diretor Clínico', contact_phone: '+258 82 660 7410', contact_email: 'pchissano@belavista.example', company_name: 'Clínica Bela Vista', company_sector: 'Saúde', value_cents: null, due_at: null, description: '', position: 2, stage_changed_at: at('2026-11-17', '16:05'), created_at: at('2026-11-03', '10:00') },
  { id: 'c6', pipeline_id: 'pl1', stage_id: 's_adiada', title: 'Visita técnica ao armazém', owner_id: 'p2', starts_at: at('2026-11-24', '08:30'), ends_at: at('2026-11-24', '10:00'), location_kind: 'in_person', location: 'Armazém Construtora Zambeze, Zona Industrial', contact_name: 'Hélder Muianga', contact_role: 'Gestor de Obra', contact_phone: '+258 87 441 0093', contact_email: 'hmuianga@zambeze.example', company_name: 'Construtora Zambeze', company_sector: 'Construção', value_cents: null, due_at: null, description: 'Levantamento para o sistema de stock.', position: 1, stage_changed_at: at('2026-11-18', '17:30'), created_at: at('2026-11-06', '12:00') },
  { id: 'c7', pipeline_id: 'pl1', stage_id: 's_cancelada', title: 'Reunião de alinhamento financeiro', owner_id: 'p3', starts_at: at('2026-11-18', '11:00'), ends_at: at('2026-11-18', '12:00'), location_kind: 'phone', location: 'Chamada', contact_name: 'Rute Cumbe', contact_role: 'Administradora', contact_phone: '+258 84 211 8870', contact_email: 'rcumbe@mozpescas.example', company_name: 'Moçambique Pescas', company_sector: 'Pescas', value_cents: null, due_at: null, description: '', position: 1, stage_changed_at: at('2026-11-18', '08:15'), created_at: at('2026-11-09', '09:00') },
  { id: 'c8', pipeline_id: 'pl1', stage_id: 's_agendado', title: 'Entrega do relatório de diagnóstico', owner_id: 'p2', starts_at: at('2026-11-20', '10:00'), ends_at: at('2026-11-20', '11:00'), location_kind: 'in_person', location: 'Escritório Kingdom, Maputo', contact_name: 'Amélia Nhaca', contact_role: 'Proprietária', contact_phone: '+258 86 778 3321', contact_email: 'amelia@farmaciacentral.example', company_name: 'Farmácia Central', company_sector: 'Retalho', value_cents: null, due_at: null, description: 'Imprimir 2 cópias do relatório.', position: 4, stage_changed_at: at('2026-11-13', '14:00'), created_at: at('2026-11-13', '14:00') },
  { id: 'c9', pipeline_id: 'pl1', stage_id: 's_agendado', title: 'Workshop de identidade visual', owner_id: 'p4', starts_at: at('2026-11-20', '14:30'), ends_at: at('2026-11-20', '17:00'), location_kind: 'in_person', location: 'Sede Nhamacoa Tech, Matola', contact_name: 'Ivan Mabjaia', contact_role: 'CEO', contact_phone: '+258 84 905 2210', contact_email: 'ivan@nhamacoa.example', company_name: 'Nhamacoa Tech', company_sector: 'Tecnologia', value_cents: null, due_at: null, description: '', position: 5, stage_changed_at: at('2026-11-15', '10:00'), created_at: at('2026-11-15', '10:00') },
  { id: 'c10', pipeline_id: 'pl1', stage_id: 's_agendado', title: 'Follow-up da proposta de consultoria', owner_id: 'p3', starts_at: at('2026-11-21', '09:30'), ends_at: at('2026-11-21', '10:00'), location_kind: 'phone', location: 'Chamada', contact_name: 'Teresa Mondlane', contact_role: 'Diretora Geral', contact_phone: '+258 84 777 1020', contact_email: 'teresa.mondlane@agrosul.example', company_name: 'Agro Sul Moçambique, Lda', company_sector: 'Agro-indústria', value_cents: null, due_at: null, description: '', position: 6, stage_changed_at: at('2026-11-16', '18:00'), created_at: at('2026-11-16', '18:00') },
  { id: 'c11', pipeline_id: 'pl1', stage_id: 's_agendado', title: 'Reunião mensal de acompanhamento', owner_id: 'p1', starts_at: at('2026-11-23', '11:00'), ends_at: at('2026-11-23', '12:00'), location_kind: 'online', location: 'https://meet.google.com/kgd-bela-vista', contact_name: 'Dr. Paulo Chissano', contact_role: 'Diretor Clínico', contact_phone: '+258 82 660 7410', contact_email: 'pchissano@belavista.example', company_name: 'Clínica Bela Vista', company_sector: 'Saúde', value_cents: null, due_at: null, description: '', position: 7, stage_changed_at: at('2026-11-01', '09:00'), created_at: at('2026-11-01', '09:00') },
  { id: 'c12', pipeline_id: 'pl1', stage_id: 's_concluida', title: 'Levantamento de requisitos do portal', owner_id: 'p2', starts_at: at('2026-11-12', '10:00'), ends_at: at('2026-11-12', '12:00'), location_kind: 'in_person', location: 'Escola Horizonte, Maputo', contact_name: 'Luísa Tembe', contact_role: 'Coordenadora', contact_phone: '+258 86 120 9988', contact_email: 'ltembe@horizonte.example', company_name: 'Escola Horizonte', company_sector: 'Educação', value_cents: null, due_at: null, description: '', position: 3, stage_changed_at: at('2026-11-12', '12:10'), created_at: at('2026-11-02', '09:00') },

  // ----- Vendas (kind: sales) -----
  { id: 'c20', pipeline_id: 'pl2', stage_id: 'v_lead', title: 'Sistema de gestão de stock', owner_id: 'p3', starts_at: null, ends_at: null, location_kind: null, location: null, contact_name: 'Hélder Muianga', contact_role: 'Gestor de Obra', contact_phone: '+258 87 441 0093', contact_email: 'hmuianga@zambeze.example', company_name: 'Construtora Zambeze', company_sector: 'Construção', value_cents: 48000000, due_at: at('2026-12-15', '00:00'), description: 'Indicação do Ivan (Nhamacoa).', position: 1, stage_changed_at: at('2026-11-17', '10:00'), created_at: at('2026-11-17', '10:00') },
  { id: 'c21', pipeline_id: 'pl2', stage_id: 'v_contactado', title: 'Plano de expansão regional', owner_id: 'p1', starts_at: null, ends_at: null, location_kind: null, location: null, contact_name: 'Rute Cumbe', contact_role: 'Administradora', contact_phone: '+258 84 211 8870', contact_email: 'rcumbe@mozpescas.example', company_name: 'Moçambique Pescas', company_sector: 'Pescas', value_cents: 95000000, due_at: at('2027-01-30', '00:00'), description: '', position: 1, stage_changed_at: at('2026-11-15', '10:00'), created_at: at('2026-11-10', '10:00') },
  { id: 'c22', pipeline_id: 'pl2', stage_id: 'v_proposta', title: 'ERP com módulo de frota', owner_id: 'p3', starts_at: null, ends_at: null, location_kind: null, location: null, contact_name: 'Sérgio Langa', contact_role: 'Diretor de Operações', contact_phone: '+258 82 331 4455', contact_email: 'slanga@maputologistica.example', company_name: 'Maputo Logística, SA', company_sector: 'Logística', value_cents: 182000000, due_at: at('2026-11-28', '00:00'), description: 'Proposta v2 enviada a 14/11.', position: 1, stage_changed_at: at('2026-11-14', '18:00'), created_at: at('2026-10-20', '10:00') },
  { id: 'c23', pipeline_id: 'pl2', stage_id: 'v_proposta', title: 'Consultoria de processos comerciais', owner_id: 'p2', starts_at: null, ends_at: null, location_kind: null, location: null, contact_name: 'Teresa Mondlane', contact_role: 'Diretora Geral', contact_phone: '+258 84 777 1020', contact_email: 'teresa.mondlane@agrosul.example', company_name: 'Agro Sul Moçambique, Lda', company_sector: 'Agro-indústria', value_cents: 65000000, due_at: at('2026-12-05', '00:00'), description: '', position: 2, stage_changed_at: at('2026-11-16', '17:00'), created_at: at('2026-11-02', '10:00') },
  { id: 'c24', pipeline_id: 'pl2', stage_id: 'v_negociacao', title: 'Portal do aluno e app', owner_id: 'p1', starts_at: null, ends_at: null, location_kind: null, location: null, contact_name: 'Luísa Tembe', contact_role: 'Coordenadora', contact_phone: '+258 86 120 9988', contact_email: 'ltembe@horizonte.example', company_name: 'Escola Horizonte', company_sector: 'Educação', value_cents: 120000000, due_at: at('2026-11-30', '00:00'), description: 'Pedem 10% de desconto e pagamento em 3 prestações.', position: 1, stage_changed_at: at('2026-11-13', '12:00'), created_at: at('2026-10-05', '10:00') },
  { id: 'c25', pipeline_id: 'pl2', stage_id: 'v_ganho', title: 'Loja online e marca', owner_id: 'p4', starts_at: null, ends_at: null, location_kind: null, location: null, contact_name: 'Ivan Mabjaia', contact_role: 'CEO', contact_phone: '+258 84 905 2210', contact_email: 'ivan@nhamacoa.example', company_name: 'Nhamacoa Tech', company_sector: 'Tecnologia', value_cents: 74000000, due_at: null, description: '', position: 1, stage_changed_at: at('2026-11-04', '16:00'), created_at: at('2026-09-28', '10:00') },
  { id: 'c26', pipeline_id: 'pl2', stage_id: 'v_perdido', title: 'Auditoria de TI', owner_id: 'p3', starts_at: null, ends_at: null, location_kind: null, location: null, contact_name: 'Amélia Nhaca', contact_role: 'Proprietária', contact_phone: '+258 86 778 3321', contact_email: 'amelia@farmaciacentral.example', company_name: 'Farmácia Central', company_sector: 'Retalho', value_cents: 22000000, due_at: null, description: 'Optaram por fornecedor interno.', position: 1, stage_changed_at: at('2026-11-08', '09:00'), created_at: at('2026-10-12', '10:00') },

  // ----- Projetos (kind: projects) -----
  { id: 'c30', pipeline_id: 'pl3', stage_id: 'pj_kickoff', title: 'Loja online Nhamacoa', owner_id: 'p2', starts_at: null, ends_at: null, location_kind: null, location: null, contact_name: 'Ivan Mabjaia', contact_role: 'CEO', contact_phone: '+258 84 905 2210', contact_email: 'ivan@nhamacoa.example', company_name: 'Nhamacoa Tech', company_sector: 'Tecnologia', value_cents: null, due_at: at('2027-02-27', '00:00'), description: 'Fase 1: catálogo e pagamentos.', position: 1, stage_changed_at: at('2026-11-18', '10:40'), created_at: at('2026-11-05', '10:00') },
  { id: 'c31', pipeline_id: 'pl3', stage_id: 'pj_curso', title: 'Plano de marketing 2027', owner_id: 'p4', starts_at: null, ends_at: null, location_kind: null, location: null, contact_name: 'Dr. Paulo Chissano', contact_role: 'Diretor Clínico', contact_phone: '+258 82 660 7410', contact_email: 'pchissano@belavista.example', company_name: 'Clínica Bela Vista', company_sector: 'Saúde', value_cents: null, due_at: at('2026-12-12', '00:00'), description: '', position: 1, stage_changed_at: at('2026-10-20', '10:00'), created_at: at('2026-10-01', '10:00') },
  { id: 'c32', pipeline_id: 'pl3', stage_id: 'pj_revisao', title: 'Diagnóstico Farmácia Central', owner_id: 'p2', starts_at: null, ends_at: null, location_kind: null, location: null, contact_name: 'Amélia Nhaca', contact_role: 'Proprietária', contact_phone: '+258 86 778 3321', contact_email: 'amelia@farmaciacentral.example', company_name: 'Farmácia Central', company_sector: 'Retalho', value_cents: null, due_at: at('2026-11-20', '00:00'), description: 'Relatório final em revisão pela Ana.', position: 1, stage_changed_at: at('2026-11-17', '09:00'), created_at: at('2026-10-15', '10:00') },
  { id: 'c33', pipeline_id: 'pl3', stage_id: 'pj_bloqueado', title: 'Formação em vendas Horizonte', owner_id: 'p1', starts_at: null, ends_at: null, location_kind: null, location: null, contact_name: 'Luísa Tembe', contact_role: 'Coordenadora', contact_phone: '+258 86 120 9988', contact_email: 'ltembe@horizonte.example', company_name: 'Escola Horizonte', company_sector: 'Educação', value_cents: null, due_at: at('2026-12-19', '00:00'), description: 'À espera da lista de formandos.', position: 1, stage_changed_at: at('2026-11-16', '15:00'), created_at: at('2026-10-28', '10:00') },

  // ----- Campanhas (kind: campaigns) -----
  { id: 'c40', pipeline_id: 'pl4', stage_id: 'c_plano', title: 'Campanha "Negócio Digital" (LinkedIn)', owner_id: 'p4', starts_at: null, ends_at: null, location_kind: null, location: null, contact_name: null, contact_role: null, contact_phone: null, contact_email: null, company_name: 'Kingdom', company_sector: null, value_cents: 1500000, due_at: at('2026-12-01', '00:00'), description: '4 artigos + 2 vídeos curtos.', position: 1, stage_changed_at: at('2026-11-10', '10:00'), created_at: at('2026-11-03', '10:00') },
  { id: 'c41', pipeline_id: 'pl4', stage_id: 'c_producao', title: 'Newsletter de novembro', owner_id: 'p4', starts_at: null, ends_at: null, location_kind: null, location: null, contact_name: null, contact_role: null, contact_phone: null, contact_email: null, company_name: 'Kingdom', company_sector: null, value_cents: null, due_at: at('2026-11-25', '00:00'), description: '', position: 1, stage_changed_at: at('2026-11-15', '10:00'), created_at: at('2026-11-08', '10:00') },
  { id: 'c42', pipeline_id: 'pl4', stage_id: 'c_noar', title: 'Webinar "Processos que vendem"', owner_id: 'p1', starts_at: null, ends_at: null, location_kind: null, location: null, contact_name: null, contact_role: null, contact_phone: null, contact_email: null, company_name: 'Kingdom', company_sector: null, value_cents: 800000, due_at: at('2026-11-27', '00:00'), description: 'Inscrições abertas até 26/11.', position: 1, stage_changed_at: at('2026-11-12', '10:00'), created_at: at('2026-10-25', '10:00') },

  // ----- Tarefas (kind: tasks) -----
  { id: 'c50', pipeline_id: 'pl5', stage_id: 't_afazer', title: 'Imprimir relatório Farmácia Central', owner_id: 'p2', starts_at: null, ends_at: null, location_kind: null, location: null, contact_name: null, contact_role: null, contact_phone: null, contact_email: null, company_name: 'Farmácia Central', company_sector: null, value_cents: null, due_at: at('2026-11-20', '09:00'), description: '2 cópias encadernadas.', position: 1, stage_changed_at: at('2026-11-18', '10:00'), created_at: at('2026-11-18', '10:00') },
  { id: 'c51', pipeline_id: 'pl5', stage_id: 't_afazer', title: 'Enviar proposta revista à Escola Horizonte', owner_id: 'p1', starts_at: null, ends_at: null, location_kind: null, location: null, contact_name: null, contact_role: null, contact_phone: null, contact_email: null, company_name: 'Escola Horizonte', company_sector: null, value_cents: null, due_at: at('2026-11-18', '18:00'), description: 'Com desconto de 8% e 3 prestações.', position: 2, stage_changed_at: at('2026-11-14', '10:00'), created_at: at('2026-11-14', '10:00') },
  { id: 'c52', pipeline_id: 'pl5', stage_id: 't_curso', title: 'Preparar questionário de diagnóstico', owner_id: 'p2', starts_at: null, ends_at: null, location_kind: null, location: null, contact_name: null, contact_role: null, contact_phone: null, contact_email: null, company_name: 'Agro Sul Moçambique, Lda', company_sector: null, value_cents: null, due_at: at('2026-11-19', '10:00'), description: '', position: 1, stage_changed_at: at('2026-11-17', '10:00'), created_at: at('2026-11-16', '10:00') },
  { id: 'c53', pipeline_id: 'pl5', stage_id: 't_curso', title: 'Gravar vídeo 1 da campanha', owner_id: 'p4', starts_at: null, ends_at: null, location_kind: null, location: null, contact_name: null, contact_role: null, contact_phone: null, contact_email: null, company_name: 'Kingdom', company_sector: null, value_cents: null, due_at: at('2026-11-21', '00:00'), description: '', position: 2, stage_changed_at: at('2026-11-18', '10:00'), created_at: at('2026-11-12', '10:00') },
  { id: 'c54', pipeline_id: 'pl5', stage_id: 't_bloqueada', title: 'Contrato Maputo Logística para revisão legal', owner_id: 'p3', starts_at: null, ends_at: null, location_kind: null, location: null, contact_name: null, contact_role: null, contact_phone: null, contact_email: null, company_name: 'Maputo Logística, SA', company_sector: null, value_cents: null, due_at: at('2026-11-24', '00:00'), description: 'Advogado só responde na segunda.', position: 1, stage_changed_at: at('2026-11-18', '16:00'), created_at: at('2026-11-15', '10:00') },
  { id: 'c55', pipeline_id: 'pl5', stage_id: 't_concluida', title: 'Marcar sala para formação', owner_id: 'p1', starts_at: null, ends_at: null, location_kind: null, location: null, contact_name: null, contact_role: null, contact_phone: null, contact_email: null, company_name: 'Escola Horizonte', company_sector: null, value_cents: null, due_at: at('2026-11-17', '00:00'), description: '', position: 1, stage_changed_at: at('2026-11-17', '11:00'), created_at: at('2026-11-10', '10:00') },
];

const card_participants = [
  { card_id: 'c1', profile_id: 'p3' },
  { card_id: 'c2', profile_id: 'p2' },
  { card_id: 'c3', profile_id: 'p3' },
  { card_id: 'c3', profile_id: 'p4' },
  { card_id: 'c4', profile_id: 'p4' },
  { card_id: 'c9', profile_id: 'p2' },
  { card_id: 'c11', profile_id: 'p4' },
];

const card_activity = [
  { id: 'a1', card_id: 'c1', actor_id: 'p2', type: 'created', from_stage_id: null, to_stage_id: 's_agendado', note: null, at: at('2026-11-12', '15:10') },
  { id: 'a2', card_id: 'c1', actor_id: 'p2', type: 'updated', from_stage_id: null, to_stage_id: null, note: 'Local alterado para o escritório do cliente.', at: at('2026-11-16', '09:30') },
  { id: 'a3', card_id: 'c4', actor_id: 'p2', type: 'created', from_stage_id: null, to_stage_id: 's_agendado', note: null, at: at('2026-11-05', '16:00') },
  { id: 'a4', card_id: 'c4', actor_id: 'p2', type: 'stage_changed', from_stage_id: 's_agendado', to_stage_id: 's_emcurso', note: null, at: at('2026-11-18', '09:02') },
  { id: 'a5', card_id: 'c4', actor_id: 'p2', type: 'stage_changed', from_stage_id: 's_emcurso', to_stage_id: 's_concluida', note: null, at: at('2026-11-18', '10:40') },
  { id: 'a6', card_id: 'c4', actor_id: 'p2', type: 'minutes_created', from_stage_id: null, to_stage_id: null, note: null, at: at('2026-11-18', '11:05') },
  { id: 'a7', card_id: 'c4', actor_id: 'p1', type: 'minutes_finalized', from_stage_id: null, to_stage_id: null, note: null, at: at('2026-11-18', '14:20') },
  { id: 'a8', card_id: 'c6', actor_id: 'p2', type: 'created', from_stage_id: null, to_stage_id: 's_agendado', note: null, at: at('2026-11-06', '12:00') },
  { id: 'a9', card_id: 'c6', actor_id: 'p2', type: 'rescheduled', from_stage_id: 's_agendado', to_stage_id: 's_adiada', note: 'Cliente em viagem. Nova data: 24/11 às 08:30.', at: at('2026-11-18', '17:30') },
  { id: 'a10', card_id: 'c7', actor_id: 'p3', type: 'created', from_stage_id: null, to_stage_id: 's_agendado', note: null, at: at('2026-11-09', '09:00') },
  { id: 'a11', card_id: 'c7', actor_id: 'p3', type: 'stage_changed', from_stage_id: 's_agendado', to_stage_id: 's_cancelada', note: 'A administradora pediu para retomar em janeiro.', at: at('2026-11-18', '08:15') },
  { id: 'a12', card_id: 'c5', actor_id: 'p4', type: 'created', from_stage_id: null, to_stage_id: 's_agendado', note: null, at: at('2026-11-03', '10:00') },
  { id: 'a13', card_id: 'c5', actor_id: 'p4', type: 'stage_changed', from_stage_id: 's_agendado', to_stage_id: 's_concluida', note: null, at: at('2026-11-17', '16:05') },
  { id: 'a14', card_id: 'c5', actor_id: 'p4', type: 'minutes_created', from_stage_id: null, to_stage_id: null, note: null, at: at('2026-11-17', '16:30') },
  { id: 'a15', card_id: 'c12', actor_id: 'p2', type: 'created', from_stage_id: null, to_stage_id: 's_agendado', note: null, at: at('2026-11-02', '09:00') },
  { id: 'a16', card_id: 'c12', actor_id: 'p2', type: 'stage_changed', from_stage_id: 's_agendado', to_stage_id: 's_concluida', note: null, at: at('2026-11-12', '12:10') },
  { id: 'a17', card_id: 'c2', actor_id: 'p3', type: 'created', from_stage_id: null, to_stage_id: 's_agendado', note: null, at: at('2026-11-14', '09:20') },
  { id: 'a18', card_id: 'c3', actor_id: 'p1', type: 'created', from_stage_id: null, to_stage_id: 's_agendado', note: null, at: at('2026-11-10', '11:00') },
];

const minutes = [
  {
    id: 'm1', card_id: 'c4', title: 'Kickoff do projeto de loja online', held_at: '2026-11-18', started_at: '09:05', ended_at: '10:30',
    location: 'Sede Nhamacoa Tech, Matola',
    attendees: [
      { name: 'Ivan Mabjaia', org: 'Nhamacoa Tech', role: 'CEO', present: true },
      { name: 'Sónia Macamo', org: 'Nhamacoa Tech', role: 'Gestora de produto', present: true },
      { name: 'Bruno Macuácua', org: 'Kingdom', role: 'Consultor sénior', present: true },
      { name: 'Dário Nhantumbo', org: 'Kingdom', role: 'Marketing', present: false },
    ],
    agenda: [
      { topic: 'Âmbito da fase 1', summary: 'Catálogo com 120 produtos, pagamentos por M-Pesa e cartão, entregas em Maputo e Matola. Integração com o stock fica para a fase 2.' },
      { topic: 'Calendário', summary: 'Arranque a 23/11. Entrega da fase 1 a 27/02/2027. Revisões quinzenais à sexta-feira às 10:00.' },
      { topic: 'Equipa e canais', summary: 'Ponto de contacto no cliente: Sónia Macamo. Grupo de WhatsApp criado. Documentos partilhados na pasta do projeto.' },
    ],
    decisions: [
      { text: 'A fase 1 não inclui integração com o sistema de stock.' },
      { text: 'As revisões são quinzenais, à sexta-feira, 10:00, online.' },
      { text: 'O cliente entrega as fotografias dos produtos até 5/12.' },
    ],
    actions: [
      { what: 'Enviar o plano de projeto detalhado', who: 'Bruno Macuácua', due: '2026-11-21', status: 'pending' },
      { what: 'Partilhar o catálogo de produtos em Excel', who: 'Sónia Macamo (cliente)', due: '2026-11-25', status: 'pending' },
      { what: 'Criar o grupo de WhatsApp do projeto', who: 'Bruno Macuácua', due: '2026-11-18', status: 'done' },
    ],
    next_steps: 'Preparar o ambiente de desenvolvimento e validar o design da página inicial na primeira revisão.',
    next_meeting_at: at('2026-12-04', '10:00'),
    written_by: 'p2', approved_by: 'p1', status: 'final', finalized_at: at('2026-11-18', '14:20'),
    created_at: at('2026-11-18', '11:05'), updated_at: at('2026-11-18', '14:20'),
  },
  {
    id: 'm2', card_id: 'c5', title: 'Revisão do plano de marketing 2027', held_at: '2026-11-17', started_at: '15:00', ended_at: '16:00',
    location: 'Online',
    attendees: [
      { name: 'Dr. Paulo Chissano', org: 'Clínica Bela Vista', role: 'Diretor Clínico', present: true },
      { name: 'Dário Nhantumbo', org: 'Kingdom', role: 'Marketing', present: true },
    ],
    agenda: [
      { topic: 'Orçamento por canal', summary: 'Redistribuir 20% do orçamento de rádio para redes sociais.' },
      { topic: 'Calendário de campanhas', summary: '' },
    ],
    decisions: [],
    actions: [
      { what: 'Enviar a versão revista do plano', who: 'Dário Nhantumbo', due: '2026-11-24', status: 'pending' },
    ],
    next_steps: '',
    next_meeting_at: null,
    written_by: 'p4', approved_by: null, status: 'draft', finalized_at: null,
    created_at: at('2026-11-17', '16:30'), updated_at: at('2026-11-17', '16:45'),
  },
];

// Pipeline templates (what "create_pipeline_from_template" copies). Data, not code.
const pipeline_templates = [
  { kind: 'meetings', name: 'Reuniões', stages: ['Agendado', 'Em curso', 'Adiada', 'Cancelada', 'Concluída'] },
  { kind: 'sales', name: 'Vendas', stages: ['Lead', 'Contactado', 'Proposta', 'Negociação', 'Ganho', 'Perdido'] },
  { kind: 'projects', name: 'Projetos', stages: ['Kickoff', 'Em curso', 'Em revisão', 'Bloqueado', 'Entregue'] },
  { kind: 'campaigns', name: 'Campanhas', stages: ['Ideia', 'Planeamento', 'Em produção', 'No ar', 'Terminada'] },
  { kind: 'tasks', name: 'Tarefas', stages: ['A fazer', 'Em curso', 'Bloqueada', 'Concluída'] },
  { kind: 'custom', name: 'Recrutamento', stages: ['Candidatura', 'Entrevista', 'Proposta', 'Contratado', 'Recusado'] },
];

const DB = { profiles, pipelines, pipeline_stages, cards, card_participants, card_activity, minutes, pipeline_templates };
