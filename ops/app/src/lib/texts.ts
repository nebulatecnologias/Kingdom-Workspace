// pt-PT copy, taken verbatim from the prototype (ops/prototype/src/app.js, object T).
export const T = {
  app: 'Kingdom Ops',
  nav: { home: 'Início', agenda: 'Agenda', pipelines: 'Pipelines', pipeline: 'Pipeline', minutes: 'Atas', team: 'Equipa', settings: 'Definições', logout: 'Sair' },
  greet: { morning: 'Bom dia', afternoon: 'Boa tarde', evening: 'Boa noite' },
  next: { title: 'A seguir', none: 'Sem mais reuniões hoje', team: 'Próxima da equipa', now: 'a decorrer', in: 'em', tomorrow: 'Amanhã' },
  today: 'Hoje', week: 'Esta semana', restOfWeek: 'Resto da semana', operation: 'Operação', all: 'Todos',
  periods: { morning: 'Manhã', afternoon: 'Tarde', evening: 'Noite' },
  actions: { newMeeting: 'Nova reunião', newCard: { meetings: 'Nova reunião', sales: 'Nova oportunidade', projects: 'Novo projeto', campaigns: 'Nova campanha', tasks: 'Nova tarefa', custom: 'Novo cartão' }, move: 'Mover para', edit: 'Editar', save: 'Guardar', cancel: 'Cancelar', back: 'Voltar', open: 'Abrir', create: 'Criar', print: 'Imprimir / PDF', confirm: 'Confirmar', add: 'Adicionar', remove: 'Remover', seeAll: 'Ver tudo', today: 'Hoje', filter: 'Filtrar', createMinutes: 'Criar ata', openMinutes: 'Abrir ata', saveDraft: 'Guardar rascunho', finalize: 'Marcar como final', conclude: 'Concluir reunião', login: 'Entrar', forgot: 'Esqueci a palavra-passe', invite: 'Convidar membro', addStage: 'Adicionar etapa', newPipeline: 'Novo pipeline a partir de modelo' },
  minutes: { title: 'Atas', one: 'Ata', draft: 'Rascunho', final: 'Final', missing: 'Atas em falta', missingHint: 'Reuniões concluídas sem ata final', none: 'Nenhuma ata ainda', noneHint: 'As atas nascem a partir de uma reunião. Abra a reunião e toque em "Criar ata".', noMinutes: 'Ainda sem ata', noMinutesHint: 'Normalmente escreve-se logo a seguir à reunião. Fica pré-preenchida com os dados desta reunião.', writtenBy: 'Redigida por', approvedBy: 'Aprovada por', sections: { meeting: 'Reunião', attendees: 'Participantes', agenda: 'Ordem de trabalhos', decisions: 'Decisões', actions: 'Ações', next: 'Próximos passos', close: 'Fecho' }, chooseMeeting: 'A que reunião pertence esta ata?', chooseHint: 'Cada ata está ligada a uma reunião. Escolha a reunião para pré-preencher a ata.' },
  stageRules: { note: 'pede motivo', reschedule: 'pede nova data' },
  empty: { agenda: 'Nada marcado', agendaHint: 'Toque em + para marcar uma reunião neste dia.', stage: 'Sem cartões nesta etapa', pipeline: 'Nada aqui ainda', pipelineHint: 'Arraste cartões para esta etapa ou crie um novo.' },
  form: { required: 'Campo obrigatório', saved: 'Guardado', created: 'Criado' },
  toast: { moved: 'Movido para', minutesSaved: 'Rascunho guardado', minutesFinal: 'Ata marcada como final', concludeAsk: 'Concluir a reunião também?', phase2: 'Fica para a fase 2', pipelineCreated: 'Pipeline criado a partir do modelo', stagesSaved: 'Etapas guardadas' },
  kind: { meetings: 'Reunião', sales: 'Oportunidade', projects: 'Projeto', campaigns: 'Campanha', tasks: 'Tarefa', custom: 'Cartão' },
  location: { in_person: 'Presencial', online: 'Online', phone: 'Chamada' },
} as const;

export type Kind = keyof typeof T.kind;
