# Escrever o conteúdo

## Fichas

| Parte | Como escrever |
|---|---|
| O que é? | «É um serviço de/que…», numa frase, com o que se faz e para quê |
| Que problema resolve? | «Resolve a dificuldade de…», com a dor principal da descrição do cliente |
| Dores identificadas | 4 a 6 frases curtas do ponto de vista do cliente («Perde concursos por…», «Não sabe…»). Concretas e reconhecíveis numa conversa |
| Quem tem essa dor? | 3 a 5 perfis, cada um com o seu momento («Empresas que vão…», «Quem já…»). É o cliente ideal do serviço |
| Transformação | Antes e depois, numa frase cada. O depois é o que o dono ou o diretor procura, sem prometer o que não depende da empresa |
| O que entregamos? | Os entregáveis do cliente, como ele os descreveu. Os propostos levam `validar` |
| Avença e fronteira | Copiar do material do cliente. A fronteira diz onde acaba o trabalho e quem faz o resto |
| Como apresentar | 2 frases: «Ajudamos/Organizamos… para que…». Usar as palavras permitidas do cliente |

## Texto em geral

- Frases curtas e concretas, sem adjetivos vazios.
- Os títulos dizem o assunto; a primeira frase de cada bloco é a ideia principal.
- Pôr o título a escuro seguido do texto em cinza: «**Relatórios factuais.** Dizemos o que foi confirmado…».
- Os guiões são exemplos para dizer por palavras próprias, não textos para decorar.
- Os campos a preencher vão entre parênteses retos: [nome], [serviço], [dor], [data].
- Se o cliente tiver regras de comunicação, como palavras a evitar ou «nunca garantir», verificar todo o texto contra elas antes de gerar.

## Verificar a grafia

Para a grafia anterior ao Acordo Ortográfico de 1990 (como na DT), procurar formas do acordo que escaparam:
```
grep -noiE "\b(objetiv|ação\b|direção|projeto|atividade|diretor|setor\b|ótimo|exat|atual|fatura|reativa|objeç|seleção|inspeç)\w*" playbook.json
```
Para o acordo de 1990 (como na Kingdom), procurar o contrário: «acção», «projecto», «direcção», «actividade», «objecção».
