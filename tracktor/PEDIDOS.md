# Pedidos às plataformas — passo 0.1 do Tracktor

> Preparado a 29/09/2026 para o Shelton. Os pedidos são feitos na conta da empresa; nenhum
> se faz por aqui. A documentação oficial da Meta e do TikTok estava bloqueada na rede
> desta sessão: os requisitos vêm de guias publicados em 2026 (lista no fim). **Confirme
> cada formulário no ecrã da própria plataforma ao submeter.**

A ordem importa. A verificação da empresa na Meta é o que mais demora e é pré-requisito
de quase tudo, por isso é a primeira. O resto dos pedidos corre em paralelo.

---

## 0 · Antes de começar: os dados têm de bater em todo o lado

A causa mais comum de recusa é o nome, a morada ou o telefone escritos de maneira
diferente no formulário e no documento. Escolha **uma** versão e use-a sempre.

| Dado | Como vai ficar (preencher) | Onde tem de aparecer igual |
|---|---|---|
| Nome legal da empresa | ______________________ | registo comercial, NUIT, Business Manager, app da Meta, app do TikTok |
| Morada | ______________________ | documento enviado, Business Manager |
| Telefone da empresa | ______________________ | Business Manager (pode receber a chamada ou o SMS de verificação) |
| Site | `https://kingdomcompny.com` | Business Manager, apps |
| Email no domínio | ____@kingdomcompny.com | para receber o código de verificação |

**Que empresa verificar.** A Kingdom tem duas entidades (Moçambique e África do Sul). A
Kingdom Training vende em Moçambique, por isso proponho verificar **a entidade de
Moçambique**. A da África do Sul pode ter o seu portfólio mais tarde.

---

## 1 · Meta: portfólio empresarial e verificação da empresa — **Shelton, hoje**

Em business.facebook.com → Definições → Centro de segurança → Verificação da empresa.

- [ ] Confirmar que existe **um só** portfólio empresarial (Business Manager) da Kingdom, e que o Shelton é administrador
- [ ] Preencher os dados da secção 0, exactamente como estão no documento
- [ ] Juntar **um documento com o nome legal** (a conta da luz não serve para isto):
  - certidão do registo comercial, ou a publicação no Boletim da República, **ou**
  - documento fiscal emitido pela Autoridade Tributária com o NUIT (não serve uma declaração preenchida pela própria empresa)
- [ ] Se a morada ou o telefone não estiverem nesse documento, juntar outro que os tenha: extracto bancário da empresa ou factura de água ou luz
- [ ] Documentos a cores, inteiros, sem cortes, dentro da validade
- [ ] Escolher o método de confirmação: email no domínio (o mais simples), telefone, SMS ou WhatsApp
- [ ] Opcional mas útil: verificar o domínio `kingdomcompny.com` no Business Manager (Segurança da marca → Domínios). Eu preparo o registo DNS se for este o caminho

**Espera:** de minutos a cerca de 14 dias úteis.

---

## 2 · Meta: os activos no portfólio — **Shelton, esta semana**

- [ ] A Página de Facebook da **Kingdom Training** e a da **Kingdom Advising** dentro do portfólio
- [ ] **@kingdom.training** e **@kingdom.library** em conta **profissional** (Empresa), cada uma **ligada à Página certa**. Sem esta ligação o Instagram não publica nem recebe mensagens pela API
- [ ] No Instagram de cada conta: Definições → Mensagens → **permitir o acesso às mensagens** por ferramentas ligadas
- [ ] As contas de anúncios da Meta dentro do portfólio (serve a fase 5, mas convém já)
- [ ] A equipa que vai usar o Tracktor com papel no portfólio

---

## 3 · Meta: criar a app — **Shelton, depois de pedir a verificação**

Em developers.facebook.com → As minhas apps → Criar app → tipo **Empresa**, ligada ao
portfólio da secção 1.

| Campo | O que pôr |
|---|---|
| Nome da app | Kingdom Tracktor |
| Email de contacto | o email de apoio do Tracktor (decisão de 25/09: cada aplicação tem o seu) |
| Ícone | 1024 × 1024, o logo em fundo azul (`marca/tracktor-fundo-azul.png`) |
| Política de privacidade | `https://tracktor.kingdomcompny.com/privacidade` (eu preparo, secção 4) |
| Termos | `https://tracktor.kingdomcompny.com/termos` (eu preparo) |
| Apagamento de dados | o endereço de pedido de apagamento (eu preparo) |
| Domínio da app | `tracktor.kingdomcompny.com` |

