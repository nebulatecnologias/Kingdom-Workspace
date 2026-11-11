import json, sys
import xml.etree.ElementTree as ET
raw=json.load(open(sys.argv[1]))
t=[r['text'] for r in raw if r['text'].startswith('{')][0]
d,_=json.JSONDecoder().raw_decode(t)
root=ET.fromstring(d['data']['xml'])
def runs(e):
    out=[]
    def walk(x,b=False,i=False):
        if x.tag=='bold': b=True
        if x.tag=='italic': i=True
        if x.text and x.tag in ('text','bold','italic'): out.append({'t':x.text,'b':b,'i':i})
        for c in x:
            if c.tag in ('comment',): 
                if c.tail: out.append({'t':c.tail,'b':b,'i':i})
                continue
            walk(c,b,i)
            if c.tail and x.tag in ('bold','italic','text'): out.append({'t':c.tail,'b':b,'i':i})
    for c in e: walk(c)
    # merge
    m=[]
    for r in out:
        if m and m[-1]['b']==r['b'] and m[-1]['i']==r['i']: m[-1]['t']+=r['t']
        else: m.append(dict(r))
    return m
def para(p): return {'type':'p','h':int(p.get('heading') or 0),'runs':runs(p)}
blocks=[]
for c in root:
    if c.tag=='paragraph': blocks.append(para(c))
    elif c.tag in ('list','blockquote'):
        items=[]
        for li in c:
            if li.tag=='listItem': items.append([para(p) for p in li if p.tag=='paragraph'])
            elif li.tag=='paragraph': items.append([para(li)])
        blocks.append({'type':c.tag,'kind':c.get('kind'),'items':items})
    elif c.tag=='table':
        rows=[]
        for r in c:
            if r.tag!='row': continue
            rows.append([[para(p) for p in cell if p.tag=='paragraph'] for cell in r if cell.tag=='cell'])
        blocks.append({'type':'table','rows':rows})
    elif c.tag=='embed': blocks.append({'type':'embed','caption':c.get('caption')})
json.dump(blocks,open('doc.json','w'),ensure_ascii=False,indent=1)
def s(p): return ''.join(('**'+r['t']+'**') if r['b'] else r['t'] for r in p['runs'])
md=[]
for b in blocks:
    if b['type']=='p': md.append(('#'*b['h']+' ' if b['h'] else '')+s(b))
    elif b['type'] in('list','blockquote'):
        for it in b['items']: md.append(('> ' if b['type']=='blockquote' else '- ')+' / '.join(s(p) for p in it))
    elif b['type']=='table':
        for r in b['rows']: md.append('| '+' | '.join(' / '.join(s(p) for p in c) for c in r))
    else: md.append('[EMBED '+str(b.get('caption'))+']')
open('doc.md','w').write('\n'.join(md)); print(len(blocks), d['data']['rev'])
