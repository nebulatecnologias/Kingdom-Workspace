# Fonte do site DT Company

Os ficheiros desta pasta geram páginas do site. Não são publicados (estão no `.vercelignore`).

## Gerar o site

Na pasta do repositório, por esta ordem:

```
python3 dt-company-brand/construir_paginas.py dt-company-site   # sincroniza cabeçalho e rodapé (contactos, pedido de cotação)
cd dt-company-site && python3 fonte/servicos.py                  # 12 serviços, 4 pilares, pedido de cotação, privacidade, termos e 404
python3 fonte/paginas.py                                          # parceiros, ferramentas gratuitas, materiais gratuitos e os 3 guias
python3 blog/construir.py                                         # blog: um artigo por blog/artigos/*.md, a lista e blog/noticias.json
python3 fonte/seo.py                                              # sempre o último: canonical, Open Graph, dados estruturados, Analytics, redes, sitemap.xml, robots.txt, llms.txt
```

A versão dos ficheiros `site.css` e `site.js` (`?v=…`) muda só no `index.html`; os scripts levam-na para as outras páginas.

A página inicial (`index.html`) é editada à mão: o cabeçalho e o rodapé saem dela para as outras páginas.

## Ficheiros

| Ficheiro | O que tem |
|---|---|
| `servicos.json` | As 12 fichas do Playbook de vendas da DT, com a fronteira e os parceiros, a avença, o custo de esperar (`urgencia`) e o título e a descrição para o Google (`seo`) |
| `privacidade.html`, `termos.html` | Os textos da política de privacidade e dos termos de utilização |
| `areas.json` | Os 4 pilares: resumo, proposta de valor, fronteira, custo de esperar e SEO |
| `seo.json` | Domínio (www.dtcompany.co.za), ID do Google Analytics 4, verificação do Search Console e do Bing, email e telefones definitivos e redes sociais. Mudar aqui e correr `python3 fonte/seo.py` |
| `materiais.json` | Os 3 materiais gratuitos (checklists e guia), com os grupos de pontos e o serviço ligado |
| `paginas.py` | Gera /parceiros, /ferramentas-gratuitas (diagnóstico, autoavaliação de compliance, verificação de fornecedor) e /materiais-gratuitos |

O blog fica em `blog/`: cada artigo é um ficheiro `blog/artigos/<slug>.md` com o cabeçalho `titulo`, `resumo`, opcionalmente `seo_titulo` (até 57 caracteres) e `seo_descricao` (até 160), `categoria` (Compliance e Governança, Tax, Incorporação ou ESG), `ambito`, `data` e, opcionalmente, `imagem`. O carrossel da página inicial lê `blog/noticias.json`.

## Regras do playbook

- Grafia anterior ao Acordo Ortográfico de 1990 (actividade, inspecções, projecto).
- Usar: organizamos, preparamos, verificamos, informamos, apoiamos, controlamos prazos.
- Evitar: acompanhamos processos, representamos, parecer, aconselhamento jurídico ou legal, garantimos (sobre resultados legais), consultoria fiscal, «jurista».
- A contabilista certificada parceira assegura a parte fiscal; o advogado parceiro as decisões jurídicas; consultores ambientais registados os estudos de impacto.
- Sem preços: cada proposta é feita à medida.
- Sem casos de clientes no site: os dados dos clientes da DT são confidenciais (decisão do Shelton, 10/11/2026). Também não há nomes nem logótipos de clientes nem testemunhos.

