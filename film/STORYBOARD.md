# O Conselheiro: filme de lançamento (20 s), storyboard para aprovação

Estado: **ideia e storyboard, à espera de aprovação. A produção ainda não começou.**
Fonte da marca: o código da landing page em `site/` (o mesmo conteúdo de oconselheiro.kingdomcompny.com), servido localmente e capturado em `film/brand/` (`board.png`, 6 ecrãs, fonte Onest, logótipo).

---

## 1. PAGE

- **Problema:** o empreendedor tem informação a mais e prioridades a menos. Vê todos os problemas ao mesmo tempo e não sabe por qual começar.
- **Público:** donos de PME, líderes e especialistas em Moçambique e na lusofonia. Veem o filme no telemóvel (feed do Instagram/LinkedIn/WhatsApp), muitas vezes sem som.
- **Objetivo:** dar a conhecer o Advising com O Conselheiro e levar a pessoa a agendar uma sessão.
- **Emoção:** começa sobrecarregado ("isto sou eu") e acaba aliviado e orientado ("há uma ordem, há um primeiro passo").

**A verdade única:** o serviço não acrescenta informação. Retira-a até restar o que importa, e decide a ordem. Está na frase da própria marca: *"Para quem precisa de menos informação e mais clareza."*

---

## 2. Inventário da marca

| Olhar para | O que lá está | O que dá ao filme |
|---|---|---|
| Forma do logótipo | estrela de quatro pontas (preta num quadrado verde-lima). Quatro direções: "onde está, para onde vai, por onde começa" | a estrela é o **olho** do conselheiro: os braços horizontais esticam-se e tornam-se a linha do Raio-X |
| Controlo principal | não é software, é uma sessão. O gesto é **escolher o que vem primeiro** | a causa e o efeito do filme: uma lista que muda de ordem |
| Material próprio | a lista real de gargalos do site (11 frases); o horizonte do planeta com aro verde no hero; o grão de ruído do site | o fundo e a matéria do primeiro ato; o mundo do segundo ato |
| Verbo | enxergar, decidir, executar ("nesta ordem") | Raio-X (enxergar), reordenar (decidir), ponto de partida (executar) |
| Momento de sucesso | "O que resolver primeiro para destravar o resto" (fase 3, Plano) | o clímax é a lista ordenada, com o primeiro passo marcado |
| Voz | direta, calma, adulta, sem promessas de motivação ("não é para si se procura apenas motivação momentânea") | nada de slogans; frases do próprio site |
| Lógica de cor | cinzento = "informação" (o "menos informação" do H1 é cinzento); verde-lima `#c7f534` = "clareza" | **o acento tem um único significado: clareza.** Só fica verde o que já está claro |
| Tipografia | Onest 600 nos títulos, 400 no texto, tracking apertado | a única família do filme |
| O que nunca fariam | barulho, glitch, euforia de "coach", ostentação | ritmo calmo, uma única pancada sonora, final pequeno |

---

## 3. A ideia

**Primeira ideia (posta de lado):** uma peça de xadrez, uma bússola ou uma lâmpada da "clareza" sobre fundo escuro. É a fantasia da categoria e serve a qualquer consultora.

**Outras três, de tipos diferentes:**

1. **Subtração (filme de um só caso), a escolhida.** O ecrã enche-se com os gargalos reais de um empreendedor. A estrela do logótipo faz o Raio-X, apaga o ruído, sobram três. A ordem muda: o problema mais barulhento não é o primeiro. O filme é a frase da marca, encenada.
2. **Ensaio tipográfico "Para quem não é".** A lista "Não é para si se…" lida com humor seco: cada desculpa é riscada. É fiel à voz, mas abre o lançamento a afastar pessoas e é só tipo, sem mundo.
3. **Documentário da marcação.** O interruptor real Online/Presencial, a duração de 1 a 2 h, o documento final. Rejeitada porque o produto é a sessão, não o site, e a interface de marcação é genérica.

(Um plano fixo de uma sessão real com o Shelton foi excluído: não há fotografias e não se geram pessoas apresentadas como reais.)

**Escolha e porquê, numa linha:** a subtração é a única que encena literalmente a promessa da marca ("menos informação, mais clareza"), usa o seu material real (a lista de gargalos, o horizonte do hero, a estrela, o verde com significado) e mostra o que o conselheiro faz que um curso não faz: **diz por onde começar, e muitas vezes não é o óbvio.**

**Teste de tapar o logótipo:** com outra marca, perde-se a estrela que vê, o horizonte, a regra cinzento-informação/verde-clareza e as frases. Fica só "caos para ordem", que é da categoria. A posse está nesses quatro elementos, por isso nenhum deles é opcional.

**O caso concreto (ilustrativo, declarado no NOTE.md):** sobram três gargalos: *Vendas estagnadas*, *Dependência excessiva do dono* e *Processos desestruturados*. No ruído inicial, "Vendas estagnadas" é o maior e o mais claro (o sintoma que grita). Na reordenação desce para 3.º e "Processos desestruturados", o mais discreto, sobe para 1.º. É o "identifica o que muitas vezes não é evidente" da citação do site.

