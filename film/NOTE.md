# NOTE: O Conselheiro, filme de lançamento (vertical, 20 s)

Entrega: `final.mp4` (1080×1920, 30 fps, H.264 + AAC 48 kHz), o `index.html` editável (com `runtime/`, `assets/` e `audio/`) e o `STORYBOARD.md` (v3).

## A ideia, numa linha
O espectador vê o serviço a funcionar com a interface verdadeira do site: marca três sinais no Raio-X, o radar mostra a maior pressão, o plano diz o que vem primeiro, e no fim as duas metades do selo encaixam (Shelton + tu). Isto encena a frase da marca, *"Para quem precisa de menos informação e mais clareza."*

## Beats e o que cada um compra
| # | Tempo | Compra |
|---|---|---|
| B1 gancho | 0,0–2,8 s | o espectador sente-se apanhado: o problema talvez não seja saber pouco |
| B2 viragem | 2,8–5,0 s | em vez de mais um curso, começas por dizer onde estás (três sinais marcados) |
| B3 prova | 5,0–10,8 s | a sessão diz por onde começar: Delegação 100 % → "Tirar o dono da operação diária" |
| B4 herói | 10,8–14,8 s | a promessa, depois de mostrada: o horizonte acende e surge "Uma sessão pode mudar a forma como vês o teu negócio." |
| B5 pessoa | 14,8–17,0 s | do outro lado está o Shelton, do Raio-X ao Plano |
| B6 selo | 17,0–20,0 s | quem é e o que promete: o selo encaixa e surge a frase final |

## O que é real e o que é ilustrativo
- **Real, do site em produção** (commit `eb70daa`, igual byte a byte ao HTML publicado): todas as frases; a ferramenta Raio-X rápido e o seu resultado para os três sinais (calculado com os `PESOS` do `site.js`: Delegação 100 %, Processos 67 %, Equipa 17 %, Direcção 17 %, Vendas 0 %, e a frase "Começaríamos pela tua dependência da operação…"); a janela "Advising · Plano de acção"; a janela "Sessão de Advising"; a fotografia do Shelton; o selo (PNG do site, com a estrela vetorizada em duas metades a partir dele); a paleta café; a Google Sans; o céu e o horizonte do fecho.
- **Ilustrativo:** o plano com as três prioridades. É o exemplo que o site marca como "Exemplo ilustrativo". O aviso não aparece no ecrã do filme.
- **Adaptado ao formato vertical:** as opções do Raio-X em coluna, o resultado numa só coluna e o "Tu" da sessão como imagem-em-imagem. O ponto laranja no vértice "Delegação" do radar é um acrescento no estilo da marca, porque o site usa o laranja para "pequenos sinais".
- **Nada gerado por IA na imagem.** O som é da ElevenLabs: cinco efeitos e duas camas sonoras feitas com o endpoint de efeitos sonoros, porque a chave não tem a permissão `music_generation`.

## Números dos scripts
- `look.py film/final.mp4 --expect 20 --expect-audio`:
  - **G0 PASS:** 20,00 s, áudio presente.
  - **G2 PASS:** nenhuma sequência de mais de 3 frames planos.
  - **G3 PASS:** pausa final de 1,20 s; último plano de 3,00 s, 15 % do filme.
  - Áudio: −14,0 LUFS, LRA 5,9 LU, pico real −1,6 dBFS, cauda silenciosa de 0,16 s.
- `lint.mjs film/index.html`: **GATE G5 PASS** (todas as regras C, D, P, T e V passam).
- `Motion.selfTest`: **PASS**, 24 amostras, 551 elementos, 0 desajustes.
- **G1, avaliado a olho, sem número de script:**
  - a interface é ampliada pela câmara 2,7–2,9×: opções do Raio-X a ~42 px, texto do "por onde começar" a ~42 px, linhas do plano a ~39 px;
  - os fragmentos ocupam 0,88–1,0 da largura ou são cortados pela borda.
  - Ressalva: num formato vertical, 0,04 H daria 77 px, o que não cabe numa linha de interface com 1080 px de largura. Usei 0,04 da largura (≈43 px) como referência e algumas etiquetas secundárias ficam abaixo disso.
