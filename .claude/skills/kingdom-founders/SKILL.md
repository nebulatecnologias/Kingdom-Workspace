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
| Posts por semana | `content/founders/semana-NN/index.html` (cada `.post` com `data-file`) → `node content/founders/render-posts.mjs semana-NN` gera `semana-NN/png/<data>-<slug>/NN.png`; `visao-geral.png` para revisão |
| Render | `node content/brand/founders/render.mjs [templates] [book]` (Playwright; usa `/opt/pw-browsers/chromium`) |

**Fontes Aptos:** licença Microsoft, fora do git (`.gitignore`). Antes de renderizar, descarregar da Drive (pasta `aptos-font` dentro de SOCIAL MEDIA - OPUS 5) os `.ttf` light, regular (`aptos.ttf`), semibold, bold e black para `content/brand/founders/fonts/`. Sem eles o render cai na Inter e o resultado está errado. Instrument Serif e Inter já estão no repositório.

**Site da mentoria:** founders.kingdomcompny.com não abre neste ambiente; ler pelo Vercel MCP (equipa `team_Ztm4j08esZm62NRjArXDIpQF`, projeto `kingdom-founders`, `web_fetch_vercel_url` no deployment de produção).

## Marca

- Os carrosséis "The Legacy" (1 imersão + 7 sessões, 70+ alunos, NPS 93) são de uma edição especial passada: não usar esses dados.
- Mentoria de 4 semanas, 8 sessões ao vivo (ter e qui, 19h30, Google Meet), 33 vagas por turma. Entrada por **aplicação**, não por pagamento: toda a CTA leva a "Faz a tua aplicação" / link na bio.
- Crença central: "os maiores bloqueios de um founder são invisíveis". Metodologia da **Tricotomia**: Espiritualidade, Desenvolvimento pessoal, Performance no negócio.
- Avatar: empreendedor moçambicano que sabe o que fazer mas não avança (adia, negócio depende dele, medo de aparecer, procura validação, meses bons e recuos). Bloqueios: perfeccionismo, síndrome do impostor, execução, autoimagem, aprovação, rejeição, escassez, crenças limitantes, autossabotagem.

## Voz

- Arquétipo **Mago** (transformação) com voz de **Sábio** (princípio e método), toque de Governante.
- Sempre **"tu"**, português de Moçambique/Portugal (equipa, telemóvel, "estás a construir"). Direto, profundo, fé prática, exigente.
- **"Founder" não é o leitor:** a pessoa só passa a ser founder depois de entrar na mentoria. Na copy, tratar o leitor por "tu" e, quando for preciso nomear, "empreendedor", "quem empreende" ou "dono de negócio". "Founder" só para membros da mentoria e no nome da marca.
- Usar: bloqueios invisíveis, execução, identidade, propósito, princípios do Reino, mentalidade de governo, clareza, estrutura.
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
- **Capa com foto (padrão aprovado a 14/10/2026, capa de 19/10 "Quem sou eu?"):** foto nos primeiros 1060 px com o rosto no terço superior; título em **Aptos Bold** (700) a ~92 px, centrado, 3 linhas curtas; a primeira linha em Névoa e as outras em branco; **Instrument Serif itálico dourado na palavra-chave do gancho** (a que nomeia a dor ou a virada, ex.: "*problema*"), não necessariamente a última palavra; subtítulo de 2 a 3 linhas a 34 px logo por baixo (34 px de distância) com o laço aberto e o fim a branco semibold; título e subtítulo como um bloco, a 262 px do fundo; "ARRASTE PARA ENTENDER" a 84 px do fundo. Código de referência: `content/founders/semana-01/index.html`, slide `2026-10-19-quem-sou-eu/01.png`.
- **Estático de frase única (regras do utilizador, 14/10/2026; Princípios do Reino e estáticos de frase):** a arte tem **uma só frase**, sem etiqueta, sem título + versículo + aplicação; o versículo e a referência vão para a legenda. O tom muda com o pilar:
  - **Espiritualidade:** frase **apelativa, esperançosa, que gera vontade de partilhar** (o leitor quer enviá-la a alguém ou pô-la no story): promessa, encorajamento, gratidão, fé que levanta, inspirada no versículo do post. Nada de acusar o leitor. Referências em `content/brand/founders/referencias-frases/espiritualidade/` (@mentedesucessoo, @sejaleaoo). Design: fundo preto (luz âmbar subtil no topo), **Aptos Bold em caixa alta** a ~84 px, alinhado à esquerda, o fim da frase em dourado, @kingdomfounderss logo por baixo do texto. Pode levar foto escura de fundo quando o utilizador a enviar. Exemplo aprovado: 21/10 "Deixa de correr atrás das coisas. Busca primeiro o Reino de Deus, e as coisas vão correr atrás de ti."
  - **Negócios e Desenvolvimento Pessoal:** frase **direta e provocadora, estilo Alex Hormozi**: contraria o que o leitor pensa, 1 a 3 frases curtas, até ~25 palavras, fecho seco. Referências em `content/brand/founders/referencias-frases/negocios-dp/`. Design: fundo preto, Aptos Regular branco a ~92 px alinhado à esquerda, frase final numa linha própria em Aptos SemiBold dourado, símbolo pequeno em baixo.
