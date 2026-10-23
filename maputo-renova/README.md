# Maputo Renova · Gestão de Cobranças e Reconciliação

Protótipo clicável do painel da equipa financeira da Maputo Renova, Lda.: facturação das quotas de condomínio, pagamentos por M-Pesa e e-Mola, reconciliação automática e controlo da inadimplência.

Todos os dados são fictícios (condomínios, nomes, telefones, valores).

## Correr

```
cd maputo-renova/app
npm install
npm run dev
```

Abrir http://localhost:3000.

## Ecrãs

| Rota | O que mostra |
|---|---|
| `/` Visão geral | "Precisa de si hoje" (excepções, devedores 90+, prestações), cobrado do mês e balcões por canal, KPI, cobranças por canal (12 meses), dívida por antiguidade, pagamentos ao vivo, cobrança por condomínio |
| `/reconciliacao` | Fila de excepções e decisão: correspondências sugeridas com confiança, associar / dividir / devolver / crédito |
| `/pagamentos` | Balcões M-Pesa, e-Mola, Banco e Caixa com "Fechar o dia", registo manual, lista por canal |
| `/inadimplencia` | Antiguidade da dívida, fracções em atraso com filtros, envio de lembrete SMS em lote |
| `/facturacao` | Ciclo do mês, preparação do lote seguinte por passos, facturas |
| `/condominios`, `/condominos`, `/acordos` | Carteira, residentes e acordos de pagamento |
| `/definicoes`, `/ajuda` | Fora do âmbito do protótipo (descrevem o que vão ter) |

A Visão geral simula pagamentos a chegar: de ~11 em 11 segundos entra um pagamento M-Pesa ou e-Mola, passa por "A reconciliar" e fica "Reconciliado" ou vai para a fila de excepções. O botão "Ao vivo" pausa a simulação.

## Tecnologia

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4, ícones Lucide, letra Geist. Sem backend: os dados estão em `app/src/lib/data.ts`.

Contexto do produto: `PRODUCT.md`. Sistema visual: `DESIGN.md`.
