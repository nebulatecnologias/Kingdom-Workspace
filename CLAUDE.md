# Kingdom Workspace

Sites e ferramentas da Kingdom Company: o núcleo Shelton Douglas (O Conselheiro) e os braços Kingdom InCompany, Kingdom Training e Kingdom Academy. Cada pasta de topo é um site estático publicado na Vercel.

## Regras de negócio: verificar antes de mudar

As decisões de negócio estão gravadas no separador **Regras e estratégia** do Mapa Kingdom
(https://claude.ai/artifact/GdnhABbW2DhtKcopjLHz8c), na coleção `regras` da base de dados do artefacto,
com cópia em `docs/regras-de-negocio.md`.

1. Antes de fazer uma alteração pedida (ofertas, preços, sites, bios, funil, tráfego, fechamento, entrega ou o próprio mapa), ler as regras ativas.
2. Se o pedido muda ou contraria uma regra, perguntar ao Shelton antes de fazer: citar o código da regra (ex.: R08), dizer o que muda e propor a regra atualizada. Só avançar depois da resposta.
3. Quando o Shelton toma uma decisão de negócio nova, gravá-la como regra (próximo código livre, categoria, peças do mapa afetadas, data e origem) e atualizar `docs/regras-de-negocio.md`.
4. No início de cada conversa sobre o funil, ler a coleção `alteracoes` com `revisto: false`. São mudanças que ele fez no mapa em peças ligadas a regras. Discutir cada uma e marcá-la `revisto: true`.

## Plano anual

O separador **Plano anual** do Mapa Kingdom é o calendário de marketing de 12 meses. Vive na base de dados do artefacto:

- `ciclos`: uma fase de uma oferta com datas (`fase`: aquecer, vender, entregar, preparar, evento, sempre), com `faixa`, `linha` (a oferta), `inicio`, `fim`, `receita_mes` ou `receita_total`, `anuncios_mes`, `horas_mes`, `regras` e `estado`.
- `meses`: o foco de marketing de cada mês (id `AAAA-MM`, campos `foco` e `porque`).

Os ciclos em `estado: proposta` são propostas do Claude ainda por decidir. Quando o Shelton confirma um ciclo, passa a `confirmado`. Mudanças em ciclos ligados a regras ficam em `alteracoes` com `no: "ciclo:<id>"`.

## Notas de trabalho

- Vercel: equipa `team_Ztm4j08esZm62NRjArXDIpQF`. O DNS de kingdomcompny.com está no Wix: subdomínios novos precisam de um CNAME criado pelo Shelton.
- Nunca publicar no projeto `kingdom-academy` (`prj_3AQWipvYkWOOeGedqO6JON4MX5D9`, membros.kingdomcompny.com) nem alterá-lo.
- Antes de criar um projeto novo na Vercel, confirmar que o nome está livre.
- Textos em português europeu, como nos sites.