- **G4, a olho:** um herói por plano. Na sessão, o "Tu" tem cerca de 1/13 da área do quadro do Shelton.
- **Movimento:** variação média de 3,3/255, abaixo da banda dos filmes humanos (4,4–9,8). É uma escolha: marca calma, e o utilizador já preferiu um filme calmo e legível. Fica registado como pergunta, não como certeza.

## Descrição de cada fotograma da folha (look-final/sheet.jpg)
1. 0,6 s: céu castanho com estrelas; "Talvez o teu problema" a subir. Herói: a frase.
2. 1,9 s: o gancho completo em três linhas; brilho laranja quase invisível em baixo.
3. 3,1 s: cartão claro do Raio-X ampliado sobre a grelha; o cursor vai para a 3.ª opção.
4. 4,4 s: duas opções marcadas (café com ponto laranja); o cursor sobre "Estou sobrecarregado".
5. 5,6 s: janela "Raio-X · O teu negócio" com "3 sinais"; o radar inclina-se para Delegação.
6. 6,9 s: radar com o vértice laranja, barras com percentagens, "Maior pressão: Delegação (100%)".
7. 8,1 s: barras e "Começaríamos pela tua dependência da operação…"; a janela do plano entra por baixo.
8. 9,4 s: "Plano · Por ordem" com as três prioridades.
9. 10,6 s: a prioridade 1 com o visto laranja.
10. 11,9 s: céu escuro com o horizonte e o aro laranja a acender; "Uma" a entrar.
11. 13,1 s: a frase a meio da entrada, sobre o horizonte.
12. 14,4 s: "Uma sessão pode mudar a forma como vês o teu negócio." completa.
13. 15,6 s: janela "Sessão de Advising" com o Shelton (lâmpadas quentes) e "Tu" em imagem-em-imagem; barra em "Advising".
14. 16,9 s: o mesmo, mais de perto; a barra chega a "Plano".
15. 18,1 s: o selo montado; "Para quem precisa de" a entrar.
16. 19,4 s: o selo a rodar e a frase final completa, com "e mais clareza." no tom suave do site.

Nenhum destes fotogramas passaria por um diapositivo: não há títulos alinhados à esquerda, cabeçalho ou rodapé.

## Som (respostas da lista de verificação)
- **Primeiro som grande:** um "swell" grave quando o aro do horizonte acende (11,87 s), depois de ~0,5 s de quase silêncio (a música desce 24 dB entre 11,25 e 11,87 s).
- **Leitura:** a música desce 7 dB entre 6,4 e 9,4 s, enquanto se lê o resultado do Raio-X.
- **Pancadas escolhidas à mão:** 2, o horizonte e o encaixe do selo (17,47 s). Os três cliques e o visto são sons pequenos de interface, baixos (−11 a −12 dB).
- **Secções:** a música muda no corte para o Shelton (14,8 s), com uma segunda cama de resolução.
- O som cobre o filme todo (audível 0–19,84 s).

## O que ainda melhoraria
- **Música:** com a permissão `music_generation` na chave da ElevenLabs, faria uma partitura com secções que acompanham a montagem, em vez de camas feitas como efeitos sonoros. Não consegui ouvir o resultado; só medi níveis.
- **Fotografia:** a do Shelton tem só 800 px e aparece ampliada ~1,7×, por isso fica um pouco suave. Uma versão em alta resolução melhoraria o B5.
- **Mundo do herói:** o horizonte é desenhado como no site, linha e luz; um tratamento com mais volume poderia dar-lhe mais força.
- **Ritmo do B3:** com 5,8 s é o beat mais longo. Poderia perder ~0,5 s na passagem pelo "por onde começar".
