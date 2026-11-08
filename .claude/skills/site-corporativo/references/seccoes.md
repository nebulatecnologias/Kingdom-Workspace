# Secções da página inicial

A ordem segue o modelo. Cada secção abre com um comentário `<!-- Nome -->` no `index.html`; o `novo_site.py` usa esses comentários para retirar secções, por isso não os apagar.

| Secção | Para que serve | Dados de que precisa | Cuidados |
|---|---|---|---|
| **Abertura** | Dizer em segundos o que a empresa é. Leva aos dois caminhos de contacto: «Pedir cotação» e «Avaliação inicial». | Slogan em duas partes, uma frase de abertura e as áreas (faixa por baixo). | Fundo com o gradiente da marca e o globo quase apagado. O título é curto e a frase de abertura diz a promessa, não a lista de serviços. |
| **Em números** | Prova rápida. | 3 ou 4 números reais, confirmados pelo cliente. | O título não repete o da abertura. Os números contam ao entrar no ecrã. |
| **Quem somos** | Quem é a empresa, de onde, a que grupo pertence. | Bio curta e morada principal (ligação para `/contactos`). | O fundador não aparece se o cliente não quiser. Usar o nome legal exato do grupo, por exemplo «SDG (Pty) Ltd». |
| **O que fazemos** | Encontrar o serviço. | Gerado a partir de `servicos`. | Sem preços nem planos se o cliente o decidir. Cada área tem uma frase de valor e não uma descrição. |
| **Metodologia** (bento) | Mostrar como se trabalha. | Fases reais do método, as frentes de serviço da órbita e os indicadores que o relatório mede. | Três cartões: o Gantt com as fases, a órbita «um só parceiro» e o relatório com indicadores. O Gantt usa `--t` e o JS. A órbita usa `requestAnimationFrame`. |
| **Porque trabalhar connosco** | Razões para escolher esta empresa e não outra. | 4 razões com prova: rede, certificações, sectores e entregáveis. | Cada razão tem de dizer algo que as outras secções não dizem. A faixa de entregáveis mostra coisas concretas que o cliente recebe. |
| **Quem confia em nós** | Prova social. | Logótipos de clientes, testemunhos reais e certificações da equipa. | Carrossel infinito. Sem testemunhos reais, os marcadores só aparecem na pré-visualização. As certificações são «do nosso quadro de consultores», não da empresa. |
| **Como nos contratar** | Tirar o medo do primeiro passo. | O processo real: formulário, avaliação inicial, proposta, arranque. | O texto ao lado lista o que se pede no formulário: os dados do contacto e da empresa, o principal desafio e a urgência. |
| **Notícias e newsletter** | Mostrar atividade e captar contactos. | Artigos do blog (`noticias.json`). | Lê o JSON. Vazio no domínio final mostra «em breve», e a pré-visualização mostra os exemplos. |
| **Frentes** | Outras marcas do grupo e a jornada do cliente (aprender, desenvolver, crescer). | Nome e proposta de valor de cada frente. | Falar da proposta de valor de cada frente, sem geografia nem repetição do grupo. |
| **Perguntas frequentes** | Responder às objeções. | 5 a 7 perguntas reais. | Reescrever depois de todas as outras secções, para ficar coerente com elas. Sem perguntas sobre preço se o site não mostra preços. |
| **Fecho** | Último convite à ação. | – | Fundo igual ao da abertura. |

## Cabeçalho

O cabeçalho segue o modelo da Stripe:
- itens: Serviços, Soluções, Sobre nós, Cases, Parceiros e Recursos;
- botões: «Avaliação inicial» e «Pedir cotação».

Cada painel tem:
- `painel-principal` com colunas `pcol` (título e lista de ligações com `<b>` e `<span>`);
- `painel-pe` com uma ligação geral;
- `painel-lado` com «Mais» e um `painel-cartao` com imagem.

| Painel | Origem do conteúdo |
|---|---|
| Serviços | Gerado do `site.json`. |
| Soluções | Por desafio do cliente («Ser visto por quem decide», «Organizar a empresa») e por fase do negócio. |
| Sobre nós | Quem somos, metodologia, certificações, contactos e onde estamos (gerado). |
| Recursos | Aprender (blog, newsletter, FAQ), Começar (avaliação, cotação) e Gratuito (materiais e ferramentas). |

Um painel novo copia a estrutura de um existente. O telemóvel transforma os painéis em acordeão automaticamente.

## Páginas além da inicial

- `contactos.html` sai do script.
- As outras páginas usam o cabeçalho e o rodapé de `contactos.html`, onde as âncoras já têm a forma `/#…`.
- Páginas de serviço: seguir a referência da Stripe guardada em `.impeccable/surfaces/paginas-de-servico.md` do site da Kingdom, sem preços se for o caso.
- Lista de páginas a construir: correr `novo_site.py` mostra-a no fim («Páginas ainda por construir»).
