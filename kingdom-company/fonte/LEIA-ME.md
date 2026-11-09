# Fonte do site

Os ficheiros desta pasta geram páginas do site. Não são publicados (estão no `.vercelignore`).

## Gerar o site

Na pasta `kingdom-company`, por esta ordem:

```
python3 fonte/servicos.py   # 12 serviços, 4 áreas, pedido de cotação, privacidade, termos, 404
python3 fonte/paginas.py    # parceiros, ferramentas gratuitas, materiais gratuitos (3 guias)
python3 blog/construir.py   # blog (só quando há artigos novos; precisa de: pip install markdown)
python3 fonte/seo.py        # SEO em todas as páginas + sitemap.xml, robots.txt e llms.txt
```

Corra sempre o `seo.py` no fim: os outros refazem as páginas e o SEO tem de ser reposto.

## Ficheiros

| Ficheiro | O que tem |
|---|---|
| `servicos.json` | As 12 fichas do playbook: textos, dores, entregáveis, urgência e título e descrição de SEO (`seo`) |
| `areas.json` | As 4 áreas: resumo, proposta de valor, urgência e SEO |
| `privacidade.html`, `termos.html` | Os textos da política de privacidade e dos termos de utilização |
| `materiais.json` | Os guias e checklists gratuitos (cada um gera uma página em /materiais-gratuitos) |
| `seo.json` | Domínio, ID do Google Analytics 4, códigos de verificação do Search Console e do Bing, redes sociais |

## Ligar o Google Analytics e o Search Console

1. Ponha o ID de medição (`G-XXXXXXXXXX`) em `ga4` e o código da meta tag do Search Console em `google_site_verification`, no `seo.json`.
2. Ponha os links das páginas oficiais nas redes sociais em `redes`.
3. Corra `python3 fonte/seo.py` e publique.

Com o ID preenchido, o site mostra um aviso de cookies e só grava cookies de análise depois de o visitante aceitar (Consent Mode). Envia estes eventos:

| Evento | Quando |
|---|---|
| `generate_lead` | Pedido de cotação ou avaliação inicial enviado (com `tipo` e `servico`) |
| `descarregar_material` | Clique em «Guardar em PDF ou imprimir» num guia |
| `clique_cotacao` | Clique num botão que leva ao pedido de cotação |
| `contacto` | Clique num telefone, num email ou no WhatsApp (`metodo`) |

No Google Analytics, marque `generate_lead` como evento-chave (conversão).
