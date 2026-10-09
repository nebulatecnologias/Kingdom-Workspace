#!/usr/bin/env bash
# Gera o DOCX do Diagnóstico 360° Pro com a Google Sans incorporada (Regular + Bold).
set -euo pipefail
cd "$(dirname "$0")"
node build.js /tmp/d360-base.docx
python3 embed_bold.py /tmp/d360-base.docx assets/GoogleSans-Bold.ttf ../Diagnostico_360_Pro_Briefing_Home_Center.docx
