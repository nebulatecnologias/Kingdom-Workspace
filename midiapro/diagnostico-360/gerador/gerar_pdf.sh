#!/usr/bin/env bash
# Gera o PDF interactivo do Diagnóstico 360° Pro.
# Requisitos: node + docx, LibreOffice (soffice), python3 + pymupdf, fonte Google Sans instalada
# (para o LibreOffice a incorporar no PDF: copie assets/GoogleSans-*.ttf para ~/.fonts).
set -euo pipefail
cd "$(dirname "$0")"
TMP=$(mktemp -d)
FORM=1 node build.js "$TMP/form-base.docx"
python3 embed_bold.py "$TMP/form-base.docx" assets/GoogleSans-Bold.ttf "$TMP/form.docx"
soffice --headless --convert-to pdf --outdir "$TMP" "$TMP/form.docx" >/dev/null
python3 make_pdf_form.py "$TMP/form.pdf" "$TMP/form-base.fields.json" ../Diagnostico_360_Pro_Home_Center_Interactivo.pdf
rm -rf "$TMP"
