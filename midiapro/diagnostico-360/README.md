# Diagnóstico 360° Pro · Midia Pro

Modelo de recolha de briefing e diagnóstico de liderança, produzido pela **Midia Pro · Comunicação e Imagem** para o cliente **Home Center**.

**Documento:** [`Diagnostico_360_Pro_Briefing_Home_Center.docx`](Diagnostico_360_Pro_Briefing_Home_Center.docx) (A4, 28 páginas, fonte Google Sans incorporada)

Compila dois documentos de referência:

- *Briefing de Cliente: Modelo Completo para Planeamento Estratégico*
- *Modelo de Diagnóstico de Liderança: Home Center*

Do briefing ficou apenas a informação fundamental para construir a estratégia completa da empresa cliente.

## Estrutura

| Parte | Conteúdo |
|---|---|
| Ficha e mapa | Dados de controlo e mapa das etapas: área, quem preenche e tempo estimado |
| Guia de preenchimento | Organização, passo a passo, legenda, regras de ouro e calendário |
| **A · Briefing Estratégico** | 10 etapas, uma por área da empresa. Cada uma traz a caixa "Como fazer o diagnóstico nesta etapa" e campos com *Como levantar*, *Modelo aceite* e *Evidência a anexar* |
| **B · Diagnóstico de Liderança** | Enquadramento, objectivos, metodologia, guia de condução da entrevista e instrumento individual (B1–B9) |
| **C · Consolidação** | Matriz de análise (pesos 25/20/20/20/15 e semáforo), hipóteses, checklist de evidências, quem usa o quê, entregáveis e validação |

## Regenerar o documento

```bash
npm install -g docx      # se ainda não estiver instalado
pip install fonttools    # não é necessário para gerar; só para voltar a fazer o subset das fontes
./gerador/gerar.sh
```

O conteúdo (perguntas, guias e modelos) está em `gerador/build.js`, nas constantes `STAGES`, `B2` e `B3` e nas secções `guia`, `parteB` e `parteC`.

Fontes Google Sans (subset latino): © The Google Sans Project Authors, SIL Open Font License 1.1.
