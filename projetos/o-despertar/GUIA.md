# O Despertar · Pipeline de vendas e dashboard

Sistema de acompanhamento das vendas de ingressos de **O Despertar** (Laços Eternos & Deive Leonardo), operado pela equipa de vendas da Kingdom Company.

```
Equipa (chamadas, WhatsApp, follow-ups)
        │ escolhe a Etapa de cada contacto
        ▼
Google Sheets "O Despertar · Pipeline de Vendas"
  Leads · Compradores · Histórico (automático) · Painel · Config
        │ Apps Script (doGet) devolve só números agregados
        ▼
Vercel /api/dados (cache de 30 s)  ──►  Dashboard dos clientes (atualiza a cada minuto)
```

O dashboard **nunca recebe nomes, telefones nem emails** de contactos. Recebe só contagens, os nomes dos responsáveis da equipa e os totais por dia.

## O que está em cada pasta

| Pasta | Conteúdo |
|---|---|
| `planilha/construir_planilha.py` | Gera a planilha reorganizada a partir do ficheiro original (migração já feita). |
| `apps-script/Code.gs`, `appsscript.json` | Script a colar na planilha: registo automático + API do dashboard. |
| `dashboard/` | Página do dashboard e função `/api/dados` publicadas na Vercel. |
| `ferramentas/` | Testes locais: exportar a planilha e correr a agregação do script fora do Google. |

## Estrutura da planilha

| Aba | Quem edita | Para quê |
|---|---|---|
| **Como usar** | — | Instruções curtas para a equipa. |
| **Leads** | Equipa | Uma linha por contacto. Responsável, Etapa, Canal, Próximo follow-up, Sector, Qtd ingressos, Condição, Motivo, Observação. Colunas cinzentas preenchem-se sozinhas. |
| **Compradores** | Quem recebe as vendas de outros canais | Quem comprou sem passar pela equipa (lista do cliente, plataforma). |
| **Histórico** | Ninguém (script) | Cada mudança de Etapa, com data e hora. Base da atividade por dia. |
| **Painel** | Ninguém (fórmulas) | Resumo para a equipa: funil, desempenho por pessoa, faixas, canais, motivos, atividade diária. |
| **Config** | Coordenação | Equipa, preços por sector, condições (ex.: Promoção 50%), canais, motivos, data do evento, meta. |

Etapas: Por contactar → Sem resposta → Em conversa → Vai comprar → Comprou, ou Não vai participar / Contacto inválido.

## Instalação (uma vez, cerca de 10 minutos)

### 1. Planilha
1. Abra a planilha nova e confirme o fuso horário: **Ficheiro → Definições → Fuso horário → (GMT+02:00) Maputo**.
2. Na aba **Config**, preencha nas células amarelas:
   - os **preços** do Sector A e do Sector B;
   - a **data do evento** e a **meta de ingressos**;
   - os nomes reais no lugar de **Pessoa 1, 2 e 3**. Depois use **Editar → Localizar e substituir** na aba Leads para trocar "Pessoa 1" pelo nome.
3. Partilhe a planilha com a equipa como **Editor**. Os clientes **não** precisam de acesso à planilha.
4. A partir de agora a equipa trabalha **só nesta planilha**. A original fica como arquivo.

### 2. Script
1. Na planilha: **Extensões → Apps Script**.
2. Apague o código que lá estiver e cole todo o conteúdo de `apps-script/Code.gs`. Guarde (ícone da disquete).
3. Opcional, mas recomendado: em **Definições do projeto** (engrenagem), ative "Mostrar o ficheiro de manifesto appsscript.json" e substitua o conteúdo dele por `apps-script/appsscript.json`.
4. Volte à planilha e recarregue a página. Aparece o menu **O Despertar**. Escolha **Ver os dados que o dashboard recebe** e autorize o script. Se o Google mostrar "Esta app não foi validada", clique em **Avançadas → Aceder (não seguro)**: o script é seu e só lê esta planilha.

### 3. Ligar ao dashboard
1. No Apps Script: **Implementar → Nova implementação → tipo App da Web**.
   - Executar como: **Eu**
   - Quem tem acesso: **Qualquer pessoa**
2. Clique em **Implementar** e copie o **URL da app da Web** (termina em `/exec`).
3. Coloque esse URL na Vercel, no projeto `o-despertar-vendas`: **Settings → Environment Variables → `APPS_SCRIPT_URL`**. Depois faça **Redeploy**. Também pode enviar o URL ao Claude para ele fazer este passo.
4. Opcional: para que só o dashboard consiga ler os dados, no Apps Script vá a **Definições do projeto → Propriedades do script** e crie `CHAVE_DASHBOARD` com uma palavra-passe longa. Defina a mesma palavra-passe na Vercel como `CHAVE_DASHBOARD`.

Quando mudar o código do script, use **Implementar → Gerir implementações → editar → Nova versão**. Assim o URL mantém-se.

Enquanto o passo 3 não estiver feito, o dashboard mostra um **instantâneo** da planilha de 28/11, identificado como tal no topo da página.

## Rotina da equipa
1. Filtrar Leads por Responsável = o seu nome e Etapa = Por contactar (ou ordenar por Próximo follow-up).
2. Depois de cada tentativa, escolher **Etapa** e **Canal**. Tentativas, Último contacto e o Histórico atualizam-se sozinhos.
3. Combinou falar mais tarde? Preencher **Próximo follow-up**. Fica amarelo no dia e vermelho quando passa da data.
4. Pagou? **Etapa = Comprou** + Sector + Qtd ingressos + Condição.
5. Recusou? **Etapa = Não vai participar** + Motivo.
6. Novos contactos: menu **O Despertar → Adicionar 100 linhas para novos leads**, e preencher a partir da primeira linha vazia.

## Decisões tomadas na migração (27/11/2026)
- "Ligador" passou a **Responsável**. "Mayra..KD" e "Maria. KD" passaram a **Mayra** e **Maria**.
- Os estados antigos foram convertidos: Sem Resposta → Sem resposta, Vai se Inscrever → Vai comprar, Nao vai Participar → Não vai participar, Ja se Inscreveu → Comprou. Uma linha só com a nota "nr sem whatsap" ficou em Sem resposta.
- As observações em texto livre foram lidas para preencher Sector ("sector b", "sessão B"…), Qtd ("2 bilhetes", "3 pessoas"), Condição ("50%"), Motivo ("indisponibilidade de tempo"…) e Próximo follow-up ("2a feira" → 30/11, "até dia 3" → 03/12, "28/11", "ligar de volta" → 27/11). O texto original ficou na coluna Observação.
- **"50%" foi interpretado como Promoção 50%** (metade do preço). Se significar pagamento de sinal, mude o nome e o fator na Config.
- Os 181 contactos já trabalhados entraram no Histórico com a data **27/11/2026** (aproximada, marcada como "Migração (data aproximada)"), porque a planilha original não tinha datas.
- Quem comprou sem quantidade indicada conta como 1 ingresso. Os 219 da aba "Já compraram" estão em **Compradores** com origem "Lista do cliente" e 1 ingresso cada.

## Testar a agregação localmente
```bash
python3 ferramentas/exportar_para_teste.py planilha-exportada.xlsx /tmp/entrada.json 2026-11-28
node ferramentas/agregar.mjs /tmp/entrada.json dashboard/api/_instantaneo.json
```