- [ ] Produtos a juntar: **Facebook Login for Business**, **Webhooks**, **Messenger**, **Instagram**, **WhatsApp**
- [ ] Dar o papel de **Programador** a quem vai construir, e de **Testador** às pessoas da equipa que vão testar
- [ ] **O segredo da app nunca vai por chat nem por email.** Copia-se directamente para os segredos do Supabase quando chegar o passo 0.4; eu digo o nome exacto de cada segredo

**As permissões, por fase.** Pedem-se na revisão (secção 5), mas a app nasce já a saber
de que vai precisar. Todas pela via «Facebook Login», porque o Instagram está ligado às
Páginas e o WhatsApp vive no mesmo portfólio.

| Para quê | Permissões | Fase |
|---|---|---|
| Ver as Páginas e o portfólio | `pages_show_list`, `business_management` | 1 |
| Publicar no Facebook | `pages_manage_posts`, `pages_read_engagement` | 1 |
| Publicar no Instagram | `instagram_basic`, `instagram_content_publish` | 1 |
| Resultados das publicações | `read_insights`, `instagram_manage_insights` | 1 |
| Messenger | `pages_messaging`, `pages_manage_metadata` | 2 |
| Mensagens diretas do Instagram | `instagram_manage_messages` | 2 |
| Comentários (ler e responder) | `instagram_manage_comments`, `pages_read_user_content`, `pages_manage_engagement` | 2 |
| Responder até 7 dias (etiqueta «agente humano») | a funcionalidade *Human Agent* | 2 |
| WhatsApp | `whatsapp_business_management`, `whatsapp_business_messaging` | 2 |
| Leads dos anúncios | `leads_retrieval` | 3 |
| Gasto dos anúncios | `ads_read` | 5 |

**Sem revisão, já dá para trabalhar.** Com acesso normal, a app funciona com as contas de
quem tem papel nela. Constrói-se e prova-se tudo assim. A revisão é o que deixa a caixa
receber mensagens de qualquer pessoa, e a outras empresas usarem o Tracktor.

---

## 4 · O que eu preparo — **antes da revisão da Meta e do TikTok**

As duas plataformas abrem estes endereços durante a revisão, e recusam se não
responderem.

- [ ] **Política de privacidade** em `tracktor.kingdomcompny.com/privacidade`: que dados das redes se guardam, para quê, por quanto tempo, com quem se partilham (Payflow, Dashboard), e como pedir o apagamento
- [ ] **Termos de utilização** em `/termos`
- [ ] **Apagamento de dados**: a página com as instruções (o que se apaga e em quanto tempo, não só «envie-nos um email») **e** o endereço que a Meta chama, que responde em JSON com o link de acompanhamento e o código de confirmação
- [ ] O ícone da app nos tamanhos pedidos

O texto da política e dos termos passa pelo Shelton antes de ir para o ar.

---

## 5 · Revisão da app da Meta — **mais tarde, quando o 1.3 e o 2.1 estiverem prontos**

Não se submete agora: a Meta pede um vídeo de cada permissão **a funcionar de verdade**.

- [ ] A verificação da empresa já aprovada (pedir a revisão antes disso é causa de recusa)
- [ ] Um vídeo por permissão, com o caminho inteiro: entrar, ligar a conta, usar a função. Nas mensagens, o vídeo tem de mostrar uma mensagem real a chegar e a ser respondida pelo Tracktor
- [ ] Pedir juntas as permissões que dependem umas das outras (por exemplo, `instagram_basic` com `instagram_manage_messages`)
- [ ] Dizer, na caixa de conversas, que há sempre uma pessoa a responder (é o que justifica a etiqueta «agente humano»)
- [ ] Um utilizador de teste para quem revê, com instruções passo a passo

---

## 6 · TikTok — **Shelton, esta semana**

### 6a. Conta e app no TikTok for Developers

- [ ] Passar **@kingdomtraining** a **conta de empresa** (Business Account) na app do TikTok
- [ ] Criar a conta em developers.tiktok.com como **organização** (Kingdom), com o email do domínio
- [ ] Criar a app **Kingdom Tracktor**: ícone, descrição, os endereços de termos e privacidade da secção 4, plataforma Web
- [ ] Produtos: **Login Kit** e **Content Posting API**, com o **Direct Post** ligado
- [ ] Escopos: `user.info.basic`, `video.upload`, `video.publish`
- [ ] Verificar o domínio de onde o TikTok vai buscar os vídeos (eu digo qual, no passo 1.1). Sem isto, o vídeo tem de ser carregado em ficheiro
- [ ] Submeter a app à revisão inicial, para ficar activa

### 6b. Auditoria do Direct Post — **mais tarde, quando o 1.6 estiver provado**

**Até lá, o que a app pode fazer:**
- publicar só em **contas privadas**, e só como **«só eu»**;
- até **5 contas** a publicar por dia;
- **enviar como rascunho** para a app do TikTok, onde a pessoa acaba de publicar. Esta via **não depende da auditoria**, e é por ela que o Tracktor publica no TikTok até a auditoria sair.

