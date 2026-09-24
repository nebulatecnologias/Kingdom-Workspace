# Kingdom Members: runbook de suporte

Guia rápido para resolver os pedidos mais comuns dos clientes e responder aos alertas. Tudo se faz na administração: **https://kingdom-members.vercel.app/admin**. Cada ação fica registada em **Atividade** (o sino no topo).

> Regra de ouro: um pagamento só desbloqueia produtos quando o webhook do gateway chega assinado. Nunca é preciso pedir ao cliente que pague outra vez. Primeiro confirme o que aconteceu em **Integrações → Entregas recentes**.

---

## 1. "Paguei mas não recebi nada"

1. Em **Convites**, pesquise pelo email do cliente.
   - **Convite com estado "Enviado" ou "Aberto":** carregue em **Reenviar**. Se o email não chegar (spam, caixa cheia), use **Copiar link** e envie-o por WhatsApp. O link anterior deixa de funcionar.
   - **Convite "Aceite":** o cliente já tem conta. Envie-lhe um link de entrada (ver secção 3).
   - **Sem convite:** continue no passo 2.
2. Em **Integrações → Entregas recentes**, procure a encomenda pela referência (ex.: `KG-…`).
   - **Não aparece:** o gateway ainda não enviou o evento. Confirme no painel do gateway que a encomenda está paga e que a integração está ativa. O gateway volta a tentar sozinho.
   - **"Assinatura rejeitada":** o segredo não coincide. Veja a secção 6.
   - **"Falhou, vai repetir":** o gateway volta a tentar. Se continuar a falhar, fale com o programador.
3. Se o pagamento está confirmado mas o produto não foi entregue (por exemplo, por um produto sem ligação, ver secção 6), dê o acesso à mão:
   - **O cliente ainda não tem conta:** **Novo convite** com o email e os produtos.
   - **O cliente já tem conta:** na ficha do membro, ligue o produto.

## 2. "O link expirou" ou "o link já foi usado"

- **Sem conta ainda:** o próprio cliente pode pedir um novo link em **/access** ("Pedir um novo link"), com o email da compra. Em alternativa, reenvie o convite em **Convites**.
- **Já tem conta:** envie um link de entrada (secção 3).

## 3. O membro não consegue entrar

1. Em **Membros**, pesquise pelo nome ou pelo email e abra a ficha.
2. Veja o estado:
   - **Desativado:** carregue em **Reativar conta**, se fizer sentido.
   - **Ativo:** carregue em **Enviar link de entrada**. O link é válido por 15 minutos e só se usa uma vez.
3. O membro também pode usar **Esqueci-me da palavra-passe** no ecrã de entrada.

## 4. O cliente usou o email errado

- **No checkout, antes de criar conta:** crie um **Novo convite** para o email certo com os mesmos produtos e revogue o convite do email errado.
- **Já com conta:** na ficha do membro, **Mudar email**. A conta, a palavra-passe e todos os acessos passam para o novo email. As compras que já existiam no novo email também ficam ligadas. A partir daí o membro entra com o email novo.

## 5. Dar ou retirar acesso à mão

- **Dar a quem já tem conta:** na ficha do membro, ligue o interruptor do produto. O acesso é imediato.
- **Dar a quem ainda não tem conta:** **Novo convite** com os produtos. Se o email já tiver conta, os produtos entram logo na biblioteca e o cliente recebe o email "novo na sua biblioteca".
- **Retirar** (por exemplo, um reembolso feito fora do gateway): na ficha do membro, desligue o interruptor. Os reembolsos feitos no gateway retiram o acesso sozinhos.

## 6. Alertas automáticos

Os administradores recebem um email, no máximo um por tipo e por hora, quando:

| Alerta | O que significa | O que fazer |
|---|---|---|
| **Uma encomenda paga tem um produto sem ligação** | O cliente pagou um produto cujo "ID do produto no gateway" não está em nenhum produto. **O cliente não recebeu esse produto.** | Em **Vitrine**, abra o produto → **Venda e acesso** e preencha o ID do gateway. Depois dê o produto ao cliente (secção 5). |
| **Não foi possível processar um evento de pagamento** | Um evento chegou mas deu erro. O gateway vai repetir. | Veja **Integrações → Entregas recentes**. Se o erro se repetir, fale com o programador e indique o ID do evento. |
| **Resumo diário** | Nas últimas 24 horas houve eventos com erro, assinaturas rejeitadas, emails que falharam todas as tentativas, ou produtos sem ligação. | Siga a linha correspondente desta tabela. Para **assinaturas rejeitadas**: se rodou o segredo no gateway, cole o novo em **Integrações → Segredo de assinatura** (o anterior continua aceite durante 24 horas). Para **emails que falharam**: reenvie o convite ou envie um link de entrada. |

O mesmo resumo aparece no topo da **Visão geral**, com o título "Precisa da sua atenção".

## 7. Verificação em dois passos (administradores)

- **Ativar:** menu **Verificação em dois passos** → **Ativar**, e leia o código QR com uma app autenticadora (Google Authenticator, Microsoft Authenticator, 1Password).
- **Um admin perdeu o telemóvel:** outro admin abre a ficha desse membro e carrega em **Repor verificação em dois passos**.
- **O único admin perdeu o telemóvel:** no painel do Supabase, **Authentication → Users**, apague o fator (MFA) desse utilizador.

## 8. Pedidos de privacidade (POPIA)

- **"Quero os meus dados":** o membro descarrega-os em **Perfil → Descarregar os meus dados**.
- **"Apaguem a minha conta":** o membro apaga-a em **Perfil → Apagar a minha conta**. O perfil, os acessos, o progresso, os convites e o histórico de emails são apagados. As encomendas ficam, sem ligação à conta, por obrigação fiscal.
- Se o membro não conseguir fazê-lo sozinho, apague o utilizador no painel do Supabase (**Authentication → Users → Delete user**) e registe o pedido.

## 9. Monitorização

- **Estado do site:** `https://kingdom-members.vercel.app/api/health` responde `{"ok":true}` quando a app e a base de dados estão bem. Registe este endereço num monitor gratuito, como UptimeRobot ou Better Stack, com verificação de 5 em 5 minutos e alerta por email ou WhatsApp.
- **Registos:**
  - **Vercel:** projeto `kingdom-members` → Logs, para erros do servidor.
  - **Supabase:** projeto `inaxsnghgzfaarjsbljh` → Logs, para a base de dados e a autenticação.
  - **Resend:** Emails, para confirmar se um email foi entregue.
- **Tarefas diárias automáticas:**
  - 01:00 UTC: expirar convites;
  - 06:30 UTC: repetir emails que falharam e enviar o resumo diário.

## 10. Contactos para o cliente

Apoio: o email e o WhatsApp configurados em `SUPPORT_EMAIL` e `SUPPORT_WHATSAPP`, que aparecem na página **Ajuda** da área de membros.