---

## 4. Sistema do filme

| Campo | Decisão |
|---|---|
| Formato | 1920×1080, 30 fps, 600 frames (20,0 s), com som. *(Ver pergunta A: 9:16 para redes?)* |
| Forma | subtração / caso único; rejeitadas: ensaio "para quem não é" e demo de marcação (razões acima) |
| Relógio | suave (30 fps) |
| Gramática de movimento | shutter blur na render final (`--shutter 180`), sem smear |
| Tipo | Onest. Ruído 2,5–6 % H (400); três sobreviventes 5,5 % H (500); legenda 3 % H (400); "Menos informação." 7 % H (600, cinzento); "Mais clareza." 11 % H (600, lima); wordmark ~0,25 W |
| Acento | `#c7f534` = **clareza** (o que já foi visto e decidido). Nunca decorativo |
| Segunda cor | nenhuma. Branco = em foco, cinzento `#8a8a8a`/`#a3a3a3` = informação |
| Objeto transportado | a estrela de 4 pontas: Raio-X (largura total) → marcador do 1.º passo (pequena) → luz que cai no horizonte → logótipo. Muda de papel em cada costura e nunca fica parada |
| Cursor | nenhum (não há interface para clicar) |
| Momento herói | frame ~435 (14,5 s, 72 %), descrito abaixo |
| Overshoot | nenhum. Uma única pancada sonora |
| Orçamento de importância | 5 beats, 1 de importância 3 (20 %): o B3 (a reordenação). O herói visual (B4) é importância 2 em significado e recebe o trabalho mais difícil |

**Mundo por ato**

| Ato | Fundo | Luz | Profundidade | Textura | Som |
|---|---|---|---|---|---|
| 1 (B1–B3, 0–11,5 s) | quase-preto `#070706` do site, com as partículas de estrelas do hero | nenhuma no início; depois a estrela é a **única fonte de luz**, uma lâmina horizontal verde que ilumina de branco o que toca | três planos de frases: perto (grandes, desfocadas, a passar), meio (legíveis), longe (pequenas, esbatidas) | o ruído fractal do site como grão | um murmúrio de cliques secos e densos que se esvazia à medida que as frases saem |
| 2 (B4–B5, 11,5–20 s) | o **horizonte do planeta** do hero do site (esfera escura com aro fino) num campo de estrelas | aro verde-lima que nasce onde a estrela toca e percorre o arco (varrimento de luz, uma só vez) | planeta em primeiro plano, estrelas ao fundo com paralaxe lenta | grão fino | 0,6 s de silêncio, uma nota grave quando o aro acende, cama calma até ao fim |

**Momento herói (frame ~435, 14,5 s):** a curva escura do planeta ocupa o terço inferior; o aro verde-lima acaba de acender e ainda corre para as pontas; ao centro, acima do horizonte, "Menos informação." em cinzento e, por baixo, maior, "Mais clareza." em lima. Uma fonte de luz, uma superfície com volume, uma coisa a acontecer. Feito como esfera 3D real (`hero3d`) com aro por fresnel, para que o arco tenha volume e não seja um gradiente plano.

---

## 5. Beats

**B1 — gancho (0,0–3,5 s · frames 0–105 · importância 2)**
- **Compra:** o espectador reconhece a própria cabeça: todos os problemas ao mesmo tempo, nenhum por ordem.
- **Imagem com o texto tapado:** um campo escuro e granulado atravessado por linhas cinzentas a três profundidades, as de perto desfocadas e rápidas, as de longe lentas.
- **Texto no ecrã:** os 11 gargalos reais do site, repetidos e sobrepostos. "Vendas estagnadas" é o maior e o mais claro.
- **Movimento:** o filme abre já em movimento; as filas derivam em sentidos opostos (o marquee do site, mas em todo o ecrã e em profundidade); a densidade aumenta até 3,2 s.
- **Saída / costura:** a estrela entra pelo topo **já em movimento**, com os braços horizontais a esticarem-se até à largura do ecrã.

**B2 — viragem: Raio-X (3,5–7,0 s · 105–210 · importância 2)**
- **Compra:** alguém olhou para tudo e viu o que importa.
- **Imagem com o texto tapado:** uma lâmina horizontal de luz verde desce pelo ecrã; acima dela, quase nada; abaixo, ainda o ruído.
- **Movimento:** a estrela-linha desce (desaceleração longa). Cada frase que toca é lida: a maioria perde foco e afunda para trás (escala para baixo, desfoque, cinzento mais escuro, sai); três ficam nítidas e brancas.
- **Texto:** nenhum novo.
- **Costura:** quando a lâmina sai por baixo, os braços recolhem e a estrela encolhe para o tamanho de um marcador, ao lado das três frases que ficaram.

