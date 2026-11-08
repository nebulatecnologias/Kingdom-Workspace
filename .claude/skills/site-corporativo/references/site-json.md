# site.json

O `novo_site.py` lê este ficheiro. Com `--marca marca.json` (da skill identidade-visual), o nome, o slogan, as cores, a letra, o símbolo, o logótipo e os contactos vêm do `marca.json`. Nesse caso o `site.json` só precisa do que é próprio do site, e um campo escrito aqui ganha sempre ao do `marca.json`.

Os caminhos de ficheiros são relativos à pasta do `site.json`.

```json
{
  "nome": "Atlas Consultores",
  "slogan": ["Gestão com rumo.", "Estratégia, finanças e pessoas para empresas que querem crescer."],
  "frase_abertura": "Dispomos de soluções integradas, orientadas a resultados, para cada fase do seu negócio.",
  "descricao": "Consultoria de gestão, finanças e recursos humanos para PME em Moçambique.",
  "fonte": "Inter Tight",
  "logotipo": "logotipo.svg",
  "simbolo": "simbolo.svg",
  "grupo": "",
  "cores": {
    "principal": "#0B4F4A", "fundo": "#F7F5EF", "acento": "#E8A33D", "acento_texto": "#9A5B0C",
    "texto": "#10211F", "texto_secundario": "#5C6B68", "linha": "#E3E0D6"
  },
  "contactos": {
    "email": "geral@atlas.co.mz",
    "telefones": ["+258 84 000 0000"],
    "moradas": [{"cidade": "Beira", "pais": "Moçambique", "linhas": ["Rua Exemplo, n.º 10", "Beira"], "principal": true}],
    "maps_coords": [-19.8436, 34.8389],
    "maps_link": "https://www.google.com/maps/place/…"
  },
  "numeros_titulo": "O parceiro certo para cada fase do seu negócio",
  "numeros": [
    {"valor": 120, "texto": "empresas acompanhadas"},
    {"valor": 13, "sufixo": " mil", "texto": "alunos formados"}
  ],
  "quem": {
    "titulo": "Um parceiro estratégico para o crescimento da sua empresa.",
    "paragrafos": ["A Atlas Consultores é…", "Atuamos em três áreas…"],
    "grupo_descricao": "Negócios, educação e tecnologia"
  },
  "servicos_entrada": "Três áreas, cada uma com soluções à medida…",
  "servicos": [
    {
      "area": "Gestão",
      "frase": "Planos e processos que dão rumo à empresa.",
      "icone": "alvo",
      "servicos": [
        {"nome": "Plano de Negócios", "resumo": "Para bancos e investidores"},
        {"nome": "Advisory · Aconselhamento Empresarial", "curto": "Advisory", "resumo": "Para decisões importantes"}
      ]
    }
  ],
  "seccoes": {"frentes": false, "blog": true}
}
```

## Campos

| Campo | Obrigatório | O que faz |
|---|---|---|
| `nome` | sim | Usado no título da página, no rodapé, no `aria-label` do logótipo e no gerador do blog. |
| `slogan` | sim | Duas partes: o título da abertura em duas linhas. |
| `frase_abertura` | não | Texto por baixo do título da abertura. |
| `descricao` | não | `<meta name="description">`. |
| `fonte` | não | Família do Google Fonts (por omissão, Google Sans). |
| `logotipo`, `simbolo` | sim | SVG. O logótipo é a versão horizontal simples. O símbolo precisa de pelo menos um `<path d>`, porque é a partir dele que o script gera o globo de luz, o padrão e o favicon. |
| `padrao`, `favicon` | não | SVG próprios, que substituem os gerados. |
| `grupo` | não | Marca-mãe («Membro da …» no rodapé e em «Quem somos»). Vazio = não aparece. |
| `cores` | sim | As 7 cores da lista. `noite`, `luz` e `lavanda` são opcionais e, se faltarem, o script calcula-as a partir da principal. O script recolore o CSS do modelo inteiro a partir destas cores. |
| `contactos.moradas` | sim | `principal: true` marca a morada que aparece em «Quem somos» e no mapa. |
| `contactos.maps_coords` | não | `[lat, lng]` para o mapa em `contactos.html`. Tirar de `!3d…!4d…` na ligação do Google Maps. |
| `contactos.maps_link` | não | Ligação do botão «Abrir no Google Maps». Usar a ligação exata que o cliente deu. |
| `numeros` | não | Sem números, a secção «Em números» sai. `prefixo` (por omissão «+») e `sufixo` são opcionais. Só números reais e confirmados. |
| `quem` | recomendado | Sem `paragrafos`, fica um texto entre [ ] por escrever e o script avisa. |
| `servicos` | sim | Áreas e serviços. Gera o painel «Serviços» do menu (também em `contactos.html`), a faixa de áreas da abertura, a secção «O que fazemos» e o rodapé. Os endereços são `/<slug-da-area>/<slug-do-servico>`; para outro endereço, usar `slug` ou `url`. `curto` é o nome que aparece no menu. |
| `icone` | não | Um destes: documento, alvo, camara, codigo, grafico, equipa, funil, instituicao, foguete, loja, calendario, trofeu, capelo. |
| `servicos_entrada` | não | Texto da entrada de «O que fazemos». Por omissão, «N áreas, cada uma com soluções à medida…». |
| `seccoes` | não | `false` retira a secção. Chaves: `numeros`, `quem`, `servicos`, `plano`, `porque`, `clientes`, `contratar`, `blog`, `frentes`, `faq`. |
| `ano` | não | Ano do rodapé (por omissão, o atual). |

Uma secção retirada pode deixar ligações sem destino no menu e no rodapé (por exemplo `#noticias` ou `/blog` quando o blog sai). O script lista essas ligações: apagar os itens correspondentes à mão.
