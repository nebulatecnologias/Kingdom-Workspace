"""Transforma o PDF (gerado a partir do DOCX em modo FORM=1) num PDF interactivo.

Lê os marcadores invisíveis [[tipo|nome|valor]] deixados pelo build.js e cria:
  T  caixa de texto na célula que contém o marcador (multilinha se for alta)
  D  lista VERDE / AMARELO / VERMELHO na célula
  U  caixa de texto sobre o sublinhado que vem a seguir ao marcador
  C  caixa de selecção sobre o símbolo □ seguinte
  R  botão de opção sobre o símbolo ○ seguinte (grupo = nome, valor = opção)
  S  botão de opção dentro da célula da escala 0–10
Depois apaga os marcadores, agrupa os botões de opção, acrescenta links de
navegação, link de email no rodapé e os botões Enviar / Imprimir.

Uso: python3 make_pdf_form.py entrada.pdf campos.json saida.pdf
"""
import json, re, sys
import pymupdf

src, fields_json, dst = sys.argv[1:4]
LABELS = json.load(open(fields_json))
NAVY = (1 / 255, 17 / 255, 105 / 255)
MARK = re.compile(r"\[\[([^\]]+)\]\]")

doc = pymupdf.open(src)


def cell_rect(page_rects, pt):
    """Menor rectângulo preenchido (célula) que contém o ponto."""
    best = None
    for r in page_rects:
        if r.contains(pt) and r.width > 8 and r.height > 8:
            if best is None or r.get_area() < best.get_area():
                best = r
    return best


def first_char(spans, k):
    """Primeiro carácter visível depois do span k (na mesma linha)."""
    for sp in spans[k + 1:]:
        for ch in sp["chars"]:
            if ch["c"].strip():
                return ch, sp["size"]
    return None, None


radio_groups = {}  # nome -> [(xref, valor)]
missing = []
count = {"T": 0, "D": 0, "U": 0, "C": 0, "R": 0, "S": 0}

for page in doc:
    rects = [pymupdf.Rect(d["rect"]) for d in page.get_drawings() if d.get("fill") is not None]
    todo, redact = [], []
    for b in page.get_text("rawdict")["blocks"]:
        for l in b.get("lines", []):
            spans = l["spans"]
            for k, sp in enumerate(spans):
                text = "".join(c["c"] for c in sp["chars"])
                for m in MARK.finditer(text):
                    parts = m.group(1).split("|")
                    kind, name = parts[0], parts[1]
                    value = parts[2] if len(parts) > 2 else None
                    todo.append((kind, name, value, sp, spans, k))
                if MARK.search(text):
                    redact.append(pymupdf.Rect(sp["bbox"]))

    # 1) apagar os marcadores (só texto; desenhos e imagens ficam intactos)
    for r in redact:
        page.add_redact_annot(r + (0.2, 0.2, -0.2, -0.2))
    if redact:
        page.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE,
                              graphics=pymupdf.PDF_REDACT_LINE_ART_NONE,
                              text=pymupdf.PDF_REDACT_TEXT_REMOVE)

    # 2) criar os campos
    for kind, name, value, sp, spans, k in todo:
        label = LABELS.get(name, name)
        x0, y0, x1, y1 = sp["bbox"]
        pt = pymupdf.Point((x0 + x1) / 2, (y0 + y1) / 2)
        w = pymupdf.Widget()
        w.field_name = name
        w.field_label = label
        w.border_width = 0
        w.text_color = NAVY
        w.text_font = "Helv"

        if kind in ("T", "D", "S"):
            cr = cell_rect(rects, pt)
            if cr is None:
                missing.append((page.number + 1, kind, name)); continue
            if kind == "S":
                cy = (cr.y0 + cr.y1) / 2
                w.rect = pymupdf.Rect(cr.x1 - 13, cy - 4.5, cr.x1 - 4, cy + 4.5)
                w.field_type = pymupdf.PDF_WIDGET_TYPE_RADIOBUTTON
                w.border_color = NAVY; w.border_width = 0.8
                w.field_value = False
            elif kind == "D":
                w.rect = cr + (2, 2, -2, -2)
                w.field_type = pymupdf.PDF_WIDGET_TYPE_COMBOBOX
                w.choice_values = ["", "VERDE", "AMARELO", "VERMELHO"]
                w.field_value = ""
                w.text_fontsize = 8
            else:
                w.rect = cr + (3, 2, -3, -2)
                w.field_type = pymupdf.PDF_WIDGET_TYPE_TEXT
                w.text_fontsize = 9
                if cr.height > 24:
                    w.field_flags |= pymupdf.PDF_TX_FIELD_IS_MULTILINE
        elif kind == "U":
            nxt = spans[k + 1] if k + 1 < len(spans) else None
            if nxt is None:
                missing.append((page.number + 1, kind, name)); continue
            bx = pymupdf.Rect(nxt["bbox"])
            w.rect = pymupdf.Rect(bx.x0, bx.y1 - 11, bx.x1, bx.y1 + 1)
            w.field_type = pymupdf.PDF_WIDGET_TYPE_TEXT
            w.text_fontsize = 9
        else:  # C ou R: sobre o símbolo seguinte
            ch, size = first_char(spans, k)
            if ch is None:
                missing.append((page.number + 1, kind, name)); continue
            cb = pymupdf.Rect(ch["bbox"])
            ox, oy = ch["origin"]
            cx = (cb.x0 + cb.x1) / 2
            cy = oy - 0.36 * size
            h = min(cb.width, size * 0.78)
            w.rect = pymupdf.Rect(cx - h / 2, cy - h / 2, cx + h / 2, cy + h / 2)
            w.field_type = pymupdf.PDF_WIDGET_TYPE_CHECKBOX if kind == "C" else pymupdf.PDF_WIDGET_TYPE_RADIOBUTTON
            w.field_value = False
        added = page.add_widget(w)
        count[kind] += 1
        if w.field_type == pymupdf.PDF_WIDGET_TYPE_RADIOBUTTON:
            radio_groups.setdefault(name, []).append((added.xref, value))