**B3 — prova: a ordem (7,0–11,5 s · 210–345 · importância 3, "o ponto")**
- **Compra:** o conselheiro decide por onde começar, e não é o óbvio.
- **Imagem com o texto tapado:** três linhas brancas centradas, ampliadas pela câmara (≥0,55 W), uma a trocar de lugar com outra, e uma estrela verde pequena a marcar a de cima.
- **Movimento:** 0,8 s de respiração (as três linhas paradas, só o grão vivo). Depois "Vendas estagnadas" desce para o fundo e "Processos desestruturados" sobe para o topo; a estrela fixa-se à esquerda dela e a frase fica verde-lima (a primeira coisa clara). Push-in lento da câmara.
- **Texto:** as três frases e, por baixo, pequena e cinzenta, a frase real do site: *"O que resolver primeiro para desbloquear o resto."* (ver pergunta C).
- **Costura:** a estrela solta-se da lista e **cai**; a câmara inclina-se para baixo e segue-a.

**B4 — herói: clareza (11,5–16,5 s · 345–495 · importância 2)**
- **Compra:** o resultado não é mais informação, é clareza; a promessa da marca, dita depois de ter sido mostrada.
- **Imagem com o texto tapado:** o planeta do hero do site sobe ao enquadramento; a estrela pousa no topo do arco e o aro verde acende a partir desse ponto e corre para as duas pontas.
- **Movimento:** inclinação da câmara para baixo (a lista sai por cima, ainda em movimento); a estrela toca o horizonte a 13,0 s; 0,6 s de silêncio antes; o aro acende a 13,6 s. As palavras chegam ao ritmo da fala (4–6 frames entre palavras), a descer de ligeiramente maiores: "Menos informação." (13,9 s), "Mais clareza." (14,6 s).
- **Texto:** *Menos informação.* / *Mais clareza.* (a frase do H1 do site, partida em duas).
- **Costura:** as palavras sobem e saem com aceleração; a luz do aro concentra-se no ponto central.

**B5 — CTA (16,5–20,0 s · 495–600 · 17,5 % do filme)**
- **Compra:** o espectador sabe quem é e o que fazer a seguir.
- **Imagem com o texto tapado:** no ponto onde a luz se concentrou, o quadrado lima com a estrela preta sobe do horizonte; o aro respira devagar.
- **Movimento:** o logótipo chega de ~3× para o tamanho final (desaceleração, sem salto); o wordmark "O Conselheiro." desliza de trás do quadrado; uma linha pequena por baixo. Final calmo, mais pequeno do que o início; o aro continua vivo durante a pausa final (≤1,4 s).
- **Texto:** *O Conselheiro.* + *Agende a sua sessão. Online ou em Maputo.* (ver pergunta C).

**Verificações já feitas no papel**
- G1 (prova legível): as três frases a 5,5 % H, lista ≥0,55 W, ampliada pela câmara. A legenda tem 3 % H, abaixo de 0,04 H, mas é texto de apoio e não a prova. As frases do ruído são de propósito ilegíveis em parte (são textura).
- G3: CTA 3,5 s = 17,5 % (≤25 %); pausa final planeada de ~1,0 s.
- G4: um herói por frame (B1 é textura sem herói até a estrela entrar; daí em diante, uma coisa acesa de cada vez).
- Cromo de página: nenhum. Sem nome no canto, contadores, rótulos "Raio-X" ou fases numeradas, barras, URL ou botão no fim.

---

## 6. Som

- **Recomendação: sem locução.** Música + efeitos desenhados, porque o filme vai ser visto sobretudo sem som e lê-se sozinho. Há um risco real de sotaque brasileiro nas vozes da ElevenLabs (os modelos não distinguem pt-PT de pt-BR de forma fiável), e a chave atual só permite vozes pré-definidas.
- **Música:** pulso mínimo e escuro que perde camadas à medida que o Raio-X apaga as frases. Silêncio antes do aro. Uma nota grave quando acende. Cama calma no fim. Alvo de −14 LUFS.
- **Efeitos:** murmúrio de cliques (B1), um sopro tonal no varrimento (B2), um "tic" seco na troca de ordem (B3), a pancada do horizonte (B4).

---

## 7. O que é real e o que é ilustrativo

- **Real (do site):** os 11 gargalos, "O que resolver primeiro para destravar o resto", o H1 "menos informação e mais clareza", a estrela, o quadrado lima, a Onest, as cores, o horizonte do planeta, o grão, "Online / presencial em Maputo".
- **Ilustrativo:** o caso dos três gargalos e a sua ordem (plausível, não é um cliente real). Declarado no NOTE.md, nunca no ecrã.
- **Construído:** o planeta em 3D, inspirado no hero do site.

---

## 8. Decisões que preciso de si antes da produção

- **A. Formato:** 16:9 (1920×1080, por omissão), 9:16 vertical (Reels/Stories/WhatsApp Status) ou ambos.
- **B. Locução:** sem voz (recomendado) ou com voz em pt-PT. Com voz, faço primeiro uma amostra para aprovar o sotaque.
- **C. pt-PT vs. texto do site:** o site diz "destravar" (mais brasileiro). Proponho "desbloquear" no filme. A linha final "Agende a sua sessão. Online ou em Maputo." é minha, a partir dos dados do site.
