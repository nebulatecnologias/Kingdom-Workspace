# Publicar e pré-visualizar

## Antes de publicar

1. Subir a versão em `site.css?v=` e `site.js?v=`, em todas as páginas, incluindo as do blog:
   `grep -rl 'site.css?v=' pasta | xargs sed -i 's/?v=[0-9]*/?v=AAAAMMDDHH/g'`
   Sem isto, o browser do cliente mostra o CSS antigo e parece que nada mudou.
2. Correr `node scripts/verificar.mjs pasta capturas`, sem erros na consola.
3. Fazer commit e push para o ramo de trabalho.

## Vercel

- **Projeto novo:** confirmar antes que o nome está livre (`list_projects`). Respeitar os projetos que o CLAUDE.md proíbe tocar.
- **Pasta do site:** cada site é uma pasta do repositório. O projeto tem de ter `rootDirectory` igual a essa pasta, senão publica a raiz e dá 404:
  - definir com `update_project`;
  - em cada `create_deployment` com `gitSource` (`org`, `repo`, `ref`, `sha`), passar também `projectSettings.rootDirectory`.
- **`vercel.json`:** usar `{"cleanUrls": true, "trailingSlash": false}`. Assim, `/contactos` serve `contactos.html` e `/blog/x` serve `blog/x.html`.
- **`.vercelignore`:** `PRODUCT.md`, `DESIGN.md`, `.impeccable`, `blog/LEIA-ME.md`, `blog/artigos` e `blog/construir.py`.
- **Proteção:** desligar a proteção de pré-visualização (`ssoProtection: null`) para o cliente poder partilhar a ligação.
- **Ligação a enviar:** confirmar com `web_fetch_vercel_url` que a página responde 200 antes de enviar a ligação.
- **Limite diário:** o plano gratuito permite 100 publicações por dia; quando o limite é atingido, a Vercel responde 402. Não insistir:
  - avisar o cliente;
  - publicar a pré-visualização como Artifact;
  - voltar à Vercel no dia seguinte.
- **Domínio próprio:** o DNS pode estar noutro fornecedor (no caso da Kingdom, o Wix). Um subdomínio novo precisa de um CNAME criado pelo dono do domínio.

## Artifact (pré-visualização no Claude)

1. `python3 scripts/artefacto.py pasta-do-site pasta-de-saida [--exemplos]`
2. Publicar com o Artifact:
   - `file_path` = `pasta-de-saida/index.html`;
   - `root` = `pasta-de-saida`;
   - `files` = a lista que o script imprime.

O script:
- passa os caminhos a relativos (`/contactos` → `contactos.html`);
- tira o `<!DOCTYPE>`, o `<head>` e o `<body>` da página principal, porque o Artifact põe o esqueleto;
- retira os favicons e o bloco do mapa (o Artifact bloqueia iframes; fica o botão «Abrir no Google Maps»).

`--exemplos` mostra as notícias de exemplo quando o blog ainda está vazio.

Para atualizar, publicar de novo com o mesmo `file_path`: a ligação fica a mesma. A pré-visualização do Artifact mostra os marcadores «A receber» só se se acrescentar `?previa`, porque o anfitrião não é `localhost` nem `vercel.app`.
