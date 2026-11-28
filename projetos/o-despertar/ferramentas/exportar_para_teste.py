"""Lê um .xlsx exportado da planilha e escreve o JSON plano que calcularDados_() entregaria a agregar_()."""
import datetime as dt, json, sys
import openpyxl

wb = openpyxl.load_workbook(sys.argv[1], data_only=True)
dia = lambda v: v.strftime('%Y-%m-%d') if isinstance(v, (dt.datetime, dt.date)) else ''
val = lambda v: '' if v is None else v

def ler(nome):
    rows = list(wb[nome].iter_rows(values_only=True))
    cab = [str(h).strip() if h is not None else '' for h in rows[0]]
    return [dict(zip(cab, r)) for r in rows[1:] if any(x not in (None, '') for x in r)]

cfg = wb['Config']
col = lambda c, a, b: [[val(cfg[f'{c}{i}'].value)] for i in range(a, b + 1)]
dados = {
    'leads': [{'faixa': val(l['Faixa']), 'resp': val(l['Responsável']), 'etapa': val(l['Etapa']), 'canal': val(l['Canal']),
               'tentativas': val(l['Tentativas']), 'followup': dia(l['Próximo follow-up']), 'sector': val(l['Sector']),
               'qtd': val(l['Qtd ingressos']), 'cond': val(l['Condição']), 'motivo': val(l['Motivo (se não vai)']),
               'dataCompra': dia(l['Data da compra'])} for l in ler('Leads')],
    'hist': [{'dia': dia(h['Data']), 'nova': val(h['Nova etapa']), 'resp': val(h['Responsável']), 'qtd': val(h['Qtd ingressos']),
              'sector': val(h['Sector']), 'cond': val(h['Condição'])} for h in ler('Histórico')],
    'compradores': [{'origem': val(c['Origem']), 'qtd': val(c['Qtd ingressos']), 'sector': val(c['Sector']),
                     'dia': dia(c['Data da compra'])} for c in ler('Compradores')],
    'config': {'evento': val(cfg['P3'].value), 'dataEvento': dia(cfg['P4'].value), 'inicio': dia(cfg['P5'].value),
               'meta': val(cfg['P6'].value), 'moeda': val(cfg['P7'].value), 'producao': val(cfg['P8'].value),
               'equipa': val(cfg['P9'].value), 'responsaveis': col('A', 3, 20),
               'sectores': [[val(cfg[f'E{i}'].value), val(cfg[f'F{i}'].value)] for i in range(3, 13)],
               'condicoes': [[val(cfg[f'H{i}'].value), val(cfg[f'I{i}'].value)] for i in range(3, 9)],
               'canais': col('K', 3, 10), 'motivos': col('M', 3, 12)},
    'hoje': sys.argv[3] if len(sys.argv) > 3 else dt.date.today().isoformat(),
    'agora': dt.datetime.now(dt.timezone.utc).isoformat(),
}
dados['config']['responsaveis'] = [r[0] for r in dados['config']['responsaveis']]
dados['config']['canais'] = [r[0] for r in dados['config']['canais']]
dados['config']['motivos'] = [r[0] for r in dados['config']['motivos']]
json.dump(dados, open(sys.argv[2], 'w'), ensure_ascii=False)
