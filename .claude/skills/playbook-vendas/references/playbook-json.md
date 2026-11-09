# playbook.json

O exemplo completo está em `assets/exemplo-dt/playbook.json`. Os caminhos de ficheiros são relativos à pasta do JSON, ou absolutos. O texto pode ter `<strong>` e `<em>`.

## marca

| Campo | O que é |
|---|---|
| `nome`, `descritor` | Nome da empresa (rodapés, «Porque escolher a …») e descritor |
| `logo_claro` | Logótipo para as capas escuras (PNG transparente ou SVG branco) |
| `logo_escuro`, `simbolo_escuro` | Logótipo e símbolo para o topo das páginas brancas |
| `fontes` | `{"400": "…ttf", "500": "…ttf", "700": "…ttf"}`, a letra principal |
| `fonte_mono` | Opcional. Letra mono para rótulos e números; sem ela, usa a principal |
| `estilo_capa` | `"globo"` ou `"grelha"` |
| `globo`, `grao` | Só no estilo globo: o SVG do símbolo grande e uma textura de grão |
| `cores` | `primaria`, `primaria_2`, `escura`, `noite` (gradiente das capas); `tinta` (texto), `cinza`, `cinza_2`; `guia` (linhas finas); `realce`; `acento` (rótulos e números); `alerta` (dores e traço das capas); `luz` (segundo tom, ícones); `ok` (verde de «cumprido») |

Kingdom: primária `#2B2850`, acento `#D63E12`, alerta `#FF521A`, luz `#6F67D6`.
DT: primária `#0068FF`, escura `#001655`, noite `#00042D`, acento `#0057E0`.

## rotulos

Textos da interface. Os valores por omissão estão escritos segundo o Acordo Ortográfico de 1990. Para a grafia anterior (DT): `objectivo`, `objeccoes` («Objecções»), `reactivacao`, `direcao` («direcção»). As outras chaves são `seccao`, `execucao`, `conclusao`, `nesta`, `indice`, `ficha`, `de`, `avenca`, `fronteira` e `a_validar`.

## Conteúdo

| Bloco | Campos |
|---|---|
| `capa` | `titulo` (pode ter `<br>`), `subtitulo`, `selo`, `versao` |
| `como_usar` | `lead`, `funcoes` (linhas: secção, SDR, Closer), `fora` |
| `capas` | `"01"` a `"08"`: `[título, introdução, [itens «Nesta secção»]]` |
| `quem_somos` | `pitch` (2 parágrafos), `diferenciais` (`[[título, texto]]`, 5), `regras` opcional: `usar`, `evitar`, `fronteiras` (`[[título, texto]]`) |
| `servicos` | `lead`, `regra` (`[título, texto]`), `notas_pilar` (`{área: nota}`), `fichas` |
| ficha | `area`, `nome`, `oque`, `problema`, `dores[]`, `quem[]`, `antes`, `depois`, `entrega[]`, `validar` (bool), `avenca`, `fronteira`, `pitch` |
| `bant` | `lead`, `criterios` (4: `letra`, `nome`, `en`, `confirmar`, `perguntas[]`, `cumprido`, `alerta`), `regra` |
| `processo` | `lead`, `etapas` (7: nome, quem, objetivo, execução, conclusão, prazo), `estados[]`, `estados_nota` |
| `sdr` | `script`, `objectivo`, `conclusao`, `preco` (`[início, resto]`), `regras[]`, `perguntas_lead`, `perguntas` (`[[pergunta, etiqueta]]`), `criterios`, `ficha_lead`, `ficha[]` |
| `closer` | `lead`, `momentos` (5: nome, tempo, objetivo, execução, avança quando), `abertura`, `decisao`, `diagnostico[]`, `arranque[]` |
| `objeccoes` | `lead`, `colunas` (4 cabeçalhos), `metodo` (3), `lista` (`[[objeção, por trás, pergunta, direção]]`) |
| `followup` | `lead`, `cadencia` (`[[dia, canal, SDR, Closer]]`), `modelos_lead`, `modelos` (`[[canal, título, [parágrafos]]]`), `reactivacao` (`[[título, texto]]`) |
| `contracapa` | `slogan`, `contactos[]` (podem ficar vazios), `interno` |

A secção 01 tem 2 ou 3 páginas: a página de regras só aparece se houver `quem_somos.regras`. Cada ficha ocupa 2 páginas, por isso 12 serviços dão cerca de 59 páginas no total.
