---
name: kingdom-founders
description: Base estratégica aprovada da Kingdom Founders (mentoria de Shelton Douglas, @kingdomfounderss). Use sempre que o pedido envolver conteúdo, copy, posts, carrosséis, estáticos, legendas, bio, destaques, design ou o Brand Book da Kingdom Founders, ou quando replicar o processo de conteúdo para outra marca Kingdom a partir da Founders.
---

# Kingdom Founders: base estratégica v1.0

Aprovada pelo utilizador a 14/10/2026. É a fonte de verdade para tudo o que se produz para a Founders. Não alterar estas decisões sem o utilizador pedir; se ele mudar alguma, atualizar este ficheiro, o Brand Book e o documento na Drive, e acrescentar uma linha ao histórico.

## Onde está tudo

| O quê | Onde |
|---|---|
| Documento-base (Drive) | SOCIAL MEDIA - OPUS 5 / 01. Kingdom Founders / 00. Base Estratégica / "Base Estratégica \| Kingdom Founders \| v1.0" (Doc `15TJbxYRbhuyFaQGEl0xiMKqVBaN2d-kCaDc_NJuH6Ms`, pasta `1xSW5azBBy-Czj77TGsP4Buv-3ho4Gitj`) |
| Linha Editorial (Drive) | mesma pasta: "APROVADO \| Linha Editorial \| Kingdom Founders \| v1.0" (Doc `128aSadxDIsg6UybvOLol45WunMvivGO5hHtb2yGO5hs`) |
| Ideias de Conteúdo (Notion) | base de dados `22a60e2fbe2b408d900a68bccda89351`, data source `collection://0027e540-aab6-46d9-bfe7-7b20c5df80c7`; vistas tabela, "Por estado" e "Calendário". Cópia da base do utilizador "📒 Ideias de Conteúdo" (`2e129df4bfa883f994480163262aea94`) com Pilar, Funil e Série a mais |
| Referências Manus 2.0 (Drive) | pasta "REFERENCIAS - MANUS 2.0" (`1nqqySy9i7FuLJWky5jMHo-qovqi6eHFP`): folhas com Titulo do Conteúdo, Resumo da Ideia, Principais Ensinamentos, Referência. Ler como CSV (`download_file_content`, `text/csv`) e passar para o Notion |
| Raiz Social Media (Drive) | `1xxX_1mQbos3R2JX6upSJLtgz9fTCdG_X`; pasta da marca `18RrVtaT7qhpdTwllDvF3jd_vLBKVFvLo` |
| Brand Book (27 páginas) | `content/brand/founders/brand-book.html` → `Kingdom-Founders-Brand-Book.pdf` |
| Tokens e fontes | `content/brand/founders/brand.css` |
| Modelos de post (7) | `content/brand/founders/templates.html` → `templates/01–07.png` |
| Símbolo vetorial | `content/brand/founders/assets/kingdom-founders-simbolo{,-preto,-branco}.svg` (reconstruído do PNG do site; validar com designer antes de impressão grande) |
| Fotos do site | `content/brand/founders/assets/01_hero-bg-img.webp`, `06_shelton-douglas.webp` |
| Render | `node content/brand/founders/render.mjs [templates] [book]` (Playwright; usa `/opt/pw-browsers/chromium`) |

**Fontes Aptos:** licença Microsoft, fora do git (`.gitignore`). Antes de renderizar, descarregar da Drive (pasta `aptos-font` dentro de SOCIAL MEDIA - OPUS 5) os `.ttf` light, regular (`aptos.ttf`), semibold, bold e black para `content/brand/founders/fonts/`. Sem eles o render cai na Inter e o resultado está errado. Instrument Serif e Inter já estão no repositório.

**Site da mentoria:** founders.kingdomcompny.com não abre neste ambiente; ler pelo Vercel MCP (equipa `team_Ztm4j08esZm62NRjArXDIpQF`, projeto `kingdom-founders`, `web_fetch_vercel_url` no deployment de produção).

## Marca

- Mentoria de 4 semanas, 8 sessões ao vivo (ter e qui, 19h30, Google Meet), 33 vagas por turma. Entrada por **aplicação**, não por pagamento: toda a CTA leva a "Faz a tua aplicação" / link na bio.
- Crença central: "os maiores bloqueios de um founder são invisíveis". Metodologia da **Tricotomia**: Espiritualidade, Desenvolvimento pessoal, Performance no negócio.
- Avatar: empreendedor moçambicano que sabe o que fazer mas não avança (adia, negócio depende dele, medo de aparecer, procura validação, meses bons e recuos). Bloqueios: perfeccionismo, síndrome do impostor, execução, autoimagem, aprovação, rejeição, escassez, crenças limitantes, autossabotagem.

