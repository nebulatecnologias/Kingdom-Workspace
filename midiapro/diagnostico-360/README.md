# Diagnóstico 360° Pro · Midia Pro

Modelo de recolha de briefing e diagnóstico de liderança, produzido pela **Midia Pro · Comunicação e Imagem** para o cliente **Home Center**.

**Documentos:**

- [`Diagnostico_360_Pro_Briefing_Home_Center.docx`](Diagnostico_360_Pro_Briefing_Home_Center.docx): versão Word (A4, 28 páginas, fonte Google Sans incorporada).
- [`Diagnostico_360_Pro_Home_Center_Interactivo.pdf`](Diagnostico_360_Pro_Home_Center_Interactivo.pdf): PDF interactivo (27 páginas) com 375 campos:
  - caixas de texto em todas as respostas e tabelas;
  - caixas de selecção (□) e botões de opção (○, escalas 1–5 e 0–10);
  - lista VERDE / AMARELO / VERMELHO na matriz;
  - links do mapa para cada etapa e marcadores laterais;
  - botões **Enviar à Midia Pro** (email com o PDF em anexo, no Adobe Acrobat Reader) e **Imprimir**.

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

## Regenerar os documentos

```bash
npm install -g docx          # se ainda não estiver instalado
./gerador/gerar.sh           # DOCX
pip install pymupdf          # para o PDF interactivo (requer também o LibreOffice)
cp gerador/assets/GoogleSans-*.ttf ~/.fonts/ && fc-cache -f
./gerador/gerar_pdf.sh       # PDF interactivo
```

O PDF interactivo é gerado a partir do mesmo conteúdo. Com `FORM=1`, o `build.js` coloca um marcador invisível em cada campo. O LibreOffice converte o DOCX em PDF e o `make_pdf_form.py` troca os marcadores por campos de formulário. Os nomes dos campos seguem o número da pergunta (`1_6`, `B2_1`, `C1_r1c5`…) e cada campo tem como dica o texto da pergunta. Assim, os dados exportados pelo Acrobat (Preparar formulário › Exportar dados) ficam fáceis de organizar no Excel.

O conteúdo (perguntas, guias e modelos) está em `gerador/build.js`, nas constantes `STAGES`, `B2` e `B3` e nas secções `guia`, `parteB` e `parteC`.

Fontes Google Sans (subset latino): © The Google Sans Project Authors, SIL Open Font License 1.1.
