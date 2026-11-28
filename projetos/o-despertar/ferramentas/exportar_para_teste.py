"""Lê um .xlsx exportado da planilha e escreve o JSON plano que calcularDados_() entregaria a agregar_().

Uso: python3 exportar_para_teste.py planilha.xlsx saida.json [AAAA-MM-DD de hoje]
"""
import datetime as dt
import json
import sys

import openpyxl

wb = openpyxl.load_workbook(sys.argv[1], data_only=True)
dia = lambda v: v.strftime('%Y-%m-%d') if isinstance(v, (dt.datetime, dt.date)) else ''
val = lambda v: '' if v is None else v


def ler(nome):
    if nome not in wb.sheetnames:
        return []
    rows = list(wb[nome].iter_rows(values_only=True))
    cab = [str(h).strip() if h is not None else '' for h in rows[0]]
    return [dict(zip(cab, r)) for r in rows[1:] if any(x not in (None, '') for x in r)]


names = {n: wb.defined_names[n].attr_text for n in wb.defined_names.keys()}


def rng(nome):
    ref = names[nome].replace('$', '')
    sheet, cells = ref.split('!')
    ws = wb[sheet.strip("'")]
    return [[val(c.value) for c in row] for row in ws[cells]] if ':' in cells else ws[cells].value


one = lambda n: val(rng(n))
dados = {
    'leads': [{'faixa': val(l['Faixa']), 'resp': val(l['Responsável']), 'status': val(l['Status da ligação']),
               'canal': val(l['Canal']), 'tentativas': val(l['Tentativas']), 'followup': dia(l['Próximo follow-up']),
               'sector': val(l['Sector']), 'qtd': val(l['Qtd ingressos']), 'cupao': val(l['Cupão']),
               'motivo': val(l['Motivo (se não vai)']), 'dataCompra': dia(l['Data da compra'])} for l in ler('Leads')],
    'hist': [{'dia': dia(h['Data']), 'novo': val(h['Novo status']), 'resp': val(h['Responsável'])} for h in ler('Histórico')],
    'relatorios': [{'dia': dia(r['Data']), 'autor': val(r['Autor da análise']), 'analise': val(r['Análise do dia']),
                    'proximos': val(r['Próximos passos'])} for r in ler('Relatório diário')],
    'config': {
        'evento': one('evento_nome'), 'subtitulo': one('evento_subtitulo'), 'artista': one('evento_artista'),
        'dataEvento': dia(rng('evento_data')), 'hora': one('evento_hora'), 'local': one('evento_local'),
        'cidade': one('evento_cidade'), 'inscricoes': one('evento_inscricoes'), 'inicio': dia(rng('campanha_inicio')),
        'meta': one('meta_ingressos'), 'moeda': one('moeda'), 'producao': one('producao'), 'equipa': one('equipa_vendas'),
        'responsaveis': [r[0] for r in rng('lista_responsaveis')], 'sectores': rng('tabela_sectores'),
        'cupoes': rng('tabela_cupoes'), 'canais': [r[0] for r in rng('lista_canais')],
        'motivos': [r[0] for r in rng('lista_motivos')]},
    'hoje': sys.argv[3] if len(sys.argv) > 3 else dt.date.today().isoformat(),
    'agora': dt.datetime.now(dt.timezone.utc).isoformat(),
}
json.dump(dados, open(sys.argv[2], 'w'), ensure_ascii=False, default=str)
