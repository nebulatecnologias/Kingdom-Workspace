# Skills Kingdom

## kingdom-design-system

Design system "Kingdom UI", retirado do protótipo da Kingdom Members. Serve para criar outros produtos com o mesmo aspeto: tokens, componentes, padrões de ecrã, texto, idiomas EN/PT/ES, ilustrações e implementação em Next.js + Tailwind v4.

### Instalar noutro perfil

- **claude.ai / app Claude:** carregue o ficheiro `dist/kingdom-design-system.skill` na área de Skills das definições do perfil (Capacidades → Skills). Também pode abrir o ficheiro numa conversa e clicar em **Save skill**.
- **Claude Code:** copie a pasta `kingdom-design-system/` para `~/.claude/skills/` (todos os projetos) ou para `.claude/skills/` dentro do repositório do novo projeto.

### Como pedir

Basta dizer, por exemplo: "Usa o nosso design system Kingdom para criar o dashboard do Kingdom Events". A skill também é ativada quando o pedido mencionar um produto Kingdom.

### Atualizar

Edite os ficheiros em `kingdom-design-system/` e volte a gerar o pacote:

```
python -m scripts.package_skill <caminho>/skills/kingdom-design-system
```

O comando corre a partir da pasta da skill-creator.

## members-platform

"Super skill" para criar plataformas como a Kingdom Library: área de membros para vender produtos digitais, com convites criados pelas compras, webhooks do gateway, kits, downloads protegidos, admin completo, 3 idiomas, segurança, testes e publicação na Vercel + Supabase + Resend.

Inclui:
- o código completo da Kingdom Library como modelo (`assets/template/`);
- um script que cria um projeto novo já com outra marca, domínio e contactos (`scripts/new_project.py`);
- um gerador de favicon e imagens de partilha a partir do logo (`scripts/make_icons.mjs`);
- o design system Kingdom (`assets/design-system/`);
- os controlos de qualidade de interface adaptados do impeccable e do ui-ux-pro-max (com atribuição em `NOTICE.md`);
- o guia passo a passo: perguntas iniciais com as decisões por defeito, fases 0–6, segurança, testes, publicação e os problemas já resolvidos.

### Instalar
- **claude.ai / app Claude:** carregue `dist/members-platform.skill` em Definições → Capacidades → Skills (ou abra-o numa conversa e clique em **Save skill**).
- **Claude Code:** copie a pasta `members-platform/` para `~/.claude/skills/` ou para `.claude/skills/` do novo repositório.

### Como pedir
"Cria uma área de membros para os meus cursos, como a Kingdom Library", "quero uma biblioteca digital para vender eBooks com o Paystack", "clona o sistema da Kingdom Library para a marca X".

### Atualizar
Edite `members-platform/` e volte a gerar o pacote a partir da pasta da skill-creator:

```
python -m scripts.package_skill <caminho>/skills/members-platform <caminho>/skills/dist
```

Quando o código da app mudar, atualize o modelo em `members-platform/assets/template/` com os ficheiros de `members/` (só os que estão no git).