- **Nunca usar fotos que o utilizador não enviou para o post** (nem as do site): deixar placeholder (`.ph` com a descrição da foto pretendida) até ele as enviar.
- Fotografia: pessoas reais das sessões, ambiente escuro, luz âmbar, olhar fora da câmara. Nunca banco de imagens nem texto sobre rostos.

## Direção das imagens geradas (IA)

Referências do utilizador em `content/brand/founders/referencias-imagem/` (01 cercada de câmaras, 02 imóvel na multidão em desfoque, 03 editorial de escritório, 04 buraco da fechadura, 05 silhuetas). O que têm em comum e o que os prompts devem pedir:

- **Metáfora visual da mensagem do post**, não uma cena literal: câmaras e telemóveis = julgamento dos outros; multidão em desfoque de movimento à volta de alguém imóvel = firmeza no meio do ruído; silhuetas sem rosto = opiniões/rótulos; buraco da fechadura, porta entreaberta, um só candeeiro numa sala escura = introspeção e revelação; mãos a entrar no enquadramento = dependência.
- **Um único sujeito nítido**, muitas vezes a olhar para a câmara, expressão contida; o resto desfocado, em silhueta ou em penumbra.
- **Qualidade de campanha editorial/moda:** cinematográfica, fotorrealista, grão de película 35 mm, pretos profundos, muito espaço negativo.
- **Luz da marca:** fundo escuro com uma luz quente âmbar (focos, candeeiro, porta); luz fria só se o conceito pedir (flashes de câmaras).
- Sujeitos negros moçambicanos com aparência real; roupa elegante (fato, gola alta, blazer).
- Composição para o layout: rosto/sujeito no terço superior e zona escura limpa onde entra o texto; formato do modelo (4:5, ou 1:1 na capa B com foto).
- Sempre "sem texto, sem logótipos, sem marcas de água".

## Linha editorial (aprovada a 14/10/2026)

- 6 publicações/semana. A equipa (Claude) produz **seg, qua, sex**: semana ímpar Carrossel-Estático-Carrossel, semana par Estático-Carrossel-Estático. Os **3 Reels** são do Shelton: deixar os dias vazios, não criar linhas nem copy para eles.
- Funil sempre **40% topo / 40% meio / 20% fundo** (em cada 10: 4/4/2). Topo = alcance; meio = autoridade, educativo denso; fundo = conversão para a aplicação.
- Séries fixas: Bloqueios Invisíveis (DP, meio, carrossel A), Princípios do Reino (Esp, topo, estático de frase única), Prosperidade com Princípios (Esp, meio, carrossel B), Mentalidade de Governo (Neg, meio, carrossel B), Verdade Incómoda (topo, estático C), Dentro da Founders (fundo).
- Versículos: Almeida Revista e Corrigida, com referência. Depoimentos só reais e autorizados.

## Notas de séries

- **Série 5 Perguntas** (da referência "How To Know The Purpose Of Your Life", Myles Munroe, youtube gTgcGlnK1kk). Um carrossel por pergunta, Desenvolvimento Pessoal, meio de funil, estilo A:
  1. Quem sou? (identidade): 19/10/2026, escrito.
  2. De onde venho? (origem)
  3. Porque estou aqui? (propósito; emprego ≠ propósito)
  4. O que consigo fazer? (potencial; recuperar sonhos e agir)
  5. Para onde vou? (destino)
  Cada post foca só a sua pergunta e o CTA pede para guardar e visitar o perfil para as restantes. As perguntas 2 a 5 ainda não têm data; cuidado para não repetir o Génesis 1:27 do post 1 (para a origem, preferir Jeremias 1:5). Encaixar nas próximas semanas sem quebrar 30/40/30 e 40/40/20.

- **Liderança pessoal** (referência "Discovering Your Personal Leadership", youtube ueA073Q6a88): o post de 23/10 trata só "liderança não é cargo, é mentalidade". Responsabilidade, visão, influência e "desenvolver pessoas" ficam disponíveis para posts próprios de Negócios (Mentalidade de Governo).

## Fluxo das referências (Notion)

O processo completo entre agentes (estados, responsáveis, rotina) está na skill **kingdom-orquestrador**; esta secção define as regras de conteúdo de cada passo.