**O que a auditoria vê:** o ecrã de publicação tem de seguir as regras de partilha do
TikTok. Mostra quem vai publicar, deixa escolher a privacidade (sem valor por defeito) e
os comentários, duetos e stitch, e pede para indicar conteúdo comercial. Eu construo o
passo 1.6 já assim, e grava-se o vídeo para a auditoria.

### 6c. Comentários (fase 2)

Os comentários passam pela **TikTok API for Business** (business-api.tiktok.com), que é
outra conta de programador. Aí existem endpoints para ler e responder a comentários da
conta de empresa e a menções. Pedir o acesso quando a fase 2 começar, e confirmar então que
cobrem os vídeos orgânicos e não só os anúncios. Mensagens diretas do TikTok: não há acesso
aberto, fica fora.

---

## 7 · WhatsApp — **só preparar; o número decide-se antes do 2.2**

- [ ] Nada a pedir já. A conta de WhatsApp Business nasce dentro do portfólio da secção 1, quando o número estiver escolhido
- [ ] Nome de exibição: o da unidade (Kingdom Training), igual ao da Página
- [ ] Um método de pagamento no portfólio, para as mensagens-modelo (são pagas por mensagem)

**Para a decisão do número:** a Meta passou a permitir usar **o mesmo número na app
WhatsApp Business e na API ao mesmo tempo** («coexistência»). Em 2026 está anunciada em
todos os países, mas a Meta confirma número a número ao ligar. Exige a app WhatsApp
Business actualizada, e que seja aberta pelo menos uma vez a cada 13 dias. Assim o número
actual pode ficar, sem sair do telemóvel da equipa.

---

## Calendário

| Pedido | Quem | Quando | Espera |
|---|---|---|---|
| 1 · Verificação da empresa | Shelton | hoje | minutos a ~14 dias úteis |
| 2 · Activos no portfólio | Shelton | esta semana | — |
| 3 · App da Meta | Shelton | depois do 1 | — |
| 6a · Conta de empresa e app no TikTok | Shelton | esta semana | revisão inicial da app |
| 4 · Privacidade, termos, apagamento | eu | no passo 0.2 | — |
| 5 · Revisão da app da Meta | os dois | depois do 1.3 e do 2.1 | dias a semanas |
| 6b · Auditoria do Direct Post | os dois | depois do 1.6 | semanas |
| 6c · TikTok API for Business | Shelton | início da fase 2 | — |
| 7 · Conta do WhatsApp | Shelton | antes do 2.2 | — |

Quando cada pedido for submetido, a data entra no registo do `PLANO.md`.

---

## Fontes

A documentação oficial (developers.facebook.com, developers.tiktok.com) estava bloqueada
na rede desta sessão, e as páginas abaixo foram lidas **pelos resultados da pesquisa, não
abertas**. Servem de ponto de partida; o que vale é o que a plataforma mostrar ao submeter.

- Documentos da verificação da Meta: [saveoffice.io](https://saveoffice.io/blog/meta-business-verification-documents), [Wati](https://support.wati.io/en/articles/11463208-meta-business-verification-required-documents-by-country), [360dialog](https://docs.360dialog.com/docs/resources/meta-business-verification)
- Revisão da app e apagamento de dados: [singhamandeep.com](https://singhamandeep.com/facebook-data-deletion-callback-url/), [App Club](https://landing.app-club.org/data-deletion-instructions-facebook)
- Publicação no Instagram e limites: [Postproxy](https://postproxy.dev/blog/social-media-platform-api-rules-rate-limits-media-specs/), [zernio.com](https://zernio.com/blog/instagram-graph-api)
- Mensagens do Instagram e agente humano: [singhamandeep.com](https://singhamandeep.com/instagram-messaging-api-approval-getting-instagram_business_manage_messages-2026/), [Mark360](https://mark360.ai/blog/instagram-messaging-api-rules-limits-2026)
- TikTok, Direct Post e auditoria: [Content Sharing Guidelines](https://developers.tiktok.com/docs/en/content-sharing-guidelines), [Direct Post](https://developers.tiktok.com/docs/en/content-posting-api-reference-direct-post), [Outstand](https://www.outstand.so/blog/tiktok-content-posting-api)
- TikTok, comentários: [TikTok API for Business — responder a um comentário](https://business-api.tiktok.com/portal/docs/reply-to-a-comment/v1.3)
- Coexistência no WhatsApp: [360dialog](https://docs.360dialog.com/docs/resources/phone-numbers/coexistence), [ChakraHQ](https://chakrahq.com/article/whatsapp-coexistence-live-eu-uk-europe-whatsapp-business-for-api-live/)
