---
name: identidade-visual
description: Cria identidades visuais completas, por etapas aprovadas pelo cliente. Desenha ou recria o símbolo a partir de uma imagem de referência (vectorização limpa, simetria, reconstrução geométrica). Escolhe a paleta e a letra com quadros de opções. Gera o logótipo com o texto em curvas e todas as variações (horizontal, vertical, simples, ícone, favicon, PNG transparentes). Faz o padrão, a papelaria (papel timbrado em PDF, modelo de carta em PowerPoint), as capas de destaques do Instagram e o brandbook completo em PDF A4 horizontal, revisto no fim. Usar sempre que alguém pedir um logótipo, logo, rebranding, marca nova, identidade visual, manual de marca, brandbook, guia de marca, paleta da marca, «recria este ícone em alta qualidade», «vectoriza este logo», variações do logo, papel timbrado ou padrões da marca, mesmo que só peça uma destas peças. Também para replicar a identidade de uma marca-mãe para sub-marcas ou braços.
---

# Identidade visual, por etapas

Uma identidade constrói-se em sequência. Cada etapa assenta na anterior e o cliente aprova antes de se avançar: um símbolo mal decidido estraga o logótipo, um logótipo por aprovar estraga o brandbook. Este percurso saiu de um projeto real, o da Kingdom Company: símbolo do globo, paleta C, Google Sans e brandbook de 35 páginas. A ordem e os cuidados abaixo vêm das correções que o cliente fez nesse projeto.

Os scripts estão em `scripts/` e leem tudo de um ficheiro `marca.json` por marca. Ver [references/marca-json.md](references/marca-json.md); há um exemplo completo em [assets/marca.exemplo.json](assets/marca.exemplo.json). Correr primeiro `python3 scripts/verificar.py` para confirmar as dependências.

## Princípios que atravessam tudo

- **Mostrar, não descrever.** Em cada decisão (paleta, letra, logótipo), gerar um quadro PNG com `quadros.py` e enviá-lo. O cliente decide a ver, não a ler códigos de cor.
- **Uma decisão de cada vez, e aprovada.** No fim de cada etapa, perguntar se aprova e esperar pela resposta antes de avançar. Se o cliente pedir outra ordem («primeiro o logótipo, depois as variações, depois o brandbook»), seguir a ordem dele.
- **Registar as decisões.** Guardar cada escolha aprovada em `marca.json` (fonte de verdade para os scripts) e numa nota `decisoes.md` na pasta da marca, com data, para não se perder entre conversas. Se o projeto tiver regras de negócio registadas, como o CLAUDE.md da Kingdom, seguir também essas regras.
- **O texto do logótipo vai sempre em curvas.** O ficheiro do logótipo não pode depender da letra instalada. `logotipo.py` faz isto com uharfbuzz e fontTools.
- **O logótipo usa uma só cor.** Duas cores e efeitos (sombras, gradientes no logótipo) aparecem como usos incorretos no brandbook.
- **Escrever na língua do cliente.** Se for português, escolher a variante europeia ou brasileira conforme o cliente e manter a mesma em todas as peças. Os textos vão sem jargão, em frases curtas e com dados concretos.
- **Verificar com os próprios olhos.** Depois de gerar, abrir os PNG e corrigir o que estiver cortado ou sobreposto antes de enviar. Fazer no máximo duas rondas: uma verificação, um lote de correções e uma confirmação.

## As etapas

### 0. Briefing e pasta da marca
Antes de desenhar, perguntar:
- o nome;
- o que a empresa faz e para quem;
- as sub-marcas ou braços;
- o descritor (a frase curta por baixo do nome) e o slogan;
- as referências visuais (imagens, marcas de que gosta);
- o símbolo atual, se houver;
- os contactos oficiais.

Criar a pasta da marca com `marca.json` (começar pelo exemplo) e `decisoes.md`. Não inventar dados que o cliente não deu: deixar o campo vazio e perguntar.

### 1. Símbolo
- **Com uma imagem de referência:** `python3 scripts/tracar.py ref.png simbolo.svg --simetria x|y|xy --suavizar 1.0 [--circulo]`. O script grava `simbolo-verificacao.png` com a referência e o traçado lado a lado; abrir e comparar.
  - Se o desenho é geométrico (círculos, elipses, eixos, curvas de concordância), o traçado é só o ponto de partida. Refazer com primitivas exatas, seguindo [references/reconstrucao-geometrica.md](references/reconstrucao-geometrica.md). Foi o que o cliente pediu no globo: «100% circular, os detalhes de dentro devem corresponder exatamente ao desenho».
- **Sem referência:** propor 2 ou 3 conceitos com o porquê de cada um. Desenhá-los em SVG, de preferência a partir de um módulo geométrico com regra de construção, e mostrá-los num quadro.
- **Quadro:** `quadros.py marca.json simbolo` mostra o símbolo grande, sobre claro e escuro, e a 64, 32 e 16 px. Pedir aprovação.
- **Significado (opcional, mas valorizado):** dar ao símbolo um sentido transversal, o mesmo em todas as sub-marcas.
  - Não repetir significados entre elementos. Na Kingdom, «estrela» e «eixo» queriam dizer o mesmo e o cliente corrigiu.
  - Resumir em 3 ou 4 palavras e numa frase.
  - Separar o símbolo em peças SVG (uma por elemento, nas mesmas coordenadas) para as páginas de significado e de construção do brandbook.

