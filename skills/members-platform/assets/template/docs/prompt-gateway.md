# Prompt para o gateway: API de integração e webhooks (v2, alinhado com a Kingdom Library em produção)

Copiar tudo abaixo da linha e colar na sessão do agente que desenvolve o gateway. Este documento fixa o contrato que a Kingdom Library já implementa em produção e acrescenta os padrões de mercado para outros sistemas.

---

# Contexto

Estás a trabalhar no meu gateway de pagamentos (este repositório). Por baixo usa o **Paystack** (mercado principal: África do Sul, ZAR). Por cima, o gateway tem de falar com outros sistemas de duas formas:

1. **Webhooks de saída**: o gateway avisa as aplicações ligadas quando um pedido é pago, reembolsado ou disputado.
2. **API REST pública**: outras aplicações criam checkouts, consultam pedidos, fazem reembolsos e gerem os seus webhooks.

**O primeiro cliente já existe e está em produção: a Kingdom Library** (`https://library.kingdomcompny.com`), a área de membros onde se vendem produtos digitais cristãos. Ela já recebe e valida os webhooks descritos na secção "Contrato com a Kingdom Library". **Esse contrato é fixo:** os nomes de campos, os cabeçalhos e a assinatura têm de coincidir exatamente, ou os clientes deixam de receber o acesso depois de pagar.

Os próximos clientes serão sistemas de empresas maiores (ERP, CRM, contabilidade, automação como Zapier/Make, lojas). Por isso a API e os webhooks seguem os padrões que essas equipas já conhecem: Stripe como referência de estilo, **Standard Webhooks** para assinaturas, **OpenAPI 3.1** para a documentação da API e **RFC 9457** para erros.

# Antes de escrever código

