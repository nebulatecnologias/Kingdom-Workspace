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