1. As referências chegam por duas vias: folhas do Manus 2.0 na pasta "REFERENCIAS - MANUS 2.0" (o Claude copia-as para o Notion, completando as linhas que o utilizador já tenha começado em vez de as duplicar) ou o utilizador adiciona-as diretamente na base "Ideias de Conteúdo · Kingdom Founders" (título na coluna "Titulo do Conteúdo", Referência, às vezes Assunto/Formato), com **Resumo da Ideia** (2 a 3 frases) e **Principais Ensinamentos** (3 a 5, um por linha). Estas duas colunas são a fonte principal da copy; se estiverem vazias, pedir ao utilizador antes de escrever.
2. O Claude lê as linhas em "Brainstorming" sem Pilar e preenche **Pilar, Funil, Série, Formato, Categoria, Assunto** e a **Data de Publicação** (só seg/qua/sex, respeitando a alternância de formatos, 30/40/30 nos pilares, 40/40/20 no funil e nunca dois estilos C seguidos). Não publica nada nem muda o Status para Publicado.
3. As copies seguem o conteúdo das referências (não inventar temas fora delas); o calendário-modelo da Linha Editorial é só exemplo.
4. Copy: um documento Claude Docs por post (Ficha, Slides ou Arte, Legenda, Notas para o design), por semana de publicação. Só depois de o utilizador aprovar é que o link de cada documento vai para a coluna **Script** da linha no Notion. Nesse momento o Status passa de "Brainstorming" para "Em Produção" (fase de design). Sem créditos ao autor da referência (decisão do utilizador, 14/10/2026).
5. **Imagens geradas (ChatGPT):** cada linha tem a coluna **Prompt de Imagem**. O Claude escreve-a (em português, pronta a colar) e o utilizador gera a imagem no ChatGPT, que lê o Notion. Estrutura fixa: onde entra (CAPA/slide), "Cria uma fotografia editorial fotorrealista", formato (4:5 1080x1350, ou 1:1 1080x1080 na capa estilo B com foto em cima), cena concreta ligada ao tema do post (empreendedor moçambicano, ação, objetos), estilo (escuro, luz âmbar, sombras profundas), composição (rosto no terço superior e zona escura onde entra o texto), lente/grão, "aparência real", "sem texto, sem logótipos, sem marcas de água". Layouts só de texto levam "Sem imagem: …". Posts de conversão preferem foto real das sessões. Prompts de posts sem copy ficam "[Provisório]" e são revistos quando a copy é escrita. Até a imagem chegar, o design leva placeholder.
6. Links do YouTube/Instagram/LinkedIn não abrem neste ambiente: usar o título, o texto da página no Notion e o que o utilizador escrever; se faltar contexto, perguntar.

## Escrita dos carrosséis (padrão do utilizador)

**Meio de funil: seguir sempre o modelo aprovado em [`modelo-meio-de-funil.md`](modelo-meio-de-funil.md)** (regras + texto completo do carrossel "Quem sou eu?"). Ler antes de escrever qualquer carrossel educativo/aprofundado.

Tirado dos carrosséis "Decidi acabar com a mentoria Kingdom Founders do jeito que conhecias" e "O que é a mentoria Kingdom Founders". Vale sobretudo para os educativos de meio de funil.

- **Gancho que quebra o scroll.** O título da capa (e do estático) prende-se a uma **dor**, um **desejo** ou uma **dúvida** que o conteúdo resolve: cenas concretas do leitor ("Se um mês mau te faz duvidar de quem és…", "Se o teu negócio para quando tu paras…"), perguntas incómodas ou uma afirmação que contraria o que ele pensa. Nunca um título descritivo ("5 elementos da liderança"). Na copy, indicar o tipo de gancho e propor 2 alternativas nas notas. O estático leva gancho em cima e o versículo/texto por baixo.
- **Narrativa, não frases soltas.** O carrossel é um texto contínuo, cortado em slides. Cada slide fecha com uma **frase-ponte** isolada que abre o seguinte: "Mas o motivo foi forte demais para ignorar…", "E a pergunta que sempre vinha era:", "E a decisão chegou.", "Através de uma combinação entre". O slide seguinte começa a responder a essa ponte.
- **Arco:** gancho na capa com um laço aberto → identificação (situações ou perguntas em que o leitor se reconhece) → tensão/custo do problema → a virada (a afirmação central, em destaque) → o nome do conceito ou a causa real (causa vs efeito) → o desenvolvimento por pontos → aplicação ou convite.
- **Resumir sem matar o desenvolvimento:** cada ensinamento da referência ganha explicação e consequência, não só um título.
- **Ritmo e tamanho:** carrosséis com **10 slides** (regra do utilizador, 14/10/2026). Parágrafos de 1 a 3 frases, ponte sozinha na última linha, cerca de 25 a 50 palavras por slide de texto; se passar disso, divide em dois slides ligados por uma ponte. No design, corpo a 42 px, frase principal a 58 px, versículo em destaque a 52 px.
- **Destaques:** a frase central de cada slide em dourado (negrito na copy). Vermelho só quando necessário: no máximo uma frase de dor por carrossel (o problema que o leitor sente), nunca em títulos nem em mais de um slide; indicar na copy em "Notas para o design".
- **CTA de meio de funil:** guardar, partilhar ou comentar com uma pergunta concreta; sem botão de aplicação.

