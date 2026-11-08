# Blog de notícias

## Estrutura

| Ficheiro | O que é |
|---|---|
| `blog/artigos/<slug>.md` | Fonte dos artigos, com cabeçalho e texto em Markdown. O nome do ficheiro é o endereço `/blog/<slug>`. Não é publicado (`.vercelignore`). |
| `blog/img/<slug>.jpg` | Capas em 1200 × 630, usadas na página e nas partilhas em redes sociais. |
| `blog/construir.py` | Gera `blog/<slug>.html`, `blog/index.html` (com filtros por categoria) e `blog/noticias.json`. Lê o nome do site do `aria-label` do logótipo. |
| `blog/noticias.json` | Lido pela secção «Notícias» da página inicial (`data-fonte`), que mostra as 5 notícias mais recentes. |
| `blog/exemplos.json` | Notícias de exemplo, só para a pré-visualização. |
| `blog/LEIA-ME.md` | Instruções para quem publica ou automatiza. |

Cabeçalho de cada artigo:

```
---
titulo: …
resumo: …
categoria: Negócios | Tecnologia | Inteligência artificial
ambito: Nacional | Regional | Internacional
data: AAAA-MM-DD
imagem: /blog/img/<slug>.jpg
---
```

## Publicar artigos que o cliente envia

1. Gravar cada `.md` em `blog/artigos/`, com o cabeçalho acima.
   - Se o cliente mandar outro formato, converter.
   - Corrigir a ortografia para a variante do site e avisar.
2. Capas: `python3 scripts/capas_blog.py pasta-do-site "slug=foto.jpg:0.3"`.
   - O número escolhe o recorte vertical: 0 é o topo, 1 é o fundo.
   - Abrir as capas e confirmar que o assunto ficou no quadro.
   - O script acrescenta a linha `imagem:` ao artigo.
3. `cd pasta-do-site && python3 blog/construir.py`.
4. Correr `verificar.mjs` (captura do blog) e publicar.

Quando o cliente envia uma imagem para um artigo que ainda não existe, guardá-la em `blog/img/` com o slug previsto e anotar que falta o texto.

## Automação

O `LEIA-ME.md` do blog tem as regras para uma automação (por exemplo, Manus + Claude) que escreve notícias:
- só notícias reais, com fonte e ligação;
- resumo com palavras próprias;
- imagens só com direitos de uso;
- no máximo 60 notícias no JSON.

A automação segue os mesmos três passos: criar o `.md`, correr `construir.py` e fazer commit.
