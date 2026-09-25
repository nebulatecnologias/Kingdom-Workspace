# Kingdom Tracktor — protótipo

Protótipo navegável da plataforma de marketing da Kingdom: agendamento de
publicações, campanhas, métricas e UTM, conversas de todos os canais, leads com
qualificação, e formulários. Abre-se `index.html` no browser; não precisa de
compilação. **Todos os nomes e números são exemplos.**

## Ecrãs

| Ecrã | O que mostra |
|---|---|
| Visão geral | Receita atribuída, leads, oportunidades, vendas, custo por lead, retorno, leads por dia e por origem, funil do alcance à venda |
| Publicações | Calendário semanal e mensal, compositor com pré-visualização por rede e UTM automático, aprovações, melhores horários |
| Campanhas | Orçamento e gasto, leads, vendas e retorno por campanha; detalhe com gráficos diários, conteúdos (`utm_content`) e links |
| Métricas | Crescimento por rede, conversão por fonte, modelos de atribuição, tabela UTM e criador de links |
| Conversas | Caixa única: Instagram, Messenger, WhatsApp, LinkedIn e comentários do TikTok, com a ficha do lead ao lado |
| Leads | Lista e quadro por estado, score de 0 a 100 explicado, envio para o pipeline do Payflow; critérios e automações de qualificação |
| Formulários | O formulário de aplicação que hoje está no Payflow, com pontos por resposta, links por canal e pré-visualização no telemóvel |
| Integrações | Fluxo de dados Fontes → Tracktor → Payflow → Dashboard Kingdom, estado de cada ligação e registo de eventos |
| Design system | Cores, tipografia, cantos, componentes e regras (ver `DESIGN.md`) |

## Como liga ao resto

- **Payflow**: o Tracktor envia `lead.opportunity_created` quando um lead
  qualificado vira oportunidade (entra no pipeline na etapa escolhida, por
  defeito «Qualificado»). O Payflow devolve `deal.stage_changed`,
  `order.paid` e `order.refunded`: é assim que a venda fica atribuída à
  campanha e ao UTM de origem.
- **Dashboard Kingdom**: recebe todos os dias às 06:00 um resumo por unidade
  (`metrics.daily`).
- **Unidades**: Kingdom Training, InCompany, Advising e Library na primeira
  fase; «Adicionar negócio» fica para a segunda.

## Marca

`marca/tracktor-fundo-azul.png` e `marca/tracktor-fundo-branco.png` são os
ficheiros originais do logo. No protótipo o símbolo é redesenhado em SVG para
ficar nítido em qualquer tamanho.
