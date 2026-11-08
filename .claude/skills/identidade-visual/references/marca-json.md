# marca.json: a configuração de uma marca

Um ficheiro por marca, na pasta da marca. Os caminhos são relativos a essa pasta. Só `nome`, `simbolo`, `fontes.logotipo` e `cores.principal` são obrigatórios. Os outros campos acrescentam peças ou páginas e, quando faltam, essas peças não aparecem. Exemplo completo: `assets/marca.exemplo.json`.

## Identidade
| Campo | O que é |
|---|---|
| `nome` | Nome completo, como aparece no logótipo («Kingdom Company») |
| `slug` | Prefixo dos ficheiros. Por omissão é o nome em minúsculas com hífens |
| `saida` | Pasta onde tudo é gerado (por omissão `marca`) |
| `descritor` | Linha por baixo do nome no logótipo. Sem ele, não há versões «simples» |
| `slogan` | `["Frase curta.", "Frase de apoio."]`. Fica fora do logótipo (capa, fecho, perfil) |
| `versao` | Texto da versão do manual («Versão 1.0 · Março de 2027») |

## Símbolo e letra
| Campo | O que é |
|---|---|
| `simbolo` | SVG com `viewBox` e um ou mais `<path d>` em fill-rule evenodd, sem transformações (o `tracar.py` gera assim) |
| `fontes.familia` | Nome no Google Fonts, usado no texto do brandbook e dos quadros |
| `fontes.logotipo` | TTF/OTF da letra do logótipo (`fonte.py` descarrega) |
| `fontes.peso_logotipo` | Peso a mostrar na página de construção do nome |
| `fontes.pesos` | `[[400, "Regular", "Texto corrido"], ...]` para a página de tipografia |
| `logotipo.tracking` | Espaçamento entre letras em em (−0,025 = −2,5%) |
| `logotipo.tamanho_horizontal` / `tamanho_vertical` | Tamanho do nome face a um símbolo de 120 (por omissão 60 / 44) |

## Cores
`cores` tem papéis fixos, cada um com `{"nome", "hex", "uso"}`:
- `principal`: obrigatório, a cor do logótipo e dos blocos escuros;
- `fundo` e `acento`;
- `acento_texto`: versão escura do acento para texto pequeno;
- `texto`, `texto_secundario` e `linha`;
- `apoio`: lista de cores extra.

Os outros campos de cor:

| Campo | O que é |
|---|---|
| `cores_logo` | `{"indigo": "#2B2850", "branco": "#FFFFFF", "preto": "#000000"}`. O nome entra no nome do ficheiro. A primeira cor que não é branco nem preto é a principal |
| `cores_icone` | `{"indigo": "#...", "laranja": "#..."}`: um ícone de app por cor |
| `gradiente_tons` | `{"noite", "luz", "lavanda"}`: tons só para gradientes. Por omissão derivam da principal |
| `gradientes` | `[{"nome", "css", "paragens", "uso"}]`: a página de gradientes |
| `proporcao` | `[60, 30, 10]`: fundo, principal e acento |
| `opcoes_paleta` | Para o quadro de escolha: `[{"nome", "nota", "frase", "cores": [{"nome", "hex", "papel", "peso"}]}]`, por esta ordem: fundo, marca, ação |
| `opcoes_tipografia` | `[{"titulos": "Família", "texto": "Família", "nota"}]` |

## Conteúdo do brandbook (tudo opcional)
| Campo | Página |
|---|---|
| `manifesto` | `{"titulo", "texto"}`: página escura a seguir à capa |
| `sobre` | `{"titulo", "subtitulo", "texto": [parágrafos]}`. O título e o subtítulo são, por omissão, o slogan |
| `arquitetura` | `{"marcas": [{"nome", "linhas": [], "ativo": true}], "nota"}`: diagrama marca-mãe e sub-marcas |
| `personalidade` | `{"atributos": [[nome, frase]], "anti": [frases], "lead"}` |
| `areas` | `[{"nome", "titulo", "texto"}]`: o que a empresa faz |
| `metodo` | `{"titulo", "passos": [[nome, frase]]}` |
| `simbolo_titulo`, `simbolo_lead` | Título e texto da página de significado |
| `simbolo_significado` | `[{"pecas": [svg...], "elemento", "nome", "texto"}]`: cada peça a destacar sobre o símbolo em tom claro |
| `simbolo_passos` | `[{"pecas": [svg...], "nome", "nota"}]`: «do traço ao símbolo» |
| `simbolo_construcao` | `{"svg": overlay nas coordenadas do símbolo, "legenda": [[nome, texto]], "lead", "incluir_simbolo": true}`. O símbolo é desenhado por baixo do overlay. Sem este campo, a construção é automática: grelha, eixos, diagonais, círculo inscrito e pontos de ancoragem |
| `simbolo_detalhe` | `{"svg", "titulo", "texto", "formula", "dados": [[k, v]]}`: página escura com um pormenor da construção |
| `frase` | Frase do símbolo em página de gradiente. `<em>palavra</em>` sublinha a palavra com o acento |
| `padrao` | `{"peca": svg com viewBox justo, "densidades": {"densa": [largura_modulo, fracao], "ampla": [...]}, "cores": [[nome, fundo, tinta]], "titulo", "texto"}`. A fração é a altura da peça a dividir pela largura do módulo; tem de ser no máximo 0,5 a dividir pela proporção da peça (largura sobre altura), senão o script reduz |
| `hierarquia` | `[[nome, especificação, tamanho_pt, peso, texto_exemplo]]`. Usar `"@botao"` como texto para mostrar botão e etiqueta |
| `botao` | Texto do botão de exemplo |
| `tom` | `[{"nome", "texto", "dizemos", "evitamos"}]` e `tom_modelo` (parágrafo-modelo), `tom_lead` |
| `aplicacoes` | `[{"imagem", "legenda"}]`: uma página por imagem, a toda a largura |
| `contactos` | `{"email", "telefones": [], "morada": [linhas], "site", "cidade", "nota"}` |
| `destaques` | `[{"nome", "icone"}]`. Ícones: simbolo, bastidores, resultados, agenda, contacto, servicos, depoimentos, perguntas, loja, cursos |
| `destaques_cores` | `[[nome, fundo, tinta]]` |
| `papelaria.tom_simbolo` | Cor do símbolo grande no canto do timbrado (muito clara) |
| `papelaria.canto` | `{"tamanho_mm": 150, "direita_mm": -48, "baixo_mm": -40}`: posição desse símbolo |
| `exemplo_preco` | Preço de exemplo no quadro de tipografia, com a moeda do cliente |
| `papelaria.exemplo_html` | Carta de exemplo para `--exemplo` |