## Instagram

- @kingdomfounderss · "KINGDOM FOUNDERS | MENTORIA" · Formação · founders.kingdomcompny.com.
- Destaques alternam **de propósito** preto/ícone dourado e branco/ícone preto (Eventos, Sobre, Membros, Bastidores, Cadastro). Não "corrigir".
- Grelha: alternar estilos A, B, C; nunca dois cartões claros seguidos.

## Processo de trabalho com o utilizador

- Uma etapa de cada vez; só avançar com aprovação explícita. Referências de conteúdo vêm do utilizador ou do Manus 2.0 (pasta na Drive); o Manus v1 automático foi abandonado por baixa qualidade e o Manus não gera copy.
- Pastas na Drive só se criam quando a etapa que as usa estiver definida.
- **Entrega de design (regra do utilizador):** primeiro enviar só a `visao-geral.png` (todas as peças lado a lado) para aprovação. Os PNG finais para baixar só se enviam depois de o utilizador aprovar essa visão geral. Vale também para correções: nova visão geral primeiro, PNG depois.
- Imagens e PNG finais entregam-se no chat do Claude (o utilizador baixa daí); a Drive não é usada para imagens.
- Antes de entregar: rever ortografia (a referência original tinha "Centenasde"), aplicar a checklist do Brand Book e ver o render.

## Histórico

| Data | Versão | Mudança |
|---|---|---|
| 14/10/2026 | 1.18 | Estáticos de frase: Espiritualidade apelativa e partilhável (caixa alta, Aptos Bold); Negócios e DP diretos ao estilo Hormozi. |
| 14/10/2026 | 1.17 | Estáticos de frase única: sem etiqueta, uma só frase provocadora, versículo na legenda (referências em referencias-frases). |
| 14/10/2026 | 1.16 | Padrão da capa com foto: título Aptos Bold ~92 px, Instrument Serif na palavra-chave, bloco título+subtítulo a 262 px do fundo. |
| 14/10/2026 | 1.15 | Carrosséis com 10 slides: texto dividido (25 a 50 palavras por slide) com pontes novas; corpo 42 px. Modelo de meio de funil atualizado. |
| 14/10/2026 | 1.14 | Sem Drive para imagens: ChatGPT gera e avisa, utilizador envia ao Claude, PNG finais entregues no chat. |
| 14/10/2026 | 1.13 | Orquestrador entre Manus, Claude, ChatGPT e utilizador (skill kingdom-orquestrador); estados novos no Notion. |
| 14/10/2026 | 1.12 | Direção das imagens IA a partir das 5 referências do utilizador (metáfora visual, campanha editorial). |
| 14/10/2026 | 1.11 | Coluna "Prompt de Imagem" no Notion para gerar imagens no ChatGPT. |
| 14/10/2026 | 1.10 | Regra de entrega: visão geral para aprovação antes dos PNG. |
| 14/10/2026 | 1.9 | Design da semana 1; fotos só com placeholder até o utilizador as enviar. |
| 14/10/2026 | 1.8 | Modelo de escrita de meio de funil gravado (modelo-meio-de-funil.md), a partir do carrossel "Quem sou eu?" aprovado. |
| 14/10/2026 | 1.7 | Nota da série 5 Perguntas; post de 19/10 passa a ser 1/5 (identidade). |
| 14/10/2026 | 1.6 | Ganchos ligados a dor, desejo ou dúvida, com 2 alternativas por post. |
| 14/10/2026 | 1.5 | Leitor não é "founder" (só os membros da mentoria); usar "tu" ou "empreendedor". |
| 14/10/2026 | 1.4 | Vermelho só quando necessário; dados do The Legacy não se usam (edição especial passada). |
| 14/10/2026 | 1.3 | Padrão de escrita dos carrosséis (narrativa com frases-ponte); copy em Claude Docs; sem créditos às referências. |
| 14/10/2026 | 1.2 | 12 referências Myles Munroe (Manus 2.0) no Notion, agendadas de 19/10 a 13/11/2026: pilares 4/5/3, funil 5/5/2. |
| 14/10/2026 | 1.1 | Linha editorial aprovada; base Notion "Ideias de Conteúdo · Kingdom Founders" criada para as referências. |
| 14/10/2026 | 1.0 | Base aprovada: marca, avatar, Mago com voz de Sábio, pilares 30/40/30, estilos A/B/C, perfil Instagram, símbolo SVG. |