# 3) agrupar botões de opção: um campo-pai por pergunta, um estado por opção
cat = doc.pdf_catalog()
acro = doc.xref_get_key(cat, "AcroForm")
af_xref = int(acro[1].split()[0]) if acro[0] == "xref" else None
fields = doc.xref_get_key(af_xref, "Fields")[1] if af_xref else doc.xref_get_key(cat, "AcroForm/Fields")[1]
field_refs = re.findall(r"(\d+) 0 R", fields)
kid_xrefs = {x for g in radio_groups.values() for x, _ in g}
new_fields = [r for r in field_refs if int(r) not in kid_xrefs]
for name, kids in radio_groups.items():
    parent = doc.get_new_xref()
    kids_arr = " ".join(f"{x} 0 R" for x, _ in kids)
    doc.update_object(parent, f"<< /FT /Btn /Ff 49152 /T {pymupdf.get_pdf_str(name)} /TU {pymupdf.get_pdf_str(LABELS.get(name, name))} /DA (0 g /Helv 0 Tf) /V /Off /Kids [ {kids_arr} ] >>")
    for x, val in kids:
        state = f"v{val}"
        # reconstrói o widget só com as chaves de anotação; os dados do campo ficam no pai
        keep = []
        for key in ("Rect", "F", "BS", "MK", "P", "AP"):
            t, v = doc.xref_get_key(x, key)
            if t != "null":
                keep.append(f"/{key} {v}")
        obj = "<< /Type /Annot /Subtype /Widget " + " ".join(keep) + f" /Parent {parent} 0 R /AS /Off >>"
        doc.update_object(x, obj.replace("/Yes", "/" + state))
        doc.xref_set_key(x, "AS", "/Off")
    new_fields.append(str(parent))
fields_value = "[ " + " ".join(f"{r} 0 R" for r in new_fields) + " ]"
if af_xref:
    doc.xref_set_key(af_xref, "Fields", fields_value)
else:
    doc.xref_set_key(cat, "AcroForm/Fields", fields_value)
