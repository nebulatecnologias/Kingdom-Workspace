# Playbook de vendas · Kingdom Company

A fonte é o documento do Claude «Playbook de vendas · Kingdom Company»
(https://claude.ai/artifact/CAbU8KCcUnRZm45HHboKAW).

1. Ler o documento inteiro (vista completa) e guardar o resultado em JSON.
2. `python3 parse.py <resultado.json>`: gera `doc.json` e `doc.md`.
3. PDF A4 horizontal: `python3 build.py && node render.mjs "$PWD"` (gera `playbook.pdf`).
4. PDF para telemóvel: `python3 movel.py && node render-movel.mjs "$PWD"`.

Versão 1.1 (11/11/2026): 3 áreas e 9 serviços. A Consultoria Estratégica passou para a DT Company (R04, R40).
