# Prompt para o gateway: Paystack + aba de Integrações (webhooks)

Copiar tudo abaixo da linha e colar na sessão do Claude que desenvolve o gateway.

---

# Contexto

Estás a trabalhar no meu gateway de pagamentos (este repositório). Tenho acesso às APIs do Paystack (chaves test e live), mas a integração ainda não existe. Hoje quero duas entregas:

1. **Integração completa de pagamentos com o Paystack.** O mercado principal é a África do Sul, com moeda ZAR.
2. **Uma aba "Integrações" com webhooks de saída.** Serve para que outras aplicações minhas recebam eventos de venda. A primeira é a **Kingdom Members**, a área de membros com conteúdo cristão digital (packs de colorir, eBooks, guias e apostilas). Ela usa estes eventos para:
   - enviar o convite de criação de conta;
   - libertar produtos;
   - retirar acesso em reembolsos e disputas.

   A aba tem de ser genérica, para eu ligar outras aplicações no futuro.

# Antes de escrever código

- Explora o repositório: stack, estrutura de pastas, ORM e migrações, autenticação do painel admin, jobs/filas/cron existentes, testes e convenções. Segue essas convenções e não introduzas frameworks novos sem necessidade.
- Consulta a documentação oficial atual do Paystack (https://paystack.com/docs). Confirma os endpoints, os nomes dos eventos e os canais disponíveis para contas sul-africanas. Não confies só na memória.
- Apresenta-me um plano curto com ficheiros, tabelas, rotas e ecrãs. Espera pela minha aprovação antes de implementar.
- Se algo for ambíguo, pergunta em vez de assumir.

# Parte 1: Paystack

1. **Configuração**
   - `PAYSTACK_SECRET_KEY` e `PAYSTACK_PUBLIC_KEY` ficam em variáveis de ambiente, com valores separados para test e live.
   - A secret key nunca vai para o código, para o front-end nem para os logs.
2. **Início do pagamento**
   - Chamar `POST https://api.paystack.co/transaction/initialize` com:
     - `email`;
     - `amount` em cêntimos (R149,00 = `14900`);
     - `currency: "ZAR"`;
     - uma `reference` única gerada por nós;
     - `callback_url`;
     - `metadata` com `order_id`, `product_ids`, `locale` e `member_user_id` (quando existir).
   - Redirecionar o cliente para o `authorization_url` devolvido.
3. **Parâmetros de URL do checkout**, para pré-preenchimento e rastreio:
   - `email`, `name`;
   - `locale` (`en` | `pt` | `es`, por defeito `en`);
   - `ref` (ex.: `member_user_id` vindo da área de membros);
   - `return_url` (só domínios numa allowlist configurável).

   Estes dados são guardados no pedido e voltam nos webhooks de saída.

   **Regresso ao `return_url`:** depois do pagamento (ou se o cliente cancelar), redirecionar o browser para o `return_url` recebido, **mantendo os parâmetros que já traz** e acrescentando:
   - `status` = `success` | `cancelled` | `failed`;
   - `reference` = a referência do pedido (ex.: `KG-20260923-8F3K2`).

   Exemplo: `https://kingdom-members.vercel.app/purchase/return?product=<id>&status=success&reference=KG-20260923-8F3K2`. A área de membros nunca liberta nada por causa deste redirect: só mostra o estado e espera pelo webhook `order.paid`.
4. **Webhook de entrada do Paystack** (`POST /webhooks/paystack`):
   - Validar o header `x-paystack-signature`. O valor esperado é HMAC-SHA512 do **corpo cru** do pedido, com a secret key como chave. Calcular sobre o body antes do parse e comparar em tempo constante.
   - Responder 200 rapidamente e processar de forma assíncrona.
   - Deduplicar: o mesmo evento pode chegar várias vezes.
   - Antes de marcar um pedido como pago, confirmar com `GET /transaction/verify/:reference` que:
     - `status = success`;
     - `amount` e `currency` coincidem com o pedido.
   - Tratar pelo menos estes eventos (confirma os nomes na doc):
     - `charge.success`;
     - eventos de reembolso (`refund.processed`, `refund.pending`, `refund.failed`);
     - `charge.dispute.create` e `charge.dispute.resolve`.
5. **O `callback_url` (redirect do browser) nunca liberta nada sozinho.** Só mostra o estado ao cliente. A fonte da verdade é o webhook confirmado pelo verify.
6. **Máquina de estados do pedido:** `pending → paid → refunded | partially_refunded | disputed → (dispute_won | dispute_lost)`. Transições inválidas são ignoradas e registadas no log.
7. **Reembolsos a partir do painel**, totais e parciais, via `POST /refund`.
8. **Canais de pagamento:** ativar os que a conta sul-africana suporta (cartão, EFT, etc.), confirmando na doc e no dashboard.
9. **Modo test/live** visível no painel. Pedidos test nunca aparecem misturados nos relatórios live.

# Parte 2: aba "Integrações" (webhooks de saída)

## UI no painel admin

- **Lista de integrações.** Cada linha mostra:
  - nome e URL do endpoint;
  - estado (ativo / pausado / desativado por falhas) e modo (test/live);
  - eventos subscritos e produtos filtrados (todos ou uma seleção);
  - última entrega e taxa de sucesso.
- **Criar/editar integração:** nome, URL (só HTTPS), eventos, produtos e modo.
- **Segredo de assinatura** gerado pelo sistema (`whsec_…`):
  - é mostrado uma única vez;
  - o botão "Rodar segredo" abre um período de graça de 24 h, durante o qual se enviam as duas assinaturas.
- **Botão "Enviar evento de teste"**, que envia `integration.test`.
- **Log de entregas.** Cada entrada mostra:
  - evento, nº da tentativa, código HTTP e duração;
  - os primeiros 2 KB da resposta;
  - a hora do próximo retry;
  - um botão "Reenviar".
- **Página "Documentação"** dentro da aba, com:
  - formato do payload e cabeçalhos;
  - exemplo de verificação da assinatura em Node.js;
  - política de retries.
- **IDs de produto estáveis e copiáveis** no painel (ex.: `prod_…`), porque as aplicações externas mapeiam por esse ID.

## Eventos (v1)

- `order.paid`
- `order.refunded`: inclui `refunded_amount` e `full_refund: true|false`
- `order.disputed`
- `order.dispute_resolved`: inclui `outcome: "won" | "lost"`
- `integration.test`

## Payload

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
      "paid_at": "2026-09-23T10:14:51Z",
      "provider": "paystack",
      "provider_reference": "T123456789"
    },
    "customer": {
      "email": "parent@example.co.za",
      "name": "Thandi Mokoena",
      "phone": null
    },
    "locale": "en",
    "items": [
      {
        "product_id": "prod_bible_stories_pack_1",
        "sku": "KM-BSP1",
        "name": "Bible Stories Colouring Pack 1",
        "quantity": 1,
        "unit_amount": 14900
      }
    ],
    "metadata": {
      "member_user_id": null,
      "source": "checkout"
    }
  }
}
```

## Cabeçalhos de cada entrega

- `Content-Type: application/json`
- `User-Agent: KingdomGateway-Webhooks/1.0`
- `X-Kingdom-Event-Id: evt_…`
- `X-Kingdom-Event-Type: order.paid`
- `X-Kingdom-Signature: t=<unix_seconds>,v1=<hex>`
  - `<hex>` é o HMAC-SHA256, com o segredo da integração, de `"<t>.<raw_body>"`.
  - Durante a rotação de segredo, enviar dois `v1=`.
- O receptor rejeita timestamps com mais de 5 minutos de diferença. Isto protege contra replay.

## Regras de entrega

- **Padrão outbox:** o evento é gravado na mesma transação que muda o estado do pedido. Um worker faz a entrega depois. Nunca fazer chamadas HTTP dentro da transação.
- **Entrega "pelo menos uma vez":** o `id` do evento é o mesmo em todas as tentativas, para o receptor deduplicar.
- **Timeout de 10 s.** Sucesso é qualquer resposta 2xx. Redirects não são seguidos.
- **Retries com backoff:** 1 min, 5 min, 30 min, 2 h, 6 h, 12 h, 24 h. Depois disso a entrega fica marcada como falha definitiva e aparece um alerta no painel.
- **Pausa automática:** 20 falhas consecutivas pausam a integração e disparam um alerta.
- **Proteção SSRF:** rejeitar URLs que resolvam para IPs privados, loopback, link-local ou metadata (ex.: `169.254.169.254`). Verificar ao gravar a integração e novamente a cada entrega.
- **A ordem de chegada não é garantida.** Documentar isto.

# Contrato com a Kingdom Members (primeira integração)

- Identifica os produtos pelo `product_id` do gateway.
- Usa `customer.email`, `customer.name` e `locale` (`en` | `pt` | `es`) para enviar o convite no idioma do comprador.
- Usa `metadata.member_user_id` quando a compra veio de um produto bloqueado dentro da área de membros. Nesse caso o produto é libertado na conta existente, sem convite.
- **O gateway não envia emails de acesso.** Envia no máximo o recibo de pagamento. O convite e o acesso são da Kingdom Members.
- Eu registo o URL do endpoint da Kingdom Members na aba "Integrações" quando ela estiver publicada.

# Testes e entrega

- **Testes automáticos:**
  - assinatura do Paystack válida e inválida;
  - idempotência: o mesmo evento Paystack 2× resulta num único pedido pago e num único evento de saída;
  - verify com montante divergente não marca o pedido como pago;
  - geração e verificação da assinatura de saída;
  - calendário de backoff;
  - bloqueio SSRF;
  - máquina de estados.
- **Teste ponta a ponta** em modo test do Paystack, com cartões de teste e um receptor de teste.
- **README** com:
  - variáveis de ambiente;
  - como registar o URL do webhook no dashboard do Paystack (Settings → API Keys & Webhooks);
  - como criar uma integração e verificar a assinatura.
- Commits pequenos e com mensagens claras. Não quebrar funcionalidades existentes.