doc.xref_set_key(af_xref or cat, "NeedAppearances" if af_xref else "AcroForm/NeedAppearances", "true")
# recursos por omissão dos campos (Helvetica e Helvetica-Bold)
helv = doc.get_new_xref(); doc.update_object(helv, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>")
hebo = doc.get_new_xref(); doc.update_object(hebo, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>")
doc.xref_set_key(af_xref or cat, "DR" if af_xref else "AcroForm/DR", f"<< /Font << /Helv {helv} 0 R /HeBo {hebo} 0 R >> >>")
doc.xref_set_key(af_xref or cat, "DA" if af_xref else "AcroForm/DA", "(/Helv 0 Tf 0 g)")


# 4) navegação: mapa e tabela da Parte A → páginas das etapas
def find_page(text):
    for p in doc:
        if p.search_for(text):
            return p.number
    return None


targets = {f"A{n:02d}": find_page(f"Etapa {n:02d} ·") for n in range(1, 11)}
targets["B "] = find_page("Parte B · Diagnóstico de Liderança")
targets["C "] = find_page("Parte C · Consolidação")
links = 0
for p in doc:
    head_map = p.search_for("Área / Departamento")
    head_a = p.search_for("O que a Midia Pro vai construir")
    if not (head_map or head_a):
        continue
    top = (head_map or head_a)[0].y1
    for wd in p.get_text("words"):
        x0, y0, x1, y1, t = wd[:5]
        if y0 < top or x0 > 80:
            continue
        key = None
        if head_map and re.fullmatch(r"A\d\d", t):
            key = t
        elif head_map and t in ("B", "C"):
            key = t + " "
        elif head_a and re.fullmatch(r"\d\d", t):
            key = "A" + t
        if key and targets.get(key) is not None:
            r = pymupdf.Rect(x0 - 2, y0 - 2, p.rect.width - 56, y1 + 2)
            p.insert_link({"kind": pymupdf.LINK_GOTO, "from": r, "page": targets[key], "to": pymupdf.Point(0, 0), "zoom": 0})
            links += 1

# 5) email no rodapé
for p in doc:
    for r in p.search_for("info@midiapro.co.mz"):
        p.insert_link({"kind": pymupdf.LINK_URI, "from": r, "uri": "mailto:info@midiapro.co.mz?subject=Diagn%C3%B3stico%20360%C2%B0%20Pro%20-%20Home%20Center"})

# 6) botões Enviar / Imprimir na última página, abaixo da validação
last = doc[-1]
fills = [pymupdf.Rect(d["rect"]) for d in last.get_drawings() if d.get("fill") is not None]
bottom = max((r.y1 for r in fills if r.y1 < last.rect.height - 70), default=600)
y = bottom + 24
for i, (cap, js) in enumerate([
    ("Enviar à Midia Pro", 'this.mailDoc({bUI: true, cTo: "info@midiapro.co.mz", cSubject: "Diagnóstico 360° Pro - Home Center", cMsg: "Segue em anexo o Diagnóstico 360° Pro preenchido."});'),
    ("Imprimir", "this.print({bUI: true});"),
]):
    b = pymupdf.Widget()
    b.field_type = pymupdf.PDF_WIDGET_TYPE_BUTTON
    b.field_name = "btn_enviar" if i == 0 else "btn_imprimir"
    b.button_caption = cap
    b.rect = pymupdf.Rect(57 + i * 170, y, 57 + i * 170 + (160 if i == 0 else 110), y + 26)
    b.fill_color = NAVY if i == 0 else (0.93, 0.95, 0.98)
    b.text_color = (1, 1, 1) if i == 0 else NAVY
    b.border_color = NAVY
    b.border_width = 1
    b.text_font = "HeBo"
    b.text_fontsize = 10
    b.script = js
    last.add_widget(b)
last.insert_text((57, y + 42), "O botão Enviar abre o email com este PDF em anexo (Adobe Acrobat Reader). Noutros leitores, guarde o PDF e envie-o para info@midiapro.co.mz.",
                 fontsize=7.5, fontname="helv", color=(0.36, 0.38, 0.52))

doc.set_metadata({**doc.metadata, "title": "Diagnóstico 360° Pro · Briefing Estratégico & Diagnóstico de Liderança", "author": "Midia Pro · Comunicação e Imagem", "subject": "Formulário interactivo · Home Center"})
doc.save(dst, garbage=3, deflate=True)
print("campos:", count, "grupos de opção:", len(radio_groups), "links:", links, "sem posição:", missing)
