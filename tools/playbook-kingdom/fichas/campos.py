"""Torna os PDF das fichas preenchíveis: acrescenta campos de texto e quadrados (AcroForm) nas posições
guardadas pelo render.mjs em <nome>.campos.json. Uso: python3 campos.py  →  <nome>.pdf"""
import json, os
from pypdf import PdfReader, PdfWriter
from pypdf.generic import (ArrayObject, BooleanObject, DictionaryObject, FloatObject, NameObject,
                           NumberObject, StreamObject, TextStringObject)

AQUI = os.path.dirname(os.path.abspath(__file__))
PX = 72 / 96          # px CSS → pontos PDF
COR = '0.11 0.10 0.19 rg'


def ap(w, h, conteudo):
    s = StreamObject()
    s.update({NameObject('/Type'): NameObject('/XObject'), NameObject('/Subtype'): NameObject('/Form'),
              NameObject('/BBox'): ArrayObject([FloatObject(0), FloatObject(0), FloatObject(w), FloatObject(h)])})
    s.set_data(conteudo.encode())
    return s


def gerar(nome):
    info = json.load(open(os.path.join(AQUI, nome + '.campos.json')))
    w = PdfWriter(clone_from=os.path.join(AQUI, nome + '.base.pdf'))
    helv = DictionaryObject({NameObject('/Type'): NameObject('/Font'), NameObject('/Subtype'): NameObject('/Type1'),
                             NameObject('/BaseFont'): NameObject('/Helvetica'), NameObject('/Encoding'): NameObject('/WinAnsiEncoding')})
    zadb = DictionaryObject({NameObject('/Type'): NameObject('/Font'), NameObject('/Subtype'): NameObject('/Type1'),
                             NameObject('/BaseFont'): NameObject('/ZapfDingbats')})
    dr = DictionaryObject({NameObject('/Font'): DictionaryObject({NameObject('/Helv'): w._add_object(helv), NameObject('/ZaDb'): w._add_object(zadb)})})
    campos = ArrayObject()
    total = 0
    for pg in info:
        pagina = w.pages[pg['pagina'] - 1]
        H = float(pagina.mediabox.height)
        annots = pagina.get('/Annots') or ArrayObject()
        for c in pg['campos']:
            x0, x1 = c['x'] * PX, (c['x'] + c['w']) * PX
            y1 = H - c['y'] * PX; y0 = H - (c['y'] + c['h']) * PX
            ww, hh = x1 - x0, y1 - y0
            d = DictionaryObject({NameObject('/Type'): NameObject('/Annot'), NameObject('/Subtype'): NameObject('/Widget'),
                                  NameObject('/Rect'): ArrayObject([FloatObject(x0), FloatObject(y0), FloatObject(x1), FloatObject(y1)]),
                                  NameObject('/F'): NumberObject(4), NameObject('/T'): TextStringObject(f"p{pg['pagina']}_{c['n']}"),
                                  NameObject('/P'): pagina.indirect_reference})
            if c['t'] == 'cb':
                lado = min(ww, hh)
                sim = ap(ww, hh, f'q 0.84 0.24 0.07 RG {lado * .14:.2f} w 1 J 1 j {ww * .2:.2f} {hh * .52:.2f} m {ww * .42:.2f} {hh * .26:.2f} l {ww * .82:.2f} {hh * .78:.2f} l S Q')   # visto desenhado, laranja da marca
                d.update({NameObject('/FT'): NameObject('/Btn'), NameObject('/V'): NameObject('/Off'), NameObject('/AS'): NameObject('/Off'),
                          NameObject('/DA'): TextStringObject(f'/ZaDb 0 Tf {COR}'),
                          NameObject('/MK'): DictionaryObject({NameObject('/CA'): TextStringObject('4')}),
                          NameObject('/AP'): DictionaryObject({NameObject('/N'): DictionaryObject({NameObject('/Sim'): w._add_object(sim), NameObject('/Off'): w._add_object(ap(ww, hh, ''))})})})
            else:
                multi = c['t'] == 'txm'
                d.update({NameObject('/FT'): NameObject('/Tx'), NameObject('/DA'): TextStringObject(f'/Helv {9 if multi else 9.5} Tf {COR}'),
                          NameObject('/V'): TextStringObject('')})
                if multi: d[NameObject('/Ff')] = NumberObject(4096)
            ref = w._add_object(d)
            annots.append(ref); campos.append(ref); total += 1
        pagina[NameObject('/Annots')] = annots
    w._root_object[NameObject('/AcroForm')] = w._add_object(DictionaryObject({
        NameObject('/Fields'): campos, NameObject('/NeedAppearances'): BooleanObject(True),
        NameObject('/DA'): TextStringObject(f'/Helv 0 Tf {COR}'), NameObject('/DR'): dr}))
    w.add_metadata({'/Title': {'ficha-passagem-closer': 'Ficha de passagem ao Closer', 'ficha-passagem-gestor-projeto': 'Ficha de passagem ao gestor de projeto',
                               'checklist-onboarding': 'Checklist de onboarding do cliente'}[nome] + ' · Kingdom Company', '/Author': 'Kingdom Company'})
    w.write(os.path.join(AQUI, nome + '.pdf'))
    print(nome, total, 'campos')


for n in ('ficha-passagem-closer', 'ficha-passagem-gestor-projeto', 'checklist-onboarding'):
    gerar(n)