## Voz

- Arquétipo **Mago** (transformação) com voz de **Sábio** (princípio e método), toque de Governante.
- Sempre **"tu"**, português de Moçambique/Portugal (equipa, telemóvel, "estás a construir"). Direto, profundo, fé prática, exigente.
- Usar: founder, bloqueios invisíveis, execução, identidade, propósito, princípios do Reino, mentalidade de governo, clareza, estrutura.
- Evitar: enriquecer rápido, fórmula mágica, segredo, resultados garantidos, jargão em inglês, tom de sermão ou culpa. Versículos sempre com referência correta e no contexto.
- Frases-assinatura: "Não basta ter uma visão. Precisas de te tornar capaz de a carregar." · "Os mesmos desafios. Uma pessoa diferente a enfrentá-los." · "20% é o método. 80% é a tua execução."

## Pilares (em cada 10 publicações)

- **Espiritualidade 3** (Princípios do Reino; prosperidade e crescimento à luz da Bíblia)
- **Desenvolvimento Pessoal 4** (bloqueios invisíveis)
- **Negócios 3** (oferta, posicionamento, vendas, finanças, processos, equipa, IA)
- Nenhum pilar mais de uma semana sem publicação.

## Visual

- Cores: Dourado `#C29D5A`, Dourado claro `#D6B87B`, Areia `#E8D9B8`, Preto `#000000`, Névoa `#CBC8C8`, Branco. Dourado escasso: uma palavra por título, símbolo, detalhes. Luz âmbar vem da foto.
- **Título (spec do Photoshop):** Aptos SemiBold, entrelinha 0,886× o tamanho, tracking −80 (`-0.08em`), kerning ótico. Palavra emocional em **Instrument Serif sempre Italic**, 1,169× o tamanho da Aptos, mesma entrelinha e tracking, dourada. Em CSS: classes `.ttl` (com `--ts`) e `.it` de `brand.css`. Instrument Serif nunca direita.
- **Três estilos de título, um só por post:**
  - **A Editorial:** abertura em Névoa, frase em branco, uma palavra em itálico dourado; centrado; "ARRASTE PARA ENTENDER". Para histórias, revelações, princípios do Reino.
  - **B Contraste de peso:** Aptos Light + destaque Aptos Bold (`.wt`); botão dourado `.go-pill`. Para listas e carrosséis educativos com foto.
  - **C Cartão claro:** fundo branco, Aptos Regular caixa alta + destaque Aptos Black (`.card-c`), à esquerda, botão dourado. Para ganchos diretos sem foto.
- Post 1080×1350: margens laterais 90 px, número centrado a 92 px do topo, foto nos primeiros 1060 px com rosto no terço superior, texto a partir de 55% da altura até 240 px do fundo, máx. 45 palavras por slide. Caixa alta só no estilo C, chamada e etiquetas.
- Fotografia: pessoas reais das sessões, ambiente escuro, luz âmbar, olhar fora da câmara. Nunca banco de imagens nem texto sobre rostos.

## Linha editorial (aprovada a 14/10/2026)

- 6 publicações/semana. A equipa (Claude) produz **seg, qua, sex**: semana ímpar Carrossel-Estático-Carrossel, semana par Estático-Carrossel-Estático. Os **3 Reels** são do Shelton: deixar os dias vazios, não criar linhas nem copy para eles.
- Funil sempre **40% topo / 40% meio / 20% fundo** (em cada 10: 4/4/2). Topo = alcance; meio = autoridade, educativo denso; fundo = conversão para a aplicação.
- Séries fixas: Bloqueios Invisíveis (DP, meio, carrossel A), Princípios do Reino (Esp, topo, estático A), Prosperidade com Princípios (Esp, meio, carrossel B), Mentalidade de Governo (Neg, meio, carrossel B), Verdade Incómoda (topo, estático C), Dentro da Founders (fundo).
- Versículos: Almeida Revista e Corrigida, com referência. Depoimentos só reais e autorizados.

## Fluxo das referências (Notion)

