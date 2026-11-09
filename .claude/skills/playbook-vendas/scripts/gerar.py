#!/usr/bin/env python3
"""Gera um playbook de vendas (HTML pronto para PDF A4 horizontal) a partir de um ficheiro de dados.

Uso:
  python3 gerar.py playbook.json [--saida pasta]

O JSON tem a marca (cores, letras, logótipos, estilo de capa), os rótulos e o conteúdo das 8 secções
(ver references/playbook-json.md). Os caminhos de ficheiros são relativos à pasta do JSON.
Depois: node render.mjs pasta  →  playbook.pdf
"""
import argparse
import html
import json
import re
import shutil
from pathlib import Path

AQUI = Path(__file__).resolve().parent
E = html.escape

ROTULOS = {"seccao": "Secção", "objectivo": "Objetivo", "execucao": "Execução", "conclusao": "Critério de conclusão",
           "objeccoes": "Objeções", "nesta": "Nesta secção", "indice": "Índice", "ficha": "Ficha", "de": "de",
           "avenca": "Opção de avença", "fronteira": "Fronteira", "a_validar": "a validar", "reactivacao": "Reativação", "direcao": "direção"}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('dados')
    ap.add_argument('--saida')
    a = ap.parse_args()
    fonte = Path(a.dados).resolve()
    base = fonte.parent
    D = json.loads(fonte.read_text(encoding='utf-8'))
    saida = Path(a.saida).resolve() if a.saida else base
    saida.mkdir(parents=True, exist_ok=True)
    M = D['marca']
    R = {**ROTULOS, **D.get('rotulos', {})}

    def uri(p):
        if not p:
            return ''
        q = Path(p)
        return (q if q.is_absolute() else base / q).resolve().as_uri()

    LOGO_C, LOGO_E = uri(M['logo_claro']), uri(M['logo_escuro'])
    SIMB_E = uri(M.get('simbolo_escuro') or M['logo_escuro'])
    GLOBO = uri(M.get('globo'))
    nome = M['nome']
    paginas, indice = [], []

    def rodape(sec, claro=False):
        return f'<footer class="rodape{" claro" if claro else ""}"><span>Playbook de vendas · {E(nome)}</span><span>{E(sec)}</span><span class="n"></span></footer>'

    def pagina(conteudo, sec, classe=''):
        paginas.append(f'<section class="pagina conteudo {classe}"><div class="guias"></div><header class="topo"><span class="sec">{E(sec)}</span><img class="simb" src="{SIMB_E}" alt=""></header><div class="miolo">{conteudo}</div>{rodape(sec)}</section>')

    def fundo_capa():
        if M.get('estilo_capa') == 'grelha':
            return '''<div class="grelha"></div><svg class="hud" viewBox="0 0 400 400" aria-hidden="true">
<circle cx="200" cy="200" r="196" /><circle cx="200" cy="200" r="150" /><circle cx="200" cy="200" r="70" class="fino"/>
<line x1="200" y1="4" x2="200" y2="396" class="fino"/><line x1="4" y1="200" x2="396" y2="200" class="fino"/>
<path d="M110 120 v-14 h14 M290 120 v-14 h-14 M110 280 v14 h14 M290 280 v14 h-14" class="canto"/>
<path d="M200 40 l-6 -10 h12 z M200 360 l-6 10 h12 z" class="fino"/></svg>
<span class="marca-c c-tl"><i></i><i></i></span><span class="marca-c c-tr"><i></i><i></i></span><span class="marca-c c-bl"><i></i><i></i></span><span class="marca-c c-br"><i></i><i></i></span>
<span class="risca c-tl">////////</span><span class="risca c-tr">////////</span>'''
        return f'<div class="luz"><i></i><i></i><i></i></div><img class="globo grande" src="{GLOBO}" alt="">'

    def capa_seccao(num, titulo, intro, itens):
        indice.append((num, titulo, len(paginas) + 1))
        li = ''.join(f'<li>{E(x)}</li>' for x in itens)
        paginas.append(f'''<section class="pagina escura capa-sec">{fundo_capa()}
  <div class="capa-sec-in"><img class="logo-mini" src="{LOGO_C}" alt="{E(nome)}">
    <span class="sec-n">{R["seccao"]} {num} / 08</span><div class="num">{num}</div><h1>{E(titulo)}</h1><p class="intro">{intro}</p>
    <div class="nesta"><span>{R["nesta"]}</span><ul>{li}</ul></div></div>{rodape(f"{num} · {titulo}", True)}</section>''')

    def lista(itens, cls='pontos'):
        return f'<ul class="{cls}">' + ''.join(f'<li>{x}</li>' for x in itens) + '</ul>'

    def ico(x, cls=''):
        return f'<span class="ico {cls}">{x}</span>'

    def cabeca(t, lead=None, rot=None):
        return f'<div class="cabeca centro">{f"<span class=rot>{rot}</span>" if rot else ""}<h2>{t}</h2>{f"<p class=lead>{lead}</p>" if lead else ""}</div>'

    def grade(cols, n=None, cls=''):
        n = n or len(cols)
        return f'<div class="grade g{n} {cls}">' + ''.join(f'<div class="gc">{c}</div>' for c in cols) + '</div>'

    def dst(t, c):
        return f'<p class="dst"><strong>{t}</strong> {c}</p>'

    def capa_txt(i):
        return D['capas'][i]

    # ---------- capa ----------
    C = D['capa']
    paginas.append(f'''<section class="pagina escura capa">{fundo_capa()}
  <img class="logo" src="{LOGO_C}" alt="{E(nome)}">
  <div class="capa-txt"><span class="selo">{C["selo"]}</span><h1>{C["titulo"]}</h1><p>{C["subtitulo"]}</p><span class="meta">{C["versao"]}</span></div></section>''')
    paginas.append('__COMO__')
    paginas.append('__INDICE__')

    # ---------- 01 ----------
    Q = D['quem_somos']
    capa_seccao('01', *capa_txt('01'))
    pagina(f'''{cabeca('A empresa em 30 segundos', rot='01 · Quem somos')}<blockquote class="citacao">«{Q["pitch"][0]}»</blockquote>
<p class="cit-apoio">{Q["pitch"][1]}</p>''', '01 · Quem somos', 'pag-centro')
    difs = [f'{ico(f"0{k}")}{dst(t, c)}' for k, (t, c) in enumerate(Q['diferenciais'], 1)]
    pagina(f'''{cabeca(f'Porque escolher a {E(nome)}', 'Cinco diferenciais que valem para todos os serviços.')}
{grade(difs[:3])}{grade(difs[3:] + [''] * (3 - len(difs[3:])), 3, 'sem-topo')}''', '01 · Quem somos')
    if Q.get('regras'):
        G = Q['regras']
        usar = ' '.join(f'<span class="pal ok">{E(p)}</span>' for p in G['usar'])
        evitar = ' '.join(f'<span class="pal nao">{E(p)}</span>' for p in G['evitar'])
        pagina(f'''{cabeca('O que dizemos e o que não dizemos', 'As mesmas regras da comunicação da marca valem para cada conversa comercial.')}
{grade([f'{ico("✓", "ok")}<h4 class="gt">Palavras a usar</h4><p class="pals">{usar}</p>', f'{ico("×", "alerta")}<h4 class="gt">Palavras a evitar</h4><p class="pals">{evitar}</p>'], 2, 'grande')}
{grade([dst(t, c) for t, c in G['fronteiras']], len(G['fronteiras']), 'sem-topo')}''', '01 · Quem somos')

    # ---------- 02 ----------
    S = D['servicos']
    F = S['fichas']
    capa_seccao('02', *capa_txt('02'))
    areas = {}
    for k, f in enumerate(F):
        areas.setdefault(f['area'], []).append((k, f['nome']))
    cols = [f'<h4 class="gt">{E(a)}</h4><ol class="servs">' + ''.join(f'<li><span>{k+1:02d}</span>{E(n)}</li>' for k, n in ss) + '</ol>' for a, ss in areas.items()]
    notas = ''.join(f'<p class="nota centro"><strong>{E(p)}.</strong> {t}</p>' for p, t in S.get('notas_pilar', {}).items())
    validar = any(f.get('validar') for f in F)
    pagina(f'''{cabeca(f'{len(F)} serviços, {len(areas)} áreas' if len(areas) != 4 else f'Doze serviços, quatro pilares' if len(F) == 12 else f'{len(F)} serviços', S['lead'])}
{grade(cols)}{notas}
<div class="regra-l"><span class="rot">Regra</span>{dst(*S['regra'])}{f'<p class="nota">Os entregáveis marcados <span class="tag">{R["a_validar"]}</span> aguardam confirmação da {R["direcao"]}.</p>' if validar else ''}</div>''', '02 · O que vendemos')
    for k, f in enumerate(F, 1):
        tag = f' <span class="tag">{R["a_validar"]}</span>' if f.get('validar') else ''
        sec = f'02 · {R["ficha"]} {k:02d} · {f["nome"]}'
        cab = f'<div class="ficha-cab"><span class="rot">{E(f["area"])} · {R["ficha"]} {k:02d} {R["de"]} {len(F)}</span><h2>{E(f["nome"])}</h2></div>'
        pagina(f'''{cab}
{grade([f'{ico("1")}<h4 class="gt">O que é?</h4><p class="cz">{f["oque"]}</p>', f'{ico("2")}<h4 class="gt">Que problema resolve?</h4><p class="cz">{f["problema"]}</p>'], 2, 'grande')}
{grade([f'{ico("!", "alerta")}<h4 class="gt">Dores identificadas</h4>{lista(f["dores"], "dores")}', f'{ico("3")}<h4 class="gt">Quem tem essa dor?</h4>{lista(f["quem"])}'], 2, 'sem-topo')}''', sec)
        extra = []
        if f.get('avenca'):
            extra.append(dst(R['avenca'] + '.', f['avenca']))
        if f.get('fronteira'):
            extra.append(dst(R['fronteira'] + '.', f['fronteira']))
        pagina(f'''{cab}
{grade([f'{ico("4")}<h4 class="gt">Qual é a transformação?</h4><div class="ad"><p class="antes"><span>Antes</span>{f["antes"]}</p><p class="depois"><span>Depois</span>{f["depois"]}</p></div>', f'{ico("5")}<h4 class="gt">O que entregamos?{tag}</h4>{lista(f["entrega"], "checks")}'], 2, 'grande')}
{grade(extra, len(extra), 'sem-topo extra') if extra else ''}
<div class="pitch"><blockquote class="citacao media">«{re.sub(r"^«|»$", "", f["pitch"])}»</blockquote><p class="cit-autor"><strong>6 · Como apresentar comercialmente.</strong> Dizer por palavras próprias, ligado à dor que o cliente descreveu.</p></div>''', sec, 'pag-ficha-b')

    # ---------- 03 ----------
    B = D['bant']
    capa_seccao('03', *capa_txt('03'))
    cols = []
    for c in B['criterios']:
        cols.append(f'''{ico(c["letra"])}<h4 class="gt">{c["nome"]} <small>{c["en"]}</small></h4><p class="cz">{c["confirmar"]}</p>
<span class="mini">Perguntas</span>{lista(c["perguntas"], "perg")}<span class="mini ok">Cumprido quando</span><p class="cz">{c["cumprido"]}</p>
<span class="mini alerta">Sinal de alerta</span><p class="cz">{c["alerta"]}</p>''')
    pagina(f'{cabeca("Método BANT", B["lead"])}{grade(cols)}', '03 · Como qualificamos')
    bl = [f'<div class="bl{" leve" if c["letra"] == "T" else ""}">{c["letra"]}</div><h4 class="gt">{c["nome"]}</h4><p class="cz {"" if c["letra"] == "T" else "obr"}">{"Define a prioridade" if c["letra"] == "T" else "Obrigatório"}</p>' for c in B['criterios']]
    pagina(f'''{cabeca('Regra de passagem', rot='03 · Como qualificamos')}{grade(bl, 4, 'centrada')}<blockquote class="citacao media">{B["regra"]}</blockquote>''', '03 · Como qualificamos', 'pag-centro')

    # ---------- 04 ----------
    P = D['processo']
    capa_seccao('04', *capa_txt('04'))
    def et(k, e):
        return f'<span class="et-n">{k}</span><h4 class="gt">{E(e[0])}</h4><p class="cz">{E(e[2])}</p>'
    ets = P['etapas']
    pagina(f'''{cabeca('As sete etapas', P['lead'])}
<div class="faixa"><span class="papel">SDR</span>{grade([et(k, e) for k, e in enumerate(ets[:3], 1)] + ['<p class="passa">Ficha de passagem no CRM →</p>'], 4)}</div>
<div class="faixa"><span class="papel cl">Closer</span>{grade([et(k, e) for k, e in enumerate(ets[3:], 4)], 4, 'sem-topo')}</div>
<div class="estados"><span class="rot">Estados da oportunidade no CRM</span><p>{' <i>→</i> '.join(E(s) for s in P['estados'])}</p><p class="nota">{P['estados_nota']}</p></div>''', '04 · Processo comercial')
    cabt = f'<tr><th>Etapa</th><th>Quem</th><th>{R["objectivo"]}</th><th>{R["execucao"]}</th><th>{R["conclusao"]}</th><th>Prazo</th></tr>'
    for parte, rows, n0 in (('1 a 4', ets[:4], 1), ('5 a 7', ets[4:], 5)):
        linhas = ''.join('<tr>' + f'<td>{n0 + i}. {E(r[0])}</td>' + ''.join(f'<td>{E(x)}</td>' for x in r[1:]) + '</tr>' for i, r in enumerate(rows))
        pagina(f'''{cabeca(f'Responsabilidades e prazos · etapas {parte}', f'Cada etapa tem {R["objectivo"].lower()}, {R["execucao"].lower()} e {R["conclusao"].lower()}. Só se avança quando o critério está cumprido.')}
<table class="tab tab-proc"><thead>{cabt}</thead><tbody>{linhas}</tbody></table>''', '04 · Processo comercial')

    # ---------- 05 ----------
    Sd = D['sdr']
    capa_seccao('05', *capa_txt('05'))
    regras = [f'{ico(str(k))}{dst(x, "")}' for k, x in enumerate(Sd['regras'], 1)]
    pagina(f'''{cabeca('A · Primeiro contacto', rot='05 · Guia do SDR')}<blockquote class="citacao media">«{Sd["script"]}»</blockquote>
<p class="cit-autor"><strong>Pedido de cotação ou avaliação inicial.</strong> Guião de abertura do SDR.</p>
{grade([dst(R["objectivo"] + '.', Sd['objectivo']), dst('Conclusão.', Sd['conclusao']), dst(*Sd['preco'])], 3)}{grade(regras, len(regras), 'sem-topo')}''', '05 · Guia do SDR', 'pag-centro')
    pq = [f'<li>{q}<small>{t}</small></li>' for q, t in Sd['perguntas']]
    h = (len(pq) + 1) // 2
    pagina(f'''{cabeca('B · Perguntas de qualificação', Sd['perguntas_lead'])}<div class="duas-col"><ol class="pergs">{''.join(pq[:h])}</ol><ol class="pergs" style="counter-reset: q {h}">{''.join(pq[h:])}</ol></div>''', '05 · Guia do SDR')
    pagina(f'''{cabeca('C · Critérios de qualificação', Sd['criterios'])}{grade(bl, 4, 'centrada')}''', '05 · Guia do SDR', 'pag-centro')
    h = (len(Sd['ficha']) + 1) // 2
    pagina(f'''{cabeca('D · Ficha de passagem ao Closer', Sd['ficha_lead'])}<div class="duas-col">{lista(Sd['ficha'][:h], 'caixas')}{lista(Sd['ficha'][h:], 'caixas')}</div>''', '05 · Guia do SDR')

    # ---------- 06 ----------
    Cl = D['closer']
    capa_seccao('06', *capa_txt('06'))
    cols = [f'<span class="et-n">{k}</span><h4 class="gt">{m[0]} <small>{m[1]}</small></h4><span class="mini">{R["objectivo"]}</span><p class="cz">{m[2]}</p><span class="mini">{R["execucao"]}</span><p class="cz">{m[3]}</p><span class="mini ok">Avança quando</span><p class="cz">{m[4]}</p>' for k, m in enumerate(Cl['momentos'], 1)]
    pagina(f'{cabeca("Os cinco momentos da reunião", Cl["lead"])}{grade(cols, 5)}', '06 · Guia do Closer')
    pagina(f'''{cabeca('Abrir e fechar a reunião', rot='06 · Guia do Closer')}
<blockquote class="citacao media">«{Cl["abertura"]}»</blockquote><p class="cit-autor"><strong>Abertura.</strong> Criar confiança e controlar a agenda.</p>
<blockquote class="citacao media lar">«{Cl["decisao"]}»</blockquote><p class="cit-autor"><strong>Pedir a decisão.</strong> Sair sempre com uma decisão ou uma data.</p>''', '06 · Guia do Closer', 'pag-centro')
    pagina(f'''{cabeca('Diagnóstico e passagem à entrega', rot='06 · Guia do Closer')}
{grade([f'<h4 class="gt">Perguntas de diagnóstico</h4><ol class="pergs">{"".join(f"<li>{q}</li>" for q in Cl["diagnostico"])}</ol>', f'<h4 class="gt">Ficha de arranque · passagem à entrega</h4>{lista(Cl["arranque"], "caixas")}'], 2)}''', '06 · Guia do Closer')

    # ---------- 07 ----------
    O = D['objeccoes']
    capa_seccao('07', *capa_txt('07'))
    sec7 = f'07 · Tratamento de {R["objeccoes"].lower()}'
    pagina(f'''{cabeca('O método em três passos', O['lead'])}
{grade([f'{ico(str(k))}{dst(x, "")}' for k, x in enumerate(O['metodo'], 1)], 3, 'centrada')}''', sec7, 'pag-centro')
    L = O['lista']
    for a0 in range(0, len(L), 5):
        rows = L[a0:a0 + 5]
        cab = '<tr>' + ''.join(f'<th>{E(x)}</th>' for x in O['colunas']) + '</tr>'
        corpo = ''.join('<tr>' + ''.join(f'<td>{E(x)}</td>' for x in r) + '</tr>' for r in rows)
        pagina(f'''{cabeca(f'{R["objeccoes"]} {a0 + 1} a {a0 + len(rows)}')}<table class="tab tab-obj"><thead>{cab}</thead><tbody>{corpo}</tbody></table>''', sec7)

    # ---------- 08 ----------
    Fu = D['followup']
    capa_seccao('08', *capa_txt('08'))
    cols = [f'<div class="dd">Dia {d}</div><span class="canal">{c}</span><span class="mini">SDR · lead sem resposta</span><p class="cz">{s}</p><span class="mini">Closer · proposta sem decisão</span><p class="cz">{x}</p>' for d, c, s, x in Fu['cadencia']]
    pagina(f'{cabeca("Cadência de 30 dias", Fu["lead"])}{grade(cols, len(cols))}', '08 · Follow-up e recuperação')
    Mo = Fu['modelos']
    for grupo in (Mo[:3], Mo[3:]):
        cols = [f'<span class="mcanal {c.lower()}">{E(c)}</span><h4 class="gt">{E(t)}</h4>' + ''.join(f'<p class="cz msg">{E(p)}</p>' for p in ps) for c, t, ps in grupo]
        pagina(f'''{cabeca('Modelos de mensagem', Fu['modelos_lead'])}{grade(cols, 3)}''', '08 · Follow-up e recuperação')
    pagina(f'''{cabeca(R['reactivacao'], rot='08 · Follow-up e recuperação')}{grade([dst(t, c) for t, c in Fu['reactivacao']], len(Fu['reactivacao']))}''', '08 · Follow-up e recuperação', 'pag-centro')

    # ---------- contracapa ----------
    CC = D['contracapa']
    cont = ''.join(f'<span>{E(c)}</span>' for c in CC.get('contactos', []))
    paginas.append(f'''<section class="pagina escura contracapa">{fundo_capa()}<div class="cc-in"><img class="logo-cc" src="{LOGO_C}" alt="{E(nome)}">
<p class="slogan">{CC["slogan"]}</p>{f'<div class="contactos">{cont}</div>' if cont else ''}<p class="interno">{CC["interno"]}</p></div></section>''')

    # ---------- como usar e índice ----------
    CU = D['como_usar']
    def pag_fixa(conteudo, sec, cls=''):
        return f'<section class="pagina conteudo {cls}"><div class="guias"></div><header class="topo"><span class="sec">{E(sec)}</span><img class="simb" src="{SIMB_E}" alt=""></header><div class="miolo">{conteudo}</div>{rodape(sec)}</section>'
    quem = ''.join('<tr>' + ''.join(f'<td>{E(x)}</td>' for x in r) + '</tr>' for r in CU['funcoes'])
    como = pag_fixa(f'''{cabeca('Como usar este playbook', CU['lead'])}
{grade([f'{ico("1")}{dst(R["objectivo"] + ".", "O que tem de conseguir em cada etapa.")}', f'{ico("2")}{dst(R["execucao"] + ".", "O que fazer, perguntar ou dizer.")}', f'{ico("3")}{dst(R["conclusao"] + ".", "Como saber que pode avançar.")}'], 3)}
<table class="tab tab-quem"><thead><tr><th>{R["seccao"]}</th><th>SDR</th><th>Closer</th></tr></thead><tbody>{quem}</tbody></table><p class="nota centro">{CU['fora']}</p>''', 'Como usar este playbook')
    idx = ''.join(f'<li><span class="in">{n}</span><span class="it">{E(t)}</span><span class="ip">{p:02d}</span></li>' for n, t, p in indice)
    ind = pag_fixa(f'{cabeca(R["indice"])}<ol class="indice">{idx}</ol>', R['indice'], 'pag-centro')
    paginas = [como if p == '__COMO__' else ind if p == '__INDICE__' else p for p in paginas]

    # ---------- estilo ----------
    cores = M['cores']
    var = ''.join(f'--{k.replace("_", "-")}: {v};' for k, v in cores.items())
    ff = ''.join(f"@font-face {{ font-family: 'Marca'; src: url({uri(p)}); font-weight: {w}; }}" for w, p in M['fontes'].items())
    if M.get('fonte_mono'):
        ff += ''.join(f"@font-face {{ font-family: 'MarcaMono'; src: url({uri(p)}); font-weight: {w}; }}" for w, p in M['fonte_mono'].items())
    css = (AQUI / 'playbook.css').read_text(encoding='utf-8').replace('__GRAO__', uri(M.get('grao')) if M.get('grao') else 'none')
    mono = "'MarcaMono', " if M.get('fonte_mono') else ''
    estilo = f":root {{ {var} --mono: {mono}'Marca', sans-serif; }} {ff}"
    (saida / 'playbook.html').write_text(f'''<!doctype html><html lang="pt-PT"><head><meta charset="utf-8"><title>Playbook de vendas · {E(nome)}</title><style>{estilo}{css}</style></head><body class="capa-{M.get("estilo_capa", "globo")}">{''.join(paginas)}</body></html>''', encoding='utf-8')
    print(f'{saida / "playbook.html"}: {len(paginas)} páginas')


if __name__ == '__main__':
    main()
