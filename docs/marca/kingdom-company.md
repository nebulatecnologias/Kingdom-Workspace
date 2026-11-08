# Kingdom Company · decisões de marca

Base para o brandbook e para o novo site (hoje incompany-v2). Decisões do Shelton, Novembro de 2026.

## Cores (paleta C, aprovada a 08/11/2026)

| Papel | Nome | Hex | Notas |
|---|---|---|---|
| Fundo (60%) | Marfim | `#FAF9F5` | Fundo das páginas e documentos. Cartões em branco `#FFFFFF`. |
| Marca e blocos escuros (30%) | Índigo Kingdom | `#2B2850` | Logótipo, títulos, secções escuras. Branco por cima: 13,8. |
| Ação e destaques (10%) | Laranja | `#FF521A` | Botões, preços, faixa de contacto. Texto branco só grande ou a negrito (19 px+, 3,3). |
| Texto pequeno laranja | Laranja Fundo | `#D63E12` | Links e texto laranja pequeno sobre o marfim. |
| Texto | Tinta | `#1C1A30` | Texto principal (16,1 sobre o marfim). |
| Texto secundário | Cinza Índigo | `#6A6682` | 5,2 sobre o marfim. |
| Linhas | Linha | `#E8E4DC` | Divisórias e contornos. |

Fora da paleta: âmbar e oliva (vinham do post da Aureva). As 5 áreas distinguem-se por ícones e etiquetas, não por cores.

## Tipografia (aprovada a 08/11/2026)

Uma só família: **Google Sans** (a mesma dos outros sites do ecossistema).

| Uso | Peso | Tamanho (web) | Espaçamento |
|---|---|---|---|
| Título principal | 500 | 64–84 px | −4% |
| Título de secção | 500 | 40–56 px | −3,5% |
| Subtítulo | 500 | 22–28 px | −2% |
| Texto corrido | 400 | 17–19 px, entrelinha 1,6 | 0 |
| Botões e etiquetas | 700 / 500 | 15–19 px | 0 |
| Números grandes e preços | 500 | 40–64 px | −4%, algarismos tabulares |

## Referências
- Paleta: post Aureva (cores) e template Koneksi (uso de um só laranja forte, muito espaço, tipografia grande).
- Comparação das 3 paletas: `docs/marca/kingdom-company-paleta-c.png`.

## Nome e arquitectura (R34, 08/11/2026)
- **Kingdom Company**: desenvolvimento empresarial (estratégia, crescimento e gestão). Era a «Kingdom InCompany».
  - Descritor (por baixo do nome, no logótipo): **Desenvolvimento Empresarial, Educação e Tecnologia**.
  - Slogan (fora do logótipo: capas, anúncios, topo do site): **Um único lugar. Tudo o que precisa para desenvolver o seu negócio.**
- **Kingdom Training**: braço educacional.
- **Kingdom Academy**: plataforma de educação online.
- Núcleo: Shelton Douglas (O Conselheiro).

## Símbolo (08/11/2026)
O globo (`docs/marca/globo/`) é o símbolo das três marcas: Kingdom Company, Kingdom Training e Kingdom Academy. O anel é um círculo perfeito; o desenho de dentro segue as medidas do original (`medidas.json`).

## Significado do globo (aprovado a 08/11/2026, igual nas três marcas)

| Elemento | Significado |
|---|---|
| O círculo | **Reino**: a unidade. |
| A estrela | **Direção**: o conhecimento. |
| Os eixos (vertical e horizontal) | **Estrutura**. |
| Os meridianos | **Método**: a metodologia. |

Frase: **É isto que a Kingdom faz, em todas as suas marcas: dá direção, estrutura e método para crescer com propósito.**

Quadro de conceito: `docs/marca/globo/conceito-globo-kingdom.png`. O símbolo é igual nas três marcas e numa só cor; o que muda é o nome do braço por baixo.

## Logótipo (08/11/2026)
- O nome completo («Kingdom Company») numa só linha, Google Sans 500, com o mesmo tamanho e espessura nas duas palavras, convertido em curvas.
- **Horizontal**: globo à esquerda, nome centrado na altura do globo, descritor por baixo com a largura exata do nome.
- **Vertical**: globo em cima, nome e descritor centrados por baixo.
- Versões **simples** (sem descritor) para tamanhos pequenos.
- Cores: índigo, branco e preto. Ficheiros em `docs/marca/logotipo/`, gerados por `tools/marca/logotipo.py`; PNG transparentes em `docs/marca/logotipo/png/` (`node tools/marca/png.mjs docs/marca/logotipo`).

## Variações e regras de uso (08/11/2026)
Quadros: `docs/marca/logotipo/quadros/kingdom-company-variacoes.png` e `kingdom-company-aplicacoes.png`.
- **Uma só cor, sempre.** Índigo sobre marfim ou branco (principal); branco sobre índigo, laranja, preto ou fotografia escura e calma; preto sobre branco para impressão a uma cor. Nunca laranja sobre índigo, nem o logótipo a duas cores.
- **Ícone**: globo branco num quadrado de cantos arredondados, índigo (principal) ou laranja, para app, perfis e redes. **Favicon**: o globo ocupa quase todo o quadrado índigo, para o anel continuar visível a 16 px (`favicon.svg`, `favicon.ico`).
- **Área de proteção**: margem mínima de *x* em todos os lados, em que *x* é a altura do «K» de Kingdom.
- **Tamanhos mínimos** (largura): horizontal 280 px / 70 mm; horizontal simples 120 px / 30 mm; vertical 210 px / 55 mm; vertical simples 100 px / 25 mm; símbolo 16 px / 6 mm. Abaixo do mínimo com descritor, usar a versão simples.

## Por decidir
- Logótipos da Kingdom Training e da Kingdom Academy (descritor e slogan de cada uma), depois do brandbook da Company.
