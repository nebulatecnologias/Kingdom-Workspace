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

## software-audit

Auditoria de ponta a ponta de um software que já existe: frontend, backend, base de dados, design, experiência do utilizador, acessibilidade, lógica de negócio, acessos e segurança. O resultado é um relatório com as falhas por ordem de gravidade, cada uma com prova, impacto e correção.

Inclui:
- `scripts/map_repo.py`: mapeia qualquer repositório (tecnologias, páginas, rotas de API, autenticação, tabelas e RLS, variáveis de ambiente, testes, pontos sensíveis);
- `scripts/crawl_screens.mjs`: percorre a app a correr, no computador e no telemóvel, com capturas de ecrã, erros, problemas de layout e verificações de acessibilidade (axe);
- `scripts/save_login.mjs`: entra com uma conta de teste e guarda a sessão;
- `scripts/access_matrix.mjs`: testa quem consegue abrir o quê (visitante, membro, outro membro, admin);
- `scripts/check_headers.py`: cabeçalhos de segurança, cookies, HTTPS e CORS;
- guias por área (`references/`) e o modelo do relatório (`assets/report-template.md`).

Na primeira utilização, na Kingdom Library, encontrou um erro real: carregar Enter na página de login enviava um email de recuperação de palavra-passe em vez de entrar.

### Instalar
- **claude.ai / app Claude:** carregue `dist/software-audit.skill` em Definições → Capacidades → Skills (ou abra-o numa conversa e clique em **Save skill**).
- **Claude Code:** copie a pasta `software-audit/` para `~/.claude/skills/` ou para `.claude/skills/` do repositório a auditar.

### Como pedir
"Audita o meu software", "encontra falhas de UX e de acessos nesta app", "está pronto para lançar?", "revê a segurança do meu site".

Os scripts de browser precisam do `playwright` (e, de preferência, do `axe-core`) instalados na pasta de onde são executados.

### Atualizar
Edite `software-audit/` e volte a gerar o pacote a partir da pasta da skill-creator:

```
python -m scripts.package_skill <caminho>/skills/software-audit <caminho>/skills/dist
```