1. As referências chegam por duas vias: folhas do Manus 2.0 na pasta "REFERENCIAS - MANUS 2.0" (o Claude copia-as para o Notion, completando as linhas que o utilizador já tenha começado em vez de as duplicar) ou o utilizador adiciona-as diretamente na base "Ideias de Conteúdo · Kingdom Founders" (título na coluna "Titulo do Conteúdo", Referência, às vezes Assunto/Formato), com **Resumo da Ideia** (2 a 3 frases) e **Principais Ensinamentos** (3 a 5, um por linha). Estas duas colunas são a fonte principal da copy; se estiverem vazias, pedir ao utilizador antes de escrever.
2. O Claude lê as linhas em "Brainstorming" sem Pilar e preenche **Pilar, Funil, Série, Formato, Categoria, Assunto** e a **Data de Publicação** (só seg/qua/sex, respeitando a alternância de formatos, 30/40/30 nos pilares, 40/40/20 no funil e nunca dois estilos C seguidos). Não publica nada nem muda o Status para Publicado.
3. As copies seguem o conteúdo das referências (não inventar temas fora delas); o calendário-modelo da Linha Editorial é só exemplo.
4. Copy: um documento Claude Docs por post (Ficha, Slides ou Arte, Legenda, Notas para o design), por semana de publicação. Só depois de o utilizador aprovar é que o link de cada documento vai para a coluna **Script** da linha no Notion. Sem créditos ao autor da referência (decisão do utilizador, 14/10/2026).
5. Links do YouTube/Instagram/LinkedIn não abrem neste ambiente: usar o título, o texto da página no Notion e o que o utilizador escrever; se faltar contexto, perguntar.

## Escrita dos carrosséis (padrão do utilizador)

Tirado dos carrosséis "Decidi acabar com a mentoria Kingdom Founders do jeito que conhecias" e "O que é a mentoria Kingdom Founders". Vale sobretudo para os educativos de meio de funil.

- **Narrativa, não frases soltas.** O carrossel é um texto contínuo, cortado em slides. Cada slide fecha com uma **frase-ponte** isolada que abre o seguinte: "Mas o motivo foi forte demais para ignorar…", "E a pergunta que sempre vinha era:", "E a decisão chegou.", "Através de uma combinação entre". O slide seguinte começa a responder a essa ponte.
- **Arco:** gancho na capa com um laço aberto → identificação (situações ou perguntas em que o leitor se reconhece) → tensão/custo do problema → a virada (a afirmação central, em destaque) → o nome do conceito ou a causa real (causa vs efeito) → o desenvolvimento por pontos → aplicação ou convite.
- **Resumir sem matar o desenvolvimento:** cada ensinamento da referência ganha explicação e consequência, não só um título.
- **Ritmo:** parágrafos de 1 a 3 frases, frases curtas, ponte sozinha na última linha. Os slides de texto podem passar das 45 palavras (60 a 90 é normal); o corpo desce para 30 a 32 px.
- **Destaques:** a frase central de cada slide em dourado (negrito na copy). Nos carrosséis de referência a dor aparece em vermelho; no feed da Founders usar só dourado salvo indicação contrária.
- **CTA de meio de funil:** guardar, partilhar ou comentar com uma pergunta concreta; sem botão de aplicação.

## Instagram

- @kingdomfounderss · "KINGDOM FOUNDERS | MENTORIA" · Formação · founders.kingdomcompny.com.
- Destaques alternam **de propósito** preto/ícone dourado e branco/ícone preto (Eventos, Sobre, Membros, Bastidores, Cadastro). Não "corrigir".
- Grelha: alternar estilos A, B, C; nunca dois cartões claros seguidos.

## Processo de trabalho com o utilizador

- Uma etapa de cada vez; só avançar com aprovação explícita. Referências de conteúdo vêm do utilizador ou do Manus 2.0 (pasta na Drive); o Manus v1 automático foi abandonado por baixa qualidade e o Manus não gera copy.
- Pastas na Drive só se criam quando a etapa que as usa estiver definida.
- O conector Drive não envia ficheiros grandes (PDF, PNG): entregar no chat e o utilizador coloca-os na Drive.
- Antes de entregar: rever ortografia (a referência original tinha "Centenasde"), aplicar a checklist do Brand Book e ver o render.

## Histórico

| Data | Versão | Mudança |
|---|---|---|
| 14/10/2026 | 1.3 | Padrão de escrita dos carrosséis (narrativa com frases-ponte); copy em Claude Docs; sem créditos às referências. |
| 14/10/2026 | 1.2 | 12 referências Myles Munroe (Manus 2.0) no Notion, agendadas de 19/10 a 13/11/2026: pilares 4/5/3, funil 5/5/2. |
| 14/10/2026 | 1.1 | Linha editorial aprovada; base Notion "Ideias de Conteúdo · Kingdom Founders" criada para as referências. |
| 14/10/2026 | 1.0 | Base aprovada: marca, avatar, Mago com voz de Sábio, pilares 30/40/30, estilos A/B/C, perfil Instagram, símbolo SVG. |
