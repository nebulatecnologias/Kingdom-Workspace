# Kingdom Library: runbook de suporte

Guia rápido para resolver os pedidos mais comuns dos clientes e responder aos alertas. Tudo se faz na administração: **https://library.kingdomcompny.com/admin**. Cada ação fica registada em **Atividade** (o sino no topo).

> Regra de ouro: um pagamento só desbloqueia produtos quando o webhook do gateway chega assinado. Nunca é preciso pedir ao cliente que pague outra vez. Primeiro confirme o que aconteceu em **Integrações → Entregas recentes**.

---

## 1. "Paguei mas não recebi nada"

1. Em **Convites**, pesquise pelo email do cliente.
   - **Convite com estado "Enviado" ou "Aberto":** carregue em **Reenviar**. Se o email não chegar (spam, caixa cheia), use **Copiar link** e envie-o por WhatsApp. O link anterior deixa de funcionar.
   - **Convite "Aceite":** o cliente já tem conta. Envie-lhe um link de entrada (ver secção 3).
   - **Sem convite:** continue no passo 2.
2. Em **Integrações → Entregas recentes**, procure a encomenda pela referência (ex.: `KG-…`).
   - **Não aparece:** o gateway ainda não enviou o evento. Confirme no painel do gateway que a encomenda está paga e que a integração está ativa. O gateway volta a tentar sozinho.
   - **"Assinatura rejeitada":** o segredo não coincide. Veja a secção 7.
   - **"Falhou, vai repetir":** o gateway volta a tentar. Se continuar a falhar, fale com o programador.
3. Se o pagamento está confirmado mas o produto não foi entregue (por exemplo, por um produto sem ligação, ver secção 7), dê o acesso à mão:
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

### Pedido de reembolso
A política pública está em **/legal/refunds**: reembolso até **7 dias** depois da compra, pedido por email.

1. Confirme a data da compra: em **Membros**, abra a ficha do cliente e veja as encomendas, ou procure a referência na pesquisa do topo.
2. **Dentro dos 7 dias:** faça o reembolso no painel do gateway. O acesso a essa compra sai da biblioteca sozinho, incluindo todos os materiais de um kit. Responda ao cliente a confirmar.
3. **Depois dos 7 dias:** a compra é final, salvo se a lei exigir outra coisa. Se o problema for um ficheiro que não abre, ajude o cliente: reenvie um link de entrada ou substitua o ficheiro em **Materiais**.

## 6. Kits e materiais

- **Criar um kit:** **Novo produto** → tipo **Kit**. Em **Materiais**, arraste todos os ficheiros de uma vez: PDF, EPUB, imagens (PNG, JPG, WebP), áudio (MP3, M4A) ou ZIP, até 50 MB cada. Antes de carregar, escolha o idioma dos ficheiros ("Todos os idiomas" para áudios e imagens que servem a todos).
- **Títulos, ordem e idioma:** edite na lista e carregue em **Guardar alterações**. As setas mudam a ordem logo.
- **"Descarregar tudo":** carregue um ZIP com o kit completo. Passa a ser o botão principal da página do kit.
- **Um áudio com mais de 50 MB:** exporte-o em MP3 a 64 kbps mono (voz), que dá cerca de 100 minutos em 50 MB. Ou divida-o em partes.
- **"Comprei o kit mas falta um material":** confirme em **Materiais** que o ficheiro está lá e no idioma certo. Um cliente em português vê os materiais em "Todos os idiomas" e os de "Português"; se não houver nenhum em português, vê os de inglês.
- **O cliente comprou o kit:** tudo abre de uma vez. Um reembolso fecha tudo. Para dar o kit à mão, ligue o produto na ficha do membro (secção 5).

## 7. Alertas automáticos

Os administradores recebem um email, no máximo um por tipo e por hora, quando:

| Alerta | O que significa | O que fazer |
|---|---|---|
| **Uma encomenda paga tem um produto sem ligação** | O cliente pagou um produto cujo "ID do produto no gateway" não está em nenhum produto. **O cliente não recebeu esse produto.** | Em **Vitrine**, abra o produto → **Venda e acesso** e preencha o ID do gateway. Depois dê o produto ao cliente (secção 5). |
| **Não foi possível processar um evento de pagamento** | Um evento chegou mas deu erro. O gateway vai repetir. | Veja **Integrações → Entregas recentes**. Se o erro se repetir, fale com o programador e indique o ID do evento. |
| **Resumo diário** | Nas últimas 24 horas houve eventos com erro, assinaturas rejeitadas, emails que falharam todas as tentativas, ou produtos sem ligação. | Siga a linha correspondente desta tabela. Para **assinaturas rejeitadas**: se rodou o segredo no gateway, cole o novo em **Integrações → Segredo de assinatura** (o anterior continua aceite durante 24 horas). Para **emails que falharam**: reenvie o convite ou envie um link de entrada. |

O mesmo resumo aparece no topo da **Visão geral**, com o título "Precisa da sua atenção".

## 8. Verificação em dois passos (administradores)

- **Ativar:** menu **Verificação em dois passos** → **Ativar**, e leia o código QR com uma app autenticadora (Google Authenticator, Microsoft Authenticator, 1Password).
- **Um admin perdeu o telemóvel:** outro admin abre a ficha desse membro e carrega em **Repor verificação em dois passos**.
- **O único admin perdeu o telemóvel:** no painel do Supabase, **Authentication → Users**, apague o fator (MFA) desse utilizador.

## 9. Pedidos de privacidade (POPIA)

- **"Quero os meus dados":** o membro descarrega-os em **Perfil → Descarregar os meus dados**.
- **"Apaguem a minha conta":** o membro apaga-a em **Perfil → Apagar a minha conta**. O perfil, os acessos, o progresso, os convites e o histórico de emails são apagados. As encomendas ficam, sem ligação à conta, por obrigação fiscal.
- Se o membro não conseguir fazê-lo sozinho, apague o utilizador no painel do Supabase (**Authentication → Users → Delete user**) e registe o pedido.

## 10. Monitorização

- **Estado do site:** o **Better Stack** (plano gratuito) verifica `https://library.kingdomcompny.com/api/health` de 3 em 3 minutos. O endereço responde `{"ok":true}` quando a app e a base de dados estão bem.
  - **Alerta "down":** a app ou a base de dados não respondem. Abra os registos da Vercel e do Supabase (abaixo). No Supabase, confirme que o projeto não está pausado: no plano gratuito, um projeto sem atividade durante cerca de uma semana é pausado, e as verificações do monitor servem também para o manter ativo. Se estiver pausado, carregue em **Restore project**.
  - **Alerta "up":** o site voltou a responder. Não é preciso fazer nada.
- **Registos:**
  - **Vercel:** projeto `kingdom-members` → Logs, para erros do servidor.
  - **Supabase:** projeto `inaxsnghgzfaarjsbljh` → Logs, para a base de dados e a autenticação.
  - **Resend:** Emails, para confirmar se um email foi entregue.
- **Tarefas diárias automáticas:**
  - 01:00 UTC: expirar convites;
  - 06:30 UTC: repetir emails que falharam e enviar o resumo diário.

## 11. Contactos para o cliente

Apoio: o email e o WhatsApp configurados em `SUPPORT_EMAIL` e `SUPPORT_WHATSAPP`, que aparecem na página **Ajuda** da área de membros.
