# Fonte do site

Os ficheiros desta pasta geram páginas do site. Não são publicados (estão no `.vercelignore`).

## Gerar o site

Na pasta `kingdom-company`, por esta ordem:

```
python3 fonte/casos.py      # casos de clientes: /cases, /cases/<slug> e imagens WebP (antes de servicos.py)
python3 fonte/servicos.py   # 9 serviços, 3 áreas, pedido de cotação, privacidade, termos, 404
python3 fonte/paginas.py    # parceiros, ferramentas gratuitas, materiais gratuitos (2 guias)
python3 blog/construir.py   # blog (só quando há artigos novos; precisa de: pip install markdown)
python3 fonte/seo.py        # SEO em todas as páginas + sitemap.xml, robots.txt e llms.txt
```

Corra sempre o `seo.py` no fim: os outros refazem as páginas e o SEO tem de ser reposto.

## Ficheiros

| Ficheiro | O que tem |
|---|---|
| `servicos.json` | As 9 fichas do playbook: textos, dores, entregáveis, urgência e título e descrição de SEO (`seo`) |
| `areas.json` | As 3 áreas: resumo, proposta de valor, urgência e SEO |
| `privacidade.html`, `termos.html` | Os textos da política de privacidade e dos termos de utilização |
| `casos.json` e `casos/<slug>/` | Os casos de clientes (só entram os que têm `"autorizado": true`) e as suas imagens originais |
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

## Publicar um caso de cliente

Os dados vêm da ficha preenchida no documento «Casos de clientes · Kingdom Company» (https://claude.ai/artifact/W6gb5bXbthJYdfaZ5F75sV), com um separador por serviço.

1. Criar a pasta `fonte/casos/<slug>/` com o logótipo do cliente (versão normal, a cores; SVG ou PNG) e pelo menos 6 imagens do projeto, com nomes que digam o que mostram.
2. Acrescentar o caso a `fonte/casos.json`:

```json
{
 "slug": "nome-do-cliente",
 "servico": ["desenvolvimento-editorial", "modelos-de-propostas-tecnicas"],
 "autorizado": true,
 "cliente": "Nome do Cliente", "mostrar_nome": true, "descricao_anonima": "empresa de construção em Maputo",
 "setor": "Construção", "cidade": "Maputo",
 "cores": ["#0F4C5C", "#E9C46A"], "logo": "logo.svg",
 "titulo": "Frase com o resultado", "resumo": "Duas frases sobre o caso.",
 "desafio": "O que estava mal antes.", "fizemos": ["Entregável 1", "Entregável 2"], "duracao": "6 semanas",
 "resultados": [["2", "concursos ganhos em 6 meses"]],
 "frase": "Frase do cliente (opcional)", "autor": "Nome, cargo",
 "imagens": [["capa.jpg", "Legenda que descreve a imagem"]]
}
```

3. Correr os scripts pela ordem acima. O caso aparece em `/cases/<slug>`, na lista `/cases` e como banner na página do serviço; o link «Cases» do menu passa a levar a `/cases`.

As imagens são convertidas para WebP (1600 e 800 px). Na galeria, só a imagem aberta e a seguinte são descarregadas em tamanho grande.
