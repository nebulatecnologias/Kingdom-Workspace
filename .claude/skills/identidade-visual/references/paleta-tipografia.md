# Paleta e tipografia

## Propor a paleta
- **Partir do que a empresa faz e de como quer ser vista, não de gostos soltos.** Uma empresa de desenvolvimento empresarial (estratégia, crescimento, gestão) pede tons corporativos com um acento quente que mostra ação.
- **Duas ou três opções, cada uma com uma tese.** Por exemplo: «índigo e laranja: corporativo e quente», «azul e âmbar: clássico». Mostrar sempre em quadro (`quadros.py ... paleta`), com uma amostra de uso: título, texto e botão.
- **Papéis fixos e proporção 60/30/10.**
  - Fundo: 60%. Um branco quente ou marfim, não o creme amarelado da moda, a menos que o cliente o peça.
  - Principal: 30%. Logótipo, títulos, blocos escuros.
  - Acento: 10%. Botões, preços, destaques.
  - Apoio: texto (quase-preto com o tom da principal), texto secundário (cinza com o mesmo tom) e linha.
- **Contraste medido, não estimado.** O quadro e o brandbook calculam-no.
  - Texto corrido: 4,5:1 ou mais.
  - Texto branco sobre o acento só em letra grande ou a negrito, se ficar entre 3 e 4,5.
  - Se o acento falhar sobre o fundo, criar `acento_texto`, uma versão mais escura, para links e texto pequeno.
- **Seguir os ajustes do cliente à letra.** Exemplos: «o laranja neste tom» com uma imagem de referência, «um branco como o fundo desta interface». Extrair o HEX da referência, regenerar e mostrar de novo.
- **Cores fora da paleta.** As áreas de serviço não têm cores próprias: distinguem-se por ícones e etiquetas. Cores novas por campanha diluem a marca.

## Gradientes
São tons derivados da principal (noite, luz e lavanda) que servem de luz de fundo em capas e no digital. Nunca são cores sólidas nem entram no logótipo. Ficam como proposta até o cliente aprovar e, depois, entram nas regras da marca.

## Escolher a letra
- Sugerir 3 ou 4 famílias modernas do Google Fonts que caibam no tom (técnica, humanista, geométrica) e mostrá-las no quadro de tipografia com o nome da marca, um título, texto corrido e algarismos.
- **Uma só família é uma boa escolha:** simplifica e dá unidade. Na Kingdom ficou só Google Sans, depois de testar Space Grotesk com Google Sans.
- **Pesos.** Títulos em 500, texto em 400, botões e etiquetas em 700. Os números grandes vão em 500 com algarismos tabulares.
- **Verificar os acentos (ã, ç, ê) e a moeda local** no quadro antes de fixar a letra.
- **Descarregar os TTF com `fonte.py`.** O logótipo precisa do ficheiro real para pôr o texto em curvas.

## Descritor e slogan
- **Descritor:** diz o que a empresa faz em 3 a 6 palavras («Desenvolvimento Empresarial, Educação e Tecnologia»). Entra no logótipo, por baixo do nome, com a largura do nome.
- **Slogan:** promessa curta, em duas partes («Um único lugar. Tudo o que precisa para desenvolver o seu negócio.»). Fica fora do logótipo: capa, fecho, perfil, roll-up.
- **Ortografia e tratamento:** manter os do cliente. Se o projeto é em português europeu e o cliente escreve «você», propor a forma europeia («Tudo o que precisa») e dizer-lho.