- Explora o repositório: stack, pastas, ORM e migrações, autenticação do painel, filas/jobs/cron, testes e convenções. Segue essas convenções.
- Lê o que já existe da integração com o Paystack e da aba "Integrações". Diz-me o que já está feito e o que falta face a este documento.
- Confirma na documentação oficial atual do Paystack (https://paystack.com/docs) os endpoints e os nomes dos eventos. Não confies só na memória.
- Apresenta um plano curto (tabelas, rotas, ecrãs, ordem de entrega) e **espera pela minha aprovação** antes de implementar.
- Se algo for ambíguo, pergunta. Não alteres nada do "Contrato com a Kingdom Library" sem me perguntar.

# Princípios (valem para a API e para os webhooks)

- **IDs** opacos, estáveis e com prefixo: `ord_`, `evt_`, `prod_`, `cus_`, `cs_` (checkout session), `re_` (reembolso), `we_` (webhook endpoint). Um ID nunca é reutilizado.
- **Dinheiro** em inteiros na unidade mínima (cêntimos): R149,00 = `14900`. Moeda em ISO 4217 (`"ZAR"`). Nunca usar números decimais.
- **Datas** em ISO 8601, UTC, com `Z` (`2026-09-23T10:15:00Z`). A única exceção são os segundos Unix da assinatura.
- **JSON** em UTF-8 e `snake_case`. Acrescentar campos novos não é uma alteração incompatível; renomear ou remover é.
- **Versões por data** (`api_version: "2026-09-01"`). Cada integração fica presa à versão com que foi criada. Uma alteração incompatível exige uma versão nova e aviso prévio, com os cabeçalhos `Deprecation` e `Sunset`.
- **Test e live completamente separados:** chaves `sk_test_…`/`sk_live_…`, o campo `livemode` em todos os objetos e eventos, e dados que nunca se misturam nos relatórios.
- **Nunca tocar em dados de cartão.** O pagamento acontece no checkout do Paystack. Os segredos ficam em variáveis de ambiente ou num cofre, nunca no código nem nos logs.

# Parte 1: Paystack (resumo; o detalhe está no prompt anterior)

- `POST /transaction/initialize` com `amount` em cêntimos, `currency: "ZAR"`, uma `reference` nossa, `callback_url` e `metadata` com `order_id`, `product_ids`, `locale` e `member_user_id`.
- Webhook de entrada `POST /webhooks/paystack`:
  - validar `x-paystack-signature`, que é um HMAC-SHA512 do corpo **cru**, comparado em tempo constante;
  - responder 200 depressa e processar de forma assíncrona;
  - deduplicar;
  - confirmar com `GET /transaction/verify/:reference` que o `status`, o montante e a moeda coincidem antes de marcar o pedido como pago.
- Correspondência entre eventos do Paystack e eventos do gateway (confirma os nomes na documentação):

| Paystack | Gateway (saída) | Notas |
|---|---|---|
| `charge.success` (depois do verify) | `order.paid` | |
| `refund.processed` | `order.refunded` | Um evento por cada reembolso, parcial ou total. |
| `charge.dispute.create` | `order.disputed` | |
| `charge.dispute.resolve` | `order.dispute_resolved` | `outcome: "won"` quando a disputa é decidida a nosso favor; `"lost"` quando o dinheiro volta ao cliente. |

- Estados do pedido: `pending → paid → partially_refunded | refunded | disputed → dispute_won | dispute_lost`. Transições inválidas ficam registadas no log e são ignoradas.
- O redirect do browser nunca liberta nada. A fonte da verdade é o webhook confirmado.
- **O gateway envia o recibo de pagamento.** Não envia emails de acesso: esses são da Kingdom Library.

# Parte 2: webhooks de saída

## Envelope (igual para todos os eventos)

```json
{
  "id": "evt_01JABCXYZ",
  "type": "order.paid",
  "api_version": "2026-09-01",
  "created_at": "2026-09-23T10:15:00Z",
  "livemode": true,
  "data": { }
}
```

- `id` é único por evento e **igual em todas as tentativas de entrega do mesmo evento**. Os receptores deduplicam por ele.
- `livemode` é **obrigatório** e tem de ser verdadeiro: se faltar, a Kingdom Library assume `true`.

## Eventos v1

| Tipo | Quando | Campos específicos |
|---|---|---|
| `order.paid` | Pagamento confirmado pelo verify | `data.order.status = "paid"`, `paid_at` |
| `order.refunded` | Cada reembolso, parcial ou total | `data.order.refunded_amount` (**acumulado**), `data.order.full_refund` (`true` / `false`) |
| `order.disputed` | Disputa aberta | `data.dispute { id, reason, amount, opened_at }` |
| `order.dispute_resolved` | Disputa fechada | `data.outcome: "won" \| "lost"` (**obrigatório**) e `data.dispute { id, closed_at }` |
| `integration.test` | Botão "Enviar evento de teste" | `data.message` |

Os receptores ignoram tipos que não conhecem (respondem 2xx). Podes acrescentar eventos no futuro, como `checkout.expired` ou `order.created`, sem quebrar ninguém.

## Payload de um evento de pedido

```json
{
  "id": "evt_01JABCXYZ",
  "type": "order.paid",
  "api_version": "2026-09-01",
  "created_at": "2026-09-23T10:15:00Z",
  "livemode": true,
  "data": {
    "order": {
      "id": "ord_01JABC",
      "reference": "KG-20260923-8F3K2",
      "status": "paid",
      "amount": 14900,
      "currency": "ZAR",
      "refunded_amount": 0,
      "full_refund": false,
      "paid_at": "2026-09-23T10:14:51Z",
      "provider": "paystack",
      "provider_reference": "T123456789"
    },
    "customer": { "id": "cus_01JAB", "email": "parent@example.co.za", "name": "Thandi Mokoena", "phone": null },
    "locale": "en",
    "items": [
      { "product_id": "prod_bible_stories_pack_1", "sku": "KM-BSP1", "name": "Bible Stories Colouring Pack 1", "quantity": 1, "unit_amount": 14900 }
    ],
    "metadata": { "member_user_id": "3f0c2a4e-8b1d-4c6a-9e2f-1a2b3c4d5e6f", "source": "checkout" }
  }
}
```

- **Todos** os eventos de um pedido (`paid`, `refunded`, `disputed`, `dispute_resolved`) levam o mesmo `data.order.id`, o `customer.email`, os `items` e o `metadata` completos. Assim o receptor não precisa do estado de eventos anteriores.
- `metadata` é um mapa de texto para texto (até 50 chaves). Guarda tudo o que o checkout recebeu (ver Parte 3) e devolve-o igual em todos os eventos.

## Cabeçalhos e assinaturas

Cada entrega leva **dois conjuntos de assinatura**, calculados com o mesmo segredo:

1. `X-Kingdom-Signature`: é este que a Kingdom Library verifica. **Obrigatório e exatamente assim.**
2. Os cabeçalhos do Standard Webhooks (https://www.standardwebhooks.com): são o que as bibliotecas prontas das outras empresas verificam.

```
Content-Type: application/json
User-Agent: KingdomGateway-Webhooks/1.0
X-Kingdom-Event-Id: evt_01JABCXYZ
X-Kingdom-Event-Type: order.paid
X-Kingdom-Signature: t=<unix_seconds>,v1=<hex>
webhook-id: evt_01JABCXYZ
webhook-timestamp: <unix_seconds>
webhook-signature: v1,<base64>
```

**O segredo** de cada integração é gerado pelo gateway no formato `whsec_` + base64 de 32 bytes aleatórios (ex.: `whsec_MfKQ9r8GKYqrTYLCCHSgKgmhAIVEyG4GC3rBJHs8Qdo=`). É mostrado uma única vez. A Kingdom Library aceita segredos de 16 a 200 caracteres, sem espaços.

**`X-Kingdom-Signature`**
- `v1` = HMAC-SHA256 em hexadecimal minúsculo de `"<t>.<corpo cru>"`.
- **A chave é o texto completo do segredo em UTF-8, incluindo o prefixo `whsec_`.**
- `t` é o mesmo instante de `webhook-timestamp`.

**`webhook-signature` (Standard Webhooks)**
- `v1,` + base64 do HMAC-SHA256 de `"<webhook-id>.<webhook-timestamp>.<corpo cru>"`.
- **A chave são os bytes obtidos ao descodificar em base64 a parte depois de `whsec_`.**

**Rotação do segredo**
- O botão "Rodar segredo" abre um período de graça de 24 h, durante o qual cada entrega leva as duas assinaturas.
- Formato: `X-Kingdom-Signature: t=…,v1=<novo>,v1=<antigo>` e `webhook-signature: v1,<novo> v1,<antigo>` (separadas por espaço).
- A Kingdom Library também guarda o segredo anterior durante 24 h quando eu colar o novo.

**Assina exatamente os bytes que envias.** Serializa o JSON uma vez e usa esse texto tanto para o HMAC como para o corpo do pedido.

### Vetores de teste (validados com o código da Kingdom Library e com a biblioteca oficial `standardwebhooks`)

```
segredo   = whsec_MfKQ9r8GKYqrTYLCCHSgKgmhAIVEyG4GC3rBJHs8Qdo=
t         = 1790000000
webhook-id = evt_test_001
corpo     = {"id":"evt_test_001","type":"integration.test","api_version":"2026-09-01","created_at":"2026-09-21T13:33:20Z","livemode":false,"data":{"message":"hello"}}

X-Kingdom-Signature = t=1790000000,v1=1b0df85aafe409b7f2b6c1f1aafdefe2e22da4adce4baad570619561068db003
webhook-signature   = v1,8XoEyulc+Miy/jfHuHRrAlq26G6fBIrein2njgwH8ns=
```

Põe estes valores num teste automático. Se não baterem, a Kingdom Library rejeita as entregas com 401.

Referência em Node.js (é o que a Kingdom Library faz para verificar):

```js
import { createHmac, timingSafeEqual } from "node:crypto";
const sign = (secret, t, body) => createHmac("sha256", secret).update(`${t}.${body}`, "utf8").digest("hex");
// verificação: |agora - t| <= 300 s e algum v1 do cabeçalho igual a sign(segredo, t, corpoCru), em tempo constante
```

## Regras de entrega

- **Padrão outbox.** O evento é gravado na mesma transação que muda o pedido, e um worker entrega-o depois. Nunca fazer chamadas HTTP dentro da transação.
- **Entrega "pelo menos uma vez".** O mesmo `id` em todas as tentativas. Cada tentativa tem um timestamp e uma assinatura novos.
- **Ordem por pedido.** Entrega os eventos do mesmo pedido pela ordem em que aconteceram, e não envies o seguinte enquanto o anterior não tiver sido entregue ou não tiver falhado de vez. Entre pedidos diferentes a ordem não importa. Mesmo assim, documenta que a ordem não é garantida: a Kingdom Library aguenta eventos fora de ordem.
- **Pedido:** HTTPS apenas; corpo até 256 KB (a Kingdom Library rejeita acima disso com 413); timeout de 10 s; não seguir redirects.
- **Como interpretar a resposta:**

| Resposta | Significado | O gateway faz |
|---|---|---|
| 2xx | Recebido. Inclui `{"duplicate": true}` e eventos de teste ignorados. | Marca como entregue. |
| 408, 425, 429, 5xx, timeout, erro de rede | Temporário | Tenta de novo com backoff; em 429, respeita o `Retry-After`. |
| 401, 403, 404 | Configuração errada: segredo não colado ou diferente, URL errado | Tenta de novo com backoff (dá tempo para eu corrigir sem perder a venda) **e alerta logo no painel**. Um 401 quase sempre significa que o segredo não coincide. |
| 400, 413, 422 | O receptor recusou este conteúdo | **Falha definitiva, sem repetir.** Uma nova tentativa não muda nada, e a Kingdom Library responderia `duplicate` com 200, o que esconderia o erro. Mostra o corpo da resposta no log, alerta, e deixa reenviar à mão depois de corrigir o gateway. |

- **Backoff:** 1 min, 5 min, 30 min, 2 h, 6 h, 12 h, 24 h, com uma variação aleatória de ±10 %. Depois disso, falha definitiva e alerta.
- **Pausa automática:** 20 falhas seguidas pausam a integração e disparam um alerta.
- **Proteção SSRF:** rejeitar destinos que resolvam para IPs privados, loopback, link-local ou metadata (`169.254.169.254`, `fd00::/8`…). Verificar ao gravar e em cada entrega.
- **Reenvio manual:** o mesmo `id` e o mesmo corpo, com uma assinatura nova.
- **Eventos guardados 30 dias** e consultáveis pela API (`GET /v1/events`), para quem perdeu entregas recuperar sozinho.

# Parte 3: link de checkout e regresso (contrato com a Kingdom Library)

Cada produto do gateway tem um **link de checkout estável** (ex.: `https://pay.<domínio>/c/prod_bible_stories_pack_1`). Eu colo-o na Kingdom Library em Admin → Produto → "Checkout link".

Quando um membro carrega no cadeado de um produto bloqueado, a Kingdom Library abre esse link e **acrescenta** estes parâmetros:

| Parâmetro | Exemplo | O gateway faz |
|---|---|---|
| `email` | `thandi@example.co.za` | Pré-preenche; o comprador pode alterá-lo. |
| `name` | `Thandi Mokoena` | Pré-preenche. |
| `locale` | `en` \| `pt` \| `es` | Idioma do checkout e do recibo; devolve-o em `data.locale`. |
| `ref` | UUID do membro | Guarda-o e devolve-o **tal e qual** em `data.metadata.member_user_id`. |
| `return_url` | `https://library.kingdomcompny.com/purchase/return?product=<uuid>` | Aceita-o só se o domínio estiver na allowlist da integração; caso contrário ignora-o. |

- **Parâmetros desconhecidos** (ex.: `utm_*`) são guardados em `metadata` e não dão erro.
- **Regresso:** depois do pagamento, ou se o cliente cancelar, redirecionar para o `return_url`, **mantendo os parâmetros que já traz** e acrescentando:
  - `status` = `success` | `cancelled` | `failed`;
  - `reference`.

  Exemplo: `…/purchase/return?product=<uuid>&status=success&reference=KG-20260923-8F3K2`.

  A Kingdom Library mostra "a confirmar pagamento" e espera pelo `order.paid`. O redirect não liberta nada.
- Sem `ref` (compra feita fora da área de membros), `member_user_id` vai `null`. A Kingdom Library cria então um convite para o email do checkout.

# Contrato com a Kingdom Library (já em produção, não mudar)

**Endpoint:** `POST https://library.kingdomcompny.com/api/webhooks/gateway`. Eu registo-o na aba Integrações e colo o segredo na Kingdom Library, em Admin → Integrações.

**O que ela lê** (o resto pode vir e é ignorado):

| Campo | Obrigatório | Uso |
|---|---|---|
| `id`, `type`, `livemode` | sim | Deduplicação, tipo e modo |
| `data.order.id` | **sim** | Chave do pedido, igual em todos os eventos desse pedido |
| `data.customer.email` | **sim** | Conta a que o acesso é dado (se não houver `member_user_id`) e destino do convite |
| `data.customer.name` | não | Nome no convite |
| `data.locale` | não | `en` / `pt` / `es`; qualquer outro valor passa a `en`. Idioma do convite. |
| `data.items[].product_id` | sim no `order.paid` | Tem de ser igual ao "Gateway product id" do produto na Kingdom Library. Um ID desconhecido gera um alerta ao admin e não dá acesso. |
| `data.metadata.member_user_id` | não | UUID do membro que carregou no cadeado; o acesso vai para essa conta mesmo que o email do checkout seja outro |
| `data.order.reference`, `amount`, `currency` | recomendado | Mostrados ao membro e no admin |
| `data.order.refunded_amount`, `data.order.full_refund` | no `order.refunded` | Qualquer reembolso, parcial ou total, retira o acesso dado por aquele pedido |
| `data.outcome` | **sim** no `order.dispute_resolved` | `won` devolve o acesso suspenso (salvo se já houve reembolso); `lost` retira-o de vez |

**Comportamento dela:**
- Uma disputa aberta suspende o acesso logo.
- Estados finais (`refunded`, `dispute_lost`) nunca voltam atrás, mesmo que chegue um `order.paid` atrasado.
- Eventos com `livemode: false` são **aceites com 200 e ignorados** em produção. Para testar ponta a ponta em modo test do Paystack, avisa-me: eu ligo temporariamente os eventos de teste na Kingdom Library. O `integration.test` é aceite sempre.

**Respostas que ela devolve:**

| Código | Corpo | Significado |
|---|---|---|
| 200 | `{"received":true,"result":"processed"}` | Aplicado |
| 200 | `{"received":true,"duplicate":true}` | Já tinha recebido este `id` |
| 400 | `{"error":"invalid JSON" \| "invalid event"}` | Envelope inválido |
| 401 | `{"error":"invalid signature"}` | Assinatura em falta, mal formada, com mais de 5 min ou errada |
| 413 | `{"error":"payload too large"}` | Corpo acima de 256 KB |
| 422 | `{"received":true,"result":"rejected","reason":"…"}` | Dados do evento inválidos (ex.: sem `order.id`, ou sem `outcome`) |
| 500 / 503 | `{"error":"…retry later"}` | Temporário: repetir |

# Parte 4: API REST pública

Base: `https://api.<domínio>/v1`. Documentada num ficheiro **OpenAPI 3.1** (`/v1/openapi.json`), validado em CI contra as respostas reais. Os eventos ficam descritos com JSON Schema (ou AsyncAPI 3.0) no mesmo repositório.

**Autenticação**
- Chaves secretas `Authorization: Bearer sk_live_…`, guardadas com hash (mostradas uma única vez), com âmbitos (ex.: `orders:read`, `refunds:write`, `webhooks:write`) e chaves restritas.
- Para clientes empresariais, opcionalmente OAuth 2.0 *client credentials*.
- Nunca aceitar chaves na query string. Allowlist de IP opcional por chave.

**Recursos mínimos**

| Recurso | Operações |
|---|---|
| `products` | listar, obter (ID, nome, preço, moeda, estado, link de checkout) |
| `checkout_sessions` | criar (itens, cliente, `locale`, `metadata`, `return_url`, expiração) → devolve `url`; obter; expirar |
| `orders` | listar (filtros: `status`, `created[gte/lte]`, `customer_email`, `metadata[chave]`), obter |
| `refunds` | criar (total ou parcial, com `reason`), listar, obter |
| `customers` | obter, listar |
| `events` | listar e obter (30 dias) |
| `webhook_endpoints` | criar, listar, atualizar, apagar, rodar segredo, enviar teste |

**Convenções**
- **Idempotência:** header `Idempotency-Key` em todos os `POST`. A resposta é guardada 24 h e devolvida igual se a chave se repetir; a mesma chave com um corpo diferente dá 409.
- **Paginação por cursor:** `limit` (máx. 100) e `starting_after`, com resposta `{ "data": [...], "has_more": true, "next_cursor": "…" }`.
- **Erros RFC 9457** (`application/problem+json`) com `type`, `title`, `status`, `detail`, e ainda `code`, `param` e `request_id`.
- Header `Request-Id` em todas as respostas.
- **Limites:** 429 com `Retry-After` e os cabeçalhos `RateLimit-Limit` / `RateLimit-Remaining` / `RateLimit-Reset`.
- **Versão:** header `Kingdom-Version: 2026-09-01`; sem o header, usa a versão da chave.
- Sem CORS nos endpoints que exigem chave secreta.
- TLS 1.2 ou superior, HSTS, e log de auditoria de todas as operações feitas com chaves. Dados pessoais só os necessários (POPIA).

# Parte 5: aba "Integrações" no painel

- **Lista:** nome, URL, estado (ativa / pausada / desativada por falhas), modo (test/live), eventos subscritos, filtro de produtos, última entrega e taxa de sucesso.
- **Criar / editar:** nome, URL (só HTTPS), eventos, produtos, modo, **allowlist de domínios de `return_url`** e versão da API.
- **Segredo:** mostrado uma vez, com o botão "Rodar segredo" (24 h de graça).
- **"Enviar evento de teste"** (`integration.test`).
- **Log de entregas:** evento, tentativa, código HTTP, duração, os primeiros 2 KB da resposta, próximo retry e "Reenviar".
- **Página de documentação** na própria aba: envelope, eventos, cabeçalhos, os vetores de teste, verificação em Node e Python, e política de retries.
- **IDs de produto visíveis e copiáveis**, porque as aplicações mapeiam produtos por esse ID.
- **Chaves de API:** criar, restringir, revogar e ver a última utilização.

# Testes e critérios de aceitação

**Testes automáticos**
- Assinatura do Paystack válida e inválida.
- Idempotência de entrada: o mesmo evento do Paystack 2× resulta num único pedido pago e num único evento de saída.
- Um verify com montante divergente não marca o pedido como pago.
- **Os dois vetores de assinatura acima**, e a rotação (dois `v1`).
- Backoff e classificação das respostas (2xx / temporário / definitivo).
- Bloqueio SSRF e allowlist do `return_url`.
- Máquina de estados, incluindo o reembolso parcial seguido de total (`refunded_amount` acumulado).
- `Idempotency-Key` da API; paginação; formato dos erros.
- Validação do OpenAPI contra as respostas reais.

**Aceitação com a Kingdom Library (fazemos juntos)**
1. Crio a integração com o endpoint da Kingdom Library e colo o segredo em Admin → Integrações.
2. "Enviar evento de teste" → 200, e o evento aparece no log de entregas da Kingdom Library.
3. Com os eventos de teste ligados na Kingdom Library: compra em modo test a partir do cadeado → `order.paid` → o produto abre na conta certa, e o regresso mostra "pago".
4. Reembolso parcial → o acesso é retirado. Disputa aberta → o acesso é suspenso; disputa ganha → o acesso volta.
5. O mesmo evento reenviado → `{"duplicate": true}`.
6. Um `product_id` desconhecido → a Kingdom Library alerta o admin e o gateway regista 200.

**Entregáveis:**
- código com testes;
- migrações;
- OpenAPI 3.1 e os JSON Schemas dos eventos;
- README (variáveis de ambiente, registo do webhook no dashboard do Paystack, criação de integrações e chaves, verificação da assinatura);
- `CHANGELOG` da API;
- commits pequenos e com mensagens claras, sem quebrar o que já existe.