### 2. Paleta
- Pôr 2 ou 3 opções em `opcoes_paleta` e correr `quadros.py marca.json paleta`. O quadro mostra as cores, uma amostra de uso e o contraste dos pares.
- Explicar cada opção em uma ou duas frases, ligadas ao que a empresa faz.
- Aceitar ajustes finos («um branco um pouco mais claro», «o laranja neste tom») e regenerar o quadro.
- Fixar os papéis das cores:
  - fundo, principal e acento, na proporção 60/30/10;
  - texto, texto secundário e linha;
  - `acento_texto`, uma versão mais escura do acento para texto pequeno, se o acento falhar 4,5:1 sobre o fundo.
- Detalhes em [references/paleta-tipografia.md](references/paleta-tipografia.md).

### 3. Tipografia
- Sugerir 3 ou 4 letras que combinem com o tom da marca e mostrá-las com `quadros.py marca.json tipografia`. Os pares título e texto vão em `opcoes_tipografia`.
- Uma só família é uma escolha válida e muitas vezes a melhor.
- Depois da escolha, descarregar os TTF com `python3 scripts/fonte.py "Família" 400 500 700 --pasta fontes`.

### 4. Logótipo principal
- Correr `logotipo.py marca.json`, depois `quadros.py marca.json logotipo`, e enviar.
- A regra base: o nome completo numa só linha, com o mesmo tamanho e o mesmo peso em todas as palavras («Kingdom Company», não «Kingdom» grande e «COMPANY» pequeno). Foi uma correção explícita do cliente.
- O descritor fica por baixo, com a largura exata do nome. O slogan fica fora do logótipo.
- Ajustar o tracking, o peso e o tamanho em `marca.json` (`logotipo.tracking`, `fontes.logotipo`) e repetir até aprovar.

### 5. Variações
Já estão geradas pelo passo anterior, em `<saida>/logotipo/`:
- horizontal e vertical, com e sem descritor;
- o símbolo;
- o ícone (um por cor de `cores_icone`);
- o favicon (SVG e ICO);
- PNG transparentes de tudo.

Mostrar as versões e confirmar as cores permitidas, por exemplo nunca o acento sobre a cor principal se o contraste falhar. A área de proteção e os tamanhos mínimos calculam-se no brandbook.

### 6. Padrão
- Perguntar que peça usar (o símbolo inteiro ou um elemento) e configurar `padrao` em `marca.json`. Depois, `padroes.py marca.json`.
- Mostrar as densidades e as cores. Se o cliente escolher só uma variante (na Kingdom, «só a estrela central»), remover as outras.

### 7. Papelaria e digital (quando pedido)
- `papelaria.py marca.json timbrado [--exemplo]`: papel timbrado A4 em PDF, com página 1 e página de continuação.
- `papelaria.py marca.json carta`: modelo de carta A4 em PowerPoint. Precisa de pptxgenjs; o script instala-o se não houver NODE_PATH.
- `destaques.py marca.json`: capas de destaques do Instagram (1080 × 1920, ícone dentro do círculo central).
- O rodapé usa os contactos oficiais de `contactos`. Se o cliente indicar que um contacto só vai no site, não o pôr na papelaria.

### 8. Brandbook
- `brandbook.py marca.json --png --html` gera o PDF A4 horizontal e uma imagem por página.
- Monta só as secções com dados; a estrutura e o estilo estão em [references/brandbook.md](references/brandbook.md).
- Rever todas as páginas em folhas de contacto (9 a 12 páginas por imagem).
- Se a skill `impeccable` existir, correr a revisão dela em duas avaliações isoladas: uma revisão de design feita por um subagente que vê só as páginas, e o detector sobre o HTML. Aplicar as correções num só lote.
- Antes de entregar, confirmar no próprio PDF (com `pdftoppm`, não só no PNG) que as páginas escuras chegam aos quatro bordos.
- As aplicações (mockups) ficam de fora, a menos que o cliente envie as imagens. Nesse caso entram em `aplicacoes`. Para as produzir, ver [references/aplicacoes.md](references/aplicacoes.md), com um prompt pronto para o Gemini.

### 9. Replicar para sub-marcas
Só no fim e depois de o brandbook da primeira marca estar aprovado:
1. copiar o `marca.json`;
2. mudar `nome`, `slug`, `descritor` e o que for próprio da sub-marca;
3. correr de novo os scripts.

O símbolo, a letra e as regras mantêm-se: é isso que faz das marcas uma família.

## Entrega
- Enviar ao cliente cada quadro e cada ficheiro final assim que estiver pronto, com uma frase sobre o que é.
- Dizer o que ficou como proposta à espera de aprovação (por exemplo, os gradientes ou o tom de voz) e o que já está fechado.
- Se o trabalho estiver num repositório git, fazer commit dos ficheiros da marca e dos scripts usados.
