import json
P = json.load(open('pecas.json')); L = P['linhas']
R = 240
def globo_svg(tam, base, destaque=None, cor_d='#2B2850', extra=''):
    s = f'<svg width="{tam}" height="{tam}" viewBox="0 0 480 480">'
    s += f'<path fill="{base}" fill-rule="evenodd" d="{P["globo"]}"/>'
    for k in (destaque or []):
        s += f'<path fill="{cor_d}" fill-rule="evenodd" d="{P[k]}"/>'
    return s + extra + '</svg>'
# linhas de construção à volta do globo (centro do quadro = 600, 470)
cx, cy, k = 600, 480, 1.0   # escala 1: globo com 480 px
lin = []
for rr in (240, 300, 380, 470, 580, 700):
    lin.append(f'<circle cx="{cx}" cy="{cy}" r="{rr}"/>')
lin.append(f'<circle cx="{cx}" cy="{cy}" r="{L["r"]:.1f}"/>')
for a, b in ((L['a_ext'], L['b_ext']), (L['a_int'], L['b_int'])):
    lin.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{a:.1f}" ry="{b:.1f}"/>')
    lin.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{a*1.9:.1f}" ry="{b*1.9:.1f}"/>')
lin.append(f'<line x1="{cx}" y1="0" x2="{cx}" y2="920"/><line x1="0" y1="{cy}" x2="1200" y2="{cy}"/>')
for dx in (L['eixo']/2, -L['eixo']/2): lin.append(f'<line x1="{cx+dx:.1f}" y1="0" x2="{cx+dx:.1f}" y2="920"/>')
for dy in (L['equador']/2, -L['equador']/2): lin.append(f'<line x1="0" y1="{cy+dy:.1f}" x2="1200" y2="{cy+dy:.1f}"/>')
itens = [(['anel'], 'O círculo', 'é o Reino', 'a unidade'), (['estrela'], 'A estrela', 'é a Direção', 'o conhecimento'),
         (['eixo', 'equador'], 'Os eixos', 'são a Estrutura', 'o vertical e o horizontal'), (['meridianos'], 'Os meridianos', 'são o Método', 'a metodologia')]
cards = ''.join(f'<div class="item">{globo_svg(170, "#D4D0CA", keys)}<p><span>{t}</span><br>{m}<small>{x}</small></p></div>' for keys, t, m, x in itens)
html = f'''<!DOCTYPE html><html lang="pt"><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Google+Sans:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:'Google Sans',sans-serif;-webkit-font-smoothing:antialiased}}
#quadro{{width:1200px;height:1600px;position:relative;overflow:hidden;background:#ECE9E2}}
.topo{{position:relative;height:960px;overflow:hidden;background:radial-gradient(120% 90% at 30% 20%,#3A3670 0%,#2B2850 45%,#16142B 100%)}}
.topo .grao{{position:absolute;inset:0;opacity:.08;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}}
.topo svg.linhas{{position:absolute;inset:0}}
.topo svg.linhas *{{fill:none;stroke:rgba(196,192,230,.32);stroke-width:1.4}}
.topo h1{{position:absolute;top:120px;width:100%;text-align:center;color:#F4F2FA;font-weight:400;font-size:38px;letter-spacing:.01em}}
.topo .simbolo{{position:absolute;left:{cx-R}px;top:{cy-R}px}}
.baixo{{display:grid;grid-template-columns:repeat(4,1fr);gap:40px 0;padding:80px 70px 0}}
.frase{{position:absolute;left:0;right:0;bottom:118px;text-align:center;font-size:24px;line-height:1.5;color:#2B2850;padding:0 150px}}
.frase b{{font-weight:500}}
.item{{display:flex;flex-direction:column;align-items:center;gap:22px}}
.item p{{font-style:italic;font-size:24px;line-height:1.35;color:#3E3A6E;text-align:left;width:200px}}
.item p small{{display:block;margin-top:6px;font-style:normal;font-size:16px;color:#6A6682}}
.item p span{{font-style:italic}}
.assin{{position:absolute;right:56px;bottom:28px;text-align:right;font-style:italic;font-size:15px;color:#1C1A30;line-height:1.3}}
</style></head><body><div id="quadro">
<div class="topo"><div class="grao"></div>
<svg class="linhas" width="1200" height="960" viewBox="0 0 1200 960">{''.join(lin)}</svg>
<h1>Reino, Direção, Estrutura e Método</h1>
<div class="simbolo">{globo_svg(480, "#F4F2FA")}</div></div>
<div class="baixo">{cards}</div>
<p class="frase">É isto que a Kingdom faz, em todas as suas marcas: <b>dá direção, estrutura e clareza para crescer com propósito.</b></p>
<div class="assin">Kingdom<br>conceito do símbolo © 2026</div>
</div></body></html>'''
open('quadro.html', 'w').write(html)
print('ok')
