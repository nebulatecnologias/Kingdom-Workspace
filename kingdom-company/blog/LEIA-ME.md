# Blog de notícias · dados

A secção «Últimas atualizações» da página inicial lê `blog/noticias.json` e mostra as 5 notícias mais recentes (ordenadas por `data`). Este ficheiro é o que a automação (Manus + Claude) vai manter atualizado com notícias nacionais e internacionais de negócios, tecnologia e inteligência artificial.

Enquanto `noticias.json` estiver vazio, o site público mostra uma mensagem «As primeiras notícias chegam em breve». A pré-visualização (Vercel, localhost ou `?previa`) mostra os exemplos de `blog/exemplos.json`, marcados como exemplo.

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
