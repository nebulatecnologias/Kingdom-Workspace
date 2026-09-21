# Como instalar uma Skill no Claude Code

Este guia mostra, passo a passo, as formas de instalar e usar uma *skill* (habilidade) no Claude Code.

Existem três formas principais de conseguir uma skill: instalar pelo **marketplace de plugins**, adicionar uma pasta de skill **manualmente**, ou **criar uma nova** do zero. Escolha o caminho que corresponde ao seu caso.

## Opção 1 — Instalar uma skill de um plugin/marketplace

Use este caminho quando a skill já existe em um marketplace (por exemplo, um marketplace de plugins da Anthropic ou de terceiros).

1. Abra o Claude Code no terminal, dentro do projeto onde quer usar a skill.
2. Liste os marketplaces disponíveis ou adicione um novo, se necessário:
   ```
   /plugin marketplace add <owner/repo-ou-url>
   ```
3. Procure o plugin que contém a skill desejada:
   ```
   /plugin
   ```
   Isso abre o menu interativo de plugins, onde é possível navegar pelos marketplaces conectados e ver a descrição de cada plugin/skill.
4. Selecione o plugin e confirme a instalação. O Claude Code baixa o plugin e registra as skills que ele contém.
5. Reinicie a sessão (ou abra uma nova) para que a skill apareça na lista de skills disponíveis.
6. Verifique se foi instalada com sucesso perguntando ao Claude o que ele tem disponível, ou rodando `/plugin` novamente e conferindo o status "installed".

## Opção 2 — Instalar uma skill manualmente (pasta local)

Use este caminho quando você já tem os arquivos da skill (por exemplo, recebeu uma pasta ou baixou de um repositório).

1. Decida o escopo da skill:
   - **Pessoal** (disponível em todos os projetos): `~/.claude/skills/`
   - **Do projeto** (compartilhada com o time via git): `<raiz-do-projeto>/.claude/skills/`
2. Copie a pasta da skill para o diretório escolhido. Cada skill é uma pasta própria contendo pelo menos um arquivo `SKILL.md`:
   ```
   mkdir -p .claude/skills
   cp -r /caminho/para/minha-skill .claude/skills/
   ```
3. Confira se o arquivo `SKILL.md` tem um cabeçalho (frontmatter) com `name` e `description` — é isso que o Claude Code usa para saber quando oferecer a skill:
   ```yaml
   ---
   name: minha-skill
   description: Explica quando esta skill deve ser usada.
   ---
   ```
4. Se o projeto for um repositório git e a skill deve ser compartilhada com o time, adicione e faça commit da pasta:
   ```
   git add .claude/skills/minha-skill
   git commit -m "Adiciona skill minha-skill"
   ```
5. Reinicie a sessão do Claude Code (ou abra uma nova) para carregar a skill.
6. Teste digitando `/minha-skill` (se ela definir um slash command) ou peça ao Claude uma tarefa que combine com a descrição da skill, para confirmar que ele a reconhece e a aciona.

## Opção 3 — Criar uma skill nova

Se a skill ainda não existe, é possível criar uma usando o assistente de criação de skills:

1. Rode o comando de criação (por exemplo, através de um skill-creator, se disponível na sua instalação):
   ```
   /skill-creator
   ```
   ou peça diretamente ao Claude: "crie uma skill para X".
2. Siga as perguntas para definir nome, descrição e instruções da skill.
3. Revise o arquivo `SKILL.md` gerado e ajuste a descrição para que ela dispare corretamente (é o campo mais importante para o Claude decidir quando usá-la).
4. Salve a skill em `.claude/skills/<nome-da-skill>/` (projeto) ou `~/.claude/skills/<nome-da-skill>/` (pessoal), seguindo os passos da Opção 2 a partir do item 3.

## Verificando se a skill está ativa

- Pergunte ao Claude: "quais skills você tem disponíveis?"
- Ou rode `/plugin` para ver plugins instalados (caso a skill venha de um plugin).
- As skills instaladas aparecem automaticamente como opções que o Claude pode invocar quando a tarefa combina com a descrição delas, ou manualmente via `/nome-da-skill`.

## Dicas

- O campo `description` do `SKILL.md` é o que determina quando a skill é sugerida — escreva-o de forma clara e específica.
- Skills de projeto (`.claude/skills/`) ficam versionadas com o código e são compartilhadas com todo o time que clonar o repositório.
- Skills pessoais (`~/.claude/skills/`) valem para todos os seus projetos, mas não são compartilhadas automaticamente com outras pessoas.
