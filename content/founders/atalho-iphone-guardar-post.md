# Atalho no iPhone: guardar um post num álbum

Recebe o ZIP de um post (ex.: `19-10 Quem sou eu.zip`), extrai os slides e guarda-os pela ordem num álbum de Fotografias com o nome do post. Montas uma vez e depois usas sempre.

Os nomes das ações podem variar um pouco conforme a versão do iOS e o idioma do telemóvel. Procura-as pela barra de pesquisa de ações.

## 1. Criar o atalho

1. Abre a app **Atalhos** → **+** (novo atalho) → dá-lhe o nome **Guardar post**.
2. Toca no **ⓘ** (detalhes) → ativa **Mostrar na Folha de Partilha** → em tipos aceites deixa só **Ficheiros**.

## 2. Ações, por esta ordem

1. **Obter Detalhes dos Ficheiros** → detalhe **Nome** → de **Entrada do Atalho**.
   Dá o nome do ZIP sem a extensão, por exemplo `19-10 Quem sou eu`.
2. **Extrair Arquivo** → de **Entrada do Atalho**.
3. **Filtrar Ficheiros** (sobre os **Ficheiros** extraídos) → **Ordenar por: Nome** → **A a Z**.
   Garante a ordem 01, 02, 03…
4. **Criar Álbum** (se a tua versão do iOS tiver esta ação) → nome: a variável **Nome** do passo 1.
   Se não aparecer, vê a alternativa no fim.
5. **Repetir com Cada** (sobre os ficheiros ordenados do passo 3):
   - dentro do ciclo: **Guardar no Álbum de Fotografias** → item: **Item Repetido** → álbum: o álbum do passo 4.
6. (Opcional) **Mostrar Notificação** → "Post guardado: [Nome]".

Guardar um a um dentro do ciclo mantém a ordem dos slides no álbum.

## 3. Usar

1. Aqui no chat, toca no ZIP do post e descarrega-o (vai para a app **Ficheiros**).
2. Em **Ficheiros**, mantém o dedo no ZIP → **Partilhar** → **Guardar post**.
3. Abre **Fotografias → Álbuns**: o álbum com o nome do post tem os slides por ordem.

## Se não existir a ação "Criar Álbum"

1. Em **Fotografias** cria o álbum à mão: **Álbuns → + → Novo álbum** → escreve o nome do post.
2. No atalho, apaga o passo 4. No passo 5, em **Guardar no Álbum de Fotografias**, escolhe álbum **Perguntar Sempre**.
3. Ao correr o atalho, escolhes o álbum que acabaste de criar. O resto é automático.

## Nota sobre os nomes

Os ZIP vêm com o dia e o título do post, sem acentos (ex.: `23-10 Lideranca nao e cargo`), para não darem erro ao extrair. Os slides vêm numerados: `… - 01.png`, `… - 02.png`, etc.
