# Blog de notícias · dados

A secção «Últimas atualizações» da página inicial lê `blog/noticias.json` (gerado pelo `construir.py`) e mostra as 5 notícias mais recentes (ordenadas por `data`). Este ficheiro é o que a automação (Manus + Claude) vai manter atualizado com notícias nacionais e internacionais de negócios, tecnologia e inteligência artificial.

Enquanto `noticias.json` estiver vazio, o site público mostra uma mensagem «As primeiras notícias chegam em breve». A pré-visualização (Vercel, localhost ou `?previa`) mostra os exemplos de `blog/exemplos.json`, marcados como exemplo.

## Como publicar um artigo

1. Criar `blog/artigos/<slug>.md` (o nome do ficheiro é o endereço: `/blog/<slug>`), com este cabeçalho e o texto em Markdown por baixo:

```
---
titulo: Título do artigo
resumo: Uma ou duas frases que aparecem no topo do artigo, na lista e na página inicial.
categoria: Negócios | Tecnologia | Inteligência artificial
ambito: Nacional | Regional | Internacional
data: AAAA-MM-DD
imagem: (opcional) /blog/img/<slug>.jpg, 1200 × 630
---
```

2. Correr `python3 blog/construir.py` a partir da pasta `kingdom-company` (precisa de `pip install markdown`). O script gera a página do artigo, a lista `/blog` e o `blog/noticias.json`.
3. Publicar (commit e push).

A automação (Manus + Claude) segue os mesmos três passos.

## Formato de cada notícia

```json
{
  "titulo": "Título curto, em português europeu",
  "resumo": "Duas ou três linhas escritas por nós: o que aconteceu e o que significa para as empresas.",
  "categoria": "Negócios | Tecnologia | Inteligência artificial",
  "ambito": "Nacional | Regional | Internacional",
  "fonte": "Nome do órgão de comunicação",
  "fonte_url": "https://… (artigo original)",
  "data": "AAAA-MM-DD",
  "link": "/blog/slug-da-noticia (ou o link da fonte, enquanto não houver página própria)",
  "imagem": "opcional: URL de uma imagem com direitos de uso; sem ela, a capa é gerada pela categoria"
}
```

## Regras para a automação

- Só notícias reais, com fonte e link verificáveis; nunca inventar factos, números ou citações.
- Resumir por palavras nossas; não copiar o texto da fonte.
- Imagens só com direitos de uso; na dúvida, deixar `imagem` vazio.
- Manter no máximo as 60 notícias mais recentes no ficheiro.
