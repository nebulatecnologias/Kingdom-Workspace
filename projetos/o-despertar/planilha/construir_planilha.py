"""Constrói a planilha de O Despertar a partir do ficheiro original de leads.

Uso: python3 construir_planilha.py <original.xlsx> <saida.xlsx>

Abas: Como usar · Leads · Relatório diário · Histórico · Painel · Config
"""
import datetime as dt
import re
import sys

import openpyxl
import xlsxwriter
from xlsxwriter.utility import xl_col_to_name

ORIG, SAIDA = sys.argv[1], sys.argv[2]
DATA_MIGRACAO = dt.date(2026, 11, 27)   # dia em que a lista original foi trabalhada
INICIO = dt.date(2026, 11, 27)
EVENTO = dt.date(2026, 12, 5)
MAX = 50000

RESPONSAVEIS = ["Mayra", "Maria", "Pessoa 1", "Pessoa 2", "Pessoa 3"]
STATUS = [
    ("Por contactar", "Ainda ninguém falou com esta pessoa."),
    ("Sem resposta", "Ligámos ou escrevemos e não respondeu."),
    ("Em conversa", "Atendeu e está a pensar. Marcar follow-up."),
    ("Vai comprar", "Disse que vai comprar. Marcar follow-up até pagar."),
    ("Comprou", "Pagou. Preencher Sector, Qtd ingressos e Cupão."),
    ("Não vai participar", "Recusou. Escolher o motivo."),
    ("Contacto inválido", "Número errado, desligado ou sem WhatsApp."),
]
ABERTOS = ["Sem resposta", "Em conversa", "Vai comprar"]
ATENDERAM = ["Em conversa", "Vai comprar", "Comprou", "Não vai participar"]
SECTORES = [("Sector A", 4761, "Mais próximo do palco"), ("Sector B", 3174, "Área central da sala")]
CUPOES = [("Sem cupão", 1, "Preço normal"),
          ("BLACKFRIDAY (50%)", 0.5, "27/11/2026, das 18h às 24h"),
          ("DEIVE15 (15%)", 0.85, "Até ao dia do evento")]
CANAIS = ["Chamada", "WhatsApp", "SMS", "Email", "Presencial"]
MOTIVOS = ["Falta de tempo / agenda", "Financeiro", "Viagem / trabalho",
           "Sem interesse", "Já tem outro compromisso", "Outro"]
PARAMS = [
    ("evento_nome", "Nome do evento", "O Despertar"),
    ("evento_subtitulo", "Subtítulo", "Tour Mundial"),
    ("evento_artista", "Artista", "Deive Leonardo"),
    ("evento_data", "Data do evento", dt.datetime.combine(EVENTO, dt.time())),
    ("evento_hora", "Hora", "16h00"),
    ("evento_local", "Local", "Centro Internacional de Conferências Joaquim Chissano"),
    ("evento_cidade", "Cidade", "Maputo · Moçambique"),
    ("evento_inscricoes", "Inscrições", "www.tabater.co.mz"),
    ("campanha_inicio", "Início da campanha", dt.datetime.combine(INICIO, dt.time())),
    ("meta_ingressos", "Meta de ingressos", None),
    ("moeda", "Moeda", "MT"),
    ("producao", "Realização", "Laços Eternos"),
    ("equipa_vendas", "Equipa de vendas", "Kingdom Company"),
]

MAPA_STATUS = {None: "Por contactar", "Sem Resposta": "Sem resposta", "Vai se Inscrever": "Vai comprar",
               "Nao vai Participar": "Não vai participar", "Ja se Inscreveu": "Comprou"}
MAPA_RESP = {"Mayra..KD": "Mayra", "Maria. KD": "Maria"}


def interpretar_obs(obs, status):
    """Tira sector, quantidade, cupão, motivo e follow-up do texto livre."""
    out = {}
    if obs is None:
        return out
    if isinstance(obs, (int, float)):        # "50%" convertido pelo Excel em 0.5
        if obs == 0.5:
            out["cupao"] = "BLACKFRIDAY (50%)"
        return out
    t = obs.lower()
    m = re.search(r"\b(sector|sec[cç][aã]o|sess[aã]o)\s*([ab])\b", t)
    if m:
        out["sector"] = "Sector " + m.group(2).upper()
    m = re.search(r"(\d+)\s*(bilhetes?|tickets?|pessoas?)", t)
    if m:
        out["qtd"] = int(m.group(1))
    if "50%" in t:
        out["cupao"] = "BLACKFRIDAY (50%)"
    if status == "Não vai participar":
        if "monet" in t:
            out["motivo"] = "Financeiro"
        elif "viagem" in t:
            out["motivo"] = "Viagem / trabalho"
        elif any(k in t for k in ("tempo", "agenda", "trabalho")):
            out["motivo"] = "Falta de tempo / agenda"
    if "2a feira" in t or "2 feira" in t or "proxima semana" in t:
        out["follow"] = dt.date(2026, 11, 30)
    elif "dia 3" in t:
        out["follow"] = dt.date(2026, 12, 3)
    elif "28/11" in t:
        out["follow"] = dt.date(2026, 11, 28)
    elif any(k in t for k in ("ligar de volta", "final do dia", "retrornar", "retornar")):
        out["follow"] = DATA_MIGRACAO
    if "whatsap" in t and "sem whatsap" not in t:
        out["canal"] = "WhatsApp"
    return out


src = openpyxl.load_workbook(ORIG, read_only=True)
leads_orig = [(tuple(r) + (None,) * 11)[:11] for r in src["Leads para Abordar"].iter_rows(min_row=2, values_only=True)
              if any(v is not None for v in r)]

wb = xlsxwriter.Workbook(SAIDA)
wb.set_properties({"title": "O Despertar · Pipeline de vendas", "company": "Kingdom Company"})

# ---------- formatos ----------
AZUL, CINZA, LINHA = "#1B4F9C", "#F2F5FA", "#D9DFEA"
F = wb.add_format
f_head = F({"bold": True, "font_color": "#FFFFFF", "bg_color": AZUL, "valign": "vcenter", "text_wrap": True,
            "border": 1, "border_color": AZUL, "font_size": 10})
f_head_auto = F({"bold": True, "font_color": "#FFFFFF", "bg_color": "#5B6B85", "valign": "vcenter",
                 "text_wrap": True, "border": 1, "border_color": "#5B6B85", "font_size": 10})
f_txt = F({"font_size": 10})
f_num = F({"font_size": 10, "num_format": "0"})
f_date = F({"font_size": 10, "num_format": "dd/mm/yyyy"})
f_dt = F({"font_size": 10, "num_format": "dd/mm/yyyy hh:mm"})
f_mt = F({"font_size": 10, "num_format": '#,##0 "MT"'})
f_link = F({"font_size": 10, "font_color": "#1A7F37", "underline": 1})
f_muted = F({"font_size": 9, "font_color": "#6B7280"})
f_title = F({"bold": True, "font_size": 16, "font_color": AZUL})
f_sub = F({"font_size": 10, "font_color": "#6B7280", "italic": True})
f_sec = F({"bold": True, "font_size": 11, "font_color": AZUL, "bottom": 2, "bottom_color": AZUL})
f_lbl = F({"font_size": 10, "bg_color": CINZA, "border": 1, "border_color": LINHA})
bx = {"border": 1, "border_color": LINHA}
f_val = F({"font_size": 11, "bold": True, "num_format": "#,##0", **bx})
f_valmt = F({"font_size": 11, "bold": True, "num_format": '#,##0 "MT"', **bx})
f_valpct = F({"font_size": 11, "bold": True, "num_format": "0.0%", **bx})
f_cell = F({"font_size": 10, "num_format": "#,##0", **bx})
f_cellpct = F({"font_size": 10, "num_format": "0.0%", **bx})
f_celldate = F({"font_size": 10, "num_format": "ddd dd/mm", **bx})
f_cellmt = F({"font_size": 10, "num_format": '#,##0 "MT"', **bx})
cf = {"font_size": 10, "bg_color": "#FFF8E6", "border": 1, "border_color": "#E8D9A8"}
f_cfg = F(cf)
f_cfgdate = F({**cf, "num_format": "dd/mm/yyyy"})
f_cfgmt = F({**cf, "num_format": '#,##0 "MT"'})
f_cfgpct = F({**cf, "num_format": "0%"})
f_wrap = F({"font_size": 10, "text_wrap": True, "valign": "top"})
f_rel_date = F({"font_size": 10, "bold": True, "num_format": "ddd dd/mm/yyyy", "valign": "top", "bg_color": CINZA,
                "border": 1, "border_color": LINHA})
f_rel = F({"font_size": 10, "text_wrap": True, "valign": "top", "bg_color": "#FFF8E6", "border": 1,
           "border_color": "#E8D9A8"})

STATUS_COR = {"Por contactar": ("#F3F4F6", "#374151"), "Sem resposta": ("#FEF3C7", "#92400E"),
              "Em conversa": ("#DBEAFE", "#1E40AF"), "Vai comprar": ("#EDE9FE", "#5B21B6"),
              "Comprou": ("#DCFCE7", "#166534"), "Não vai participar": ("#FEE2E2", "#991B1B"),
              "Contacto inválido": ("#E5E7EB", "#6B7280")}

# =====================================================================
# Como usar
# =====================================================================
ws = wb.add_worksheet("Como usar")
ws.hide_gridlines(2)
ws.set_column("A:A", 3)
ws.set_column("B:B", 110)
ws.write("B2", "O Despertar · Pipeline de vendas", f_title)
ws.write("B3", "Deive Leonardo · Realização Laços Eternos · Vendas Kingdom Company · 5 de Dezembro, 16h00, CIC Joaquim Chissano", f_sub)
linhas = [
    ("sec", "Como trabalhar cada contacto"),
    ("txt", "1. Na aba Leads, filtre a coluna Responsável pelo seu nome e a coluna Status da ligação por \"Por contactar\"."),
    ("txt", "2. Ligue ou escreva no WhatsApp (o link abre a conversa). Depois de cada tentativa, escolha o Status da ligação e o Canal."),
    ("txt", "3. Se a pessoa pediu para voltar a falar mais tarde, preencha Próximo follow-up com a data combinada."),
    ("txt", "4. Quando a pessoa pagar: Status = Comprou, e preencha Sector, Qtd ingressos e Cupão. O Valor calcula-se sozinho."),
    ("txt", "5. Se recusar: Status = Não vai participar, e escolha o Motivo. Use Observação só para detalhes que não cabem nas colunas."),
    ("sec", "No fim de cada dia (responsável da equipa)"),
    ("txt", "• Na aba Relatório diário, escreva a análise do dia e os próximos passos na linha da data. Aparece no calendário do dashboard dos clientes."),
    ("sec", "O que é automático (depois de instalar o script)"),
    ("txt", "• Último contacto, Tentativas e Data da compra preenchem-se sozinhos quando muda o Status da ligação."),
    ("txt", "• Cada mudança de status fica registada na aba Histórico. É daí que sai a atividade por dia. Não edite o Histórico."),
    ("txt", "• O dashboard lê a planilha a cada minuto e mostra só números agregados e o Relatório diário: nunca nomes, telefones ou emails de contactos."),
    ("sec", "Preços e cupões"),
    ("txt", "• Sector A (mais próximo do palco): 4 761 MT. Sector B (área central): 3 174 MT."),
    ("txt", "• BLACKFRIDAY: 50% de desconto, só a 27/11 das 18h às 24h. DEIVE15: 15% de desconto, até ao dia do evento."),
    ("sec", "Status da ligação"),
]
r = 5
for tipo, txt in linhas:
    if tipo == "sec":
        r += 1
        ws.write(r, 1, txt, f_sec)
    else:
        ws.write(r, 1, txt, f_wrap)
    r += 1
for nome, desc in STATUS:
    bg, fg = STATUS_COR[nome]
    ws.write_rich_string(r, 1, F({"bold": True, "font_color": fg, "bg_color": bg, "font_size": 10}),
                         f" {nome} ", f_txt, f"  {desc}")
    r += 1
r += 1
ws.write(r, 1, "Regras de ouro", f_sec); r += 1
for t in ["• Uma linha por pessoa. Novos contactos: menu O Despertar → Adicionar 100 linhas, e preencher Responsável e Status \"Por contactar\".",
          "• Use sempre as listas (setas) nas colunas Responsável, Status da ligação, Canal, Sector, Cupão e Motivo.",
          "• Preços, cupões, metas, nomes da equipa e dados do evento mudam-se só na aba Config."]:
    ws.write(r, 1, t, f_wrap); r += 1

# =====================================================================
# Leads
# =====================================================================
ws = wb.add_worksheet("Leads")
COLS = [  # (cabeçalho, largura, automático?)
    ("ID", 8, False), ("Prioridade", 9, False), ("Faixa", 6, False), ("Pontos", 7, False),
    ("Nome", 26, False), ("Telefone", 17, False), ("WhatsApp", 15, True), ("Email", 28, False),
    ("Responsável", 13, False), ("Status da ligação", 18, False), ("Canal", 11, False),
    ("Tentativas", 10, True), ("Último contacto", 12, True), ("Próximo follow-up", 12, False),
    ("Sector", 10, False), ("Qtd ingressos", 9, False), ("Cupão", 18, False), ("Valor", 12, True),
    ("Motivo (se não vai)", 22, False), ("Data da compra", 12, True), ("Observação", 34, False),
    ("Porquê esta prioridade", 40, False),
]
C = {nome: i for i, (nome, _, _) in enumerate(COLS)}
L = {nome: xl_col_to_name(i) for nome, i in C.items()}
for i, (nome, larg, auto) in enumerate(COLS):
    ws.write(0, i, nome, f_head_auto if auto else f_head)
    ws.set_column(i, i, larg)
ws.set_row(0, 30)
ws.freeze_panes(1, 5)

hist = []
for n, rr in enumerate(leads_orig, start=1):
    prio, faixa, pts, nome, tel, wa, email, porque, lig, status_orig, obs = rr
    row = n
    status = MAPA_STATUS.get(status_orig, status_orig)
    if status_orig is None and obs:
        status = "Sem resposta"
    info = interpretar_obs(obs, status)
    trabalhado = status != "Por contactar"
    lid = f"L{n:05d}"
    resp = MAPA_RESP.get(lig, lig)
    ws.write_string(row, C["ID"], lid, f_txt)
    ws.write_number(row, C["Prioridade"], int(prio), f_num)
    ws.write_string(row, C["Faixa"], faixa, f_txt)
    ws.write_number(row, C["Pontos"], int(pts), f_num)
    ws.write_string(row, C["Nome"], (nome or "").strip(), f_txt)
    ws.write_string(row, C["Telefone"], tel, f_txt)
    tf = L["Telefone"] + str(row + 1)
    ws.write_formula(row, C["WhatsApp"],
                     f'=IF({tf}="","",HYPERLINK("https://wa.me/"&SUBSTITUTE(SUBSTITUTE(SUBSTITUTE({tf},"+","")," ",""),"-",""),"Abrir WhatsApp"))',
                     f_link, "Abrir WhatsApp")
    ws.write_string(row, C["Email"], email or "", f_txt)
    ws.write_string(row, C["Responsável"], resp, f_txt)
    ws.write_string(row, C["Status da ligação"], status, f_txt)
    qtd = info.get("qtd")
    if status == "Comprou" and not qtd:
        qtd = 1
    if trabalhado:
        ws.write_string(row, C["Canal"], info.get("canal", "Chamada"), f_txt)
        ws.write_number(row, C["Tentativas"], 1, f_num)
        ws.write_datetime(row, C["Último contacto"], dt.datetime.combine(DATA_MIGRACAO, dt.time()), f_date)
    if info.get("follow") and status in ABERTOS:
        ws.write_datetime(row, C["Próximo follow-up"], dt.datetime.combine(info["follow"], dt.time()), f_date)
    if info.get("sector"):
        ws.write_string(row, C["Sector"], info["sector"], f_txt)
    if qtd:
        ws.write_number(row, C["Qtd ingressos"], qtd, f_num)
    cupao = info.get("cupao", "Sem cupão" if qtd else "")
    if cupao:
        ws.write_string(row, C["Cupão"], cupao, f_txt)
    p, s, q = (L[k] + str(row + 1) for k in ("Qtd ingressos", "Sector", "Cupão"))
    ws.write_formula(row, C["Valor"],
                     f'=IF(OR({p}="",{s}=""),"",ROUND({p}*IFERROR(VLOOKUP({s},Config!$F$3:$G$8,2,FALSE),0)'
                     f'*IFERROR(VLOOKUP({q},Config!$J$3:$K$8,2,FALSE),1),0))', f_mt, "")
    if info.get("motivo"):
        ws.write_string(row, C["Motivo (se não vai)"], info["motivo"], f_txt)
    if status == "Comprou":
        ws.write_datetime(row, C["Data da compra"], dt.datetime.combine(DATA_MIGRACAO, dt.time()), f_date)
    if obs is not None:
        ws.write_string(row, C["Observação"], "50%" if obs == 0.5 else str(obs).strip(), f_txt)
    ws.write_string(row, C["Porquê esta prioridade"], porque or "", f_muted)
    if trabalhado:
        hist.append([DATA_MIGRACAO, lid, resp, "Por contactar", status, info.get("canal", "Chamada"), faixa,
                     info.get("sector", ""), qtd or "", cupao, "Migração (data aproximada)"])

NL = len(leads_orig)
ws.autofilter(0, 0, NL, len(COLS) - 1)
rng = lambda col: f"{L[col]}2:{L[col]}{MAX}"


def dv(col, src):
    ws.data_validation(rng(col), {"validate": "list", "source": src, "error_title": "Valor fora da lista",
                                  "error_message": "Escolha um valor da lista. Para mudar as opções, edite a aba Config."})


dv("Responsável", "=Config!$A$3:$A$20")
dv("Status da ligação", "=Config!$C$3:$C$9")
dv("Sector", "=Config!$F$3:$F$8")
dv("Cupão", "=Config!$J$3:$J$8")
dv("Canal", "=Config!$N$3:$N$10")
dv("Motivo (se não vai)", "=Config!$P$3:$P$12")
ws.data_validation(rng("Qtd ingressos"), {"validate": "integer", "criteria": "between", "minimum": 1, "maximum": 50,
                                          "error_message": "Escreva um número inteiro de ingressos (1 a 50)."})
ws.data_validation(rng("Próximo follow-up"), {"validate": "date", "criteria": ">", "value": dt.date(2026, 1, 1),
                                              "error_message": "Escreva uma data, por exemplo 30/11/2026."})
for nome, (bg, fg) in STATUS_COR.items():
    ws.conditional_format(rng("Status da ligação"), {"type": "cell", "criteria": "==", "value": f'"{nome}"',
                                                     "format": F({"bg_color": bg, "font_color": fg, "bold": True})})
fu, et = L["Próximo follow-up"], L["Status da ligação"]
ws.conditional_format(rng("Próximo follow-up"), {
    "type": "formula",
    "criteria": f'=AND({fu}2<>"",{fu}2<TODAY(),OR({et}2="Sem resposta",{et}2="Em conversa",{et}2="Vai comprar"))',
    "format": F({"bg_color": "#FEE2E2", "font_color": "#991B1B", "bold": True})})
ws.conditional_format(rng("Próximo follow-up"), {
    "type": "formula", "criteria": f'=AND({fu}2<>"",{fu}2=TODAY())',
    "format": F({"bg_color": "#FEF3C7", "font_color": "#92400E", "bold": True})})

# =====================================================================
# Relatório diário
# =====================================================================
ws = wb.add_worksheet("Relatório diário")
for i, (h, w) in enumerate([("Data", 16), ("Autor da análise", 18), ("Análise do dia", 70), ("Próximos passos", 50)]):
    ws.write(0, i, h, f_head); ws.set_column(i, i, w)
ws.set_row(0, 30); ws.freeze_panes(1, 1)
d = INICIO
row = 1
while d <= EVENTO:
    ws.write_datetime(row, 0, dt.datetime.combine(d, dt.time()), f_rel_date)
    for c in (1, 2, 3):
        ws.write_blank(row, c, None, f_rel)
    ws.set_row(row, 60)
    row += 1
    d += dt.timedelta(days=1)
ws.data_validation(f"B2:B200", {"validate": "list", "source": "=Config!$A$3:$A$20", "ignore_blank": True,
                                "error_type": "information"})
ws.write_comment("C1", "Visível para os clientes no calendário do dashboard. Escreva frases curtas: "
                       "o que correu bem, o que travou as vendas, que objeções apareceram.")

# =====================================================================
# Histórico
# =====================================================================
ws = wb.add_worksheet("Histórico")
HC = [("Data e hora", 16), ("Data", 11), ("ID", 9), ("Responsável", 12), ("Status anterior", 16),
      ("Novo status", 16), ("Canal", 11), ("Faixa", 6), ("Sector", 10), ("Qtd ingressos", 9),
      ("Cupão", 18), ("Origem do registo", 26)]
for i, (h, w) in enumerate(HC):
    ws.write(0, i, h, f_head_auto); ws.set_column(i, i, w)
ws.set_row(0, 30); ws.freeze_panes(1, 0)
for n, h in enumerate(hist, start=1):
    dd = dt.datetime.combine(h[0], dt.time())
    ws.write_datetime(n, 0, dd, f_dt); ws.write_datetime(n, 1, dd, f_date)
    for j, v in enumerate(h[1:], start=2):
        if isinstance(v, int):
            ws.write_number(n, j, v, f_num)
        else:
            ws.write_string(n, j, v, f_txt)
ws.write_comment("A1", "Preenchido automaticamente pelo script sempre que alguém muda o Status da ligação. Não editar.")

# =====================================================================
# Painel
# =====================================================================
ws = wb.add_worksheet("Painel")
ws.hide_gridlines(2)
ws.set_column("A:A", 2); ws.set_column("B:B", 34); ws.set_column("C:D", 13); ws.set_column("E:E", 22)
ws.set_column("F:J", 13)
ws.write("B2", "O Despertar · Painel de vendas", f_title)
ws.write_formula("B3", '="Atualizado ao abrir · hoje "&TEXT(TODAY(),"dd/mm/yyyy")', f_sub)

E = lambda col: f"Leads!${L[col]}$2:${L[col]}${MAX}"
STS, RESP, FX, CAN = E("Status da ligação"), E("Responsável"), E("Faixa"), E("Canal")
QTD, VAL, FUP, MOT = E("Qtd ingressos"), E("Valor"), E("Próximo follow-up"), E("Motivo (se não vai)")
SEC, CUP, ID = E("Sector"), E("Cupão"), E("ID")


def atenderam(extra=""):
    return "+".join(f'COUNTIFS({STS},"{e}"{extra})' for e in ATENDERAM)


def contactados(extra=""):
    return f'COUNTIFS({ID},"<>"{extra})-COUNTIFS({STS},"Por contactar"{extra})'


kpis = [
    ("Leads na base", f'=COUNTIFS({ID},"<>")', f_val),                                  # C6
    ("Contactados (pelo menos uma tentativa)", "=" + contactados(), f_val),              # C7
    ("Taxa de contacto", "=IFERROR(C7/C6,0)", f_valpct),                                 # C8
    ("Atenderam", "=" + atenderam(), f_val),                                             # C9
    ("Vão comprar (compromisso)", f'=COUNTIFS({STS},"Vai comprar")', f_val),             # C10
    ("Compraram (pessoas)", f'=COUNTIFS({STS},"Comprou")', f_val),                       # C11
    ("Ingressos vendidos", f'=SUMIFS({QTD},{STS},"Comprou")', f_val),                    # C12
    ("Receita", f'=SUMIFS({VAL},{STS},"Comprou")', f_valmt),                             # C13
    ("Ticket médio por ingresso", "=IFERROR(C13/C12,0)", f_valmt),                       # C14
    ("Conversão (compraram ÷ atenderam)", "=IFERROR(C11/C9,0)", f_valpct),               # C15
    ("Meta de ingressos", "=meta_ingressos", f_val),                                     # C16
    ("Progresso da meta", '=IFERROR(C12/C16,0)', f_valpct),                              # C17
    ("Follow-ups marcados para hoje",
     "=" + "+".join(f'COUNTIFS({FUP},TODAY(),{STS},"{e}")' for e in ABERTOS), f_val),
    ("Follow-ups em atraso",
     "=" + "+".join(f'COUNTIFS({FUP},"<"&TODAY(),{STS},"{e}")' for e in ABERTOS), f_val),
]
ws.write("B5", "Números principais", f_sec)
for i, (lbl, fml, fmt) in enumerate(kpis):
    ws.write(5 + i, 1, lbl, f_lbl)
    ws.write_formula(5 + i, 2, fml, fmt)

# Funil por status
ws.write(4, 4, "Status da ligação", f_sec)
ws.write(5, 4, "Status", f_head); ws.write(5, 5, "Leads", f_head); ws.write(5, 6, "% da base", f_head)
for i, (nome, _) in enumerate(STATUS):
    rr = 6 + i
    ws.write(rr, 4, nome, f_lbl)
    ws.write_formula(rr, 5, f'=COUNTIFS({STS},"{nome}")', f_cell)
    ws.write_formula(rr, 6, f"=IFERROR(F{rr+1}/$C$6,0)", f_cellpct)

# Vendas por sector e por cupão
ws.write(14, 4, "Vendas por sector", f_sec)
for j, h in enumerate(["Sector", "Ingressos", "Receita"]):
    ws.write(15, 4 + j, h, f_head)
for i in range(len(SECTORES)):
    rr = 16 + i
    ws.write_formula(rr, 4, f"=Config!$F${3+i}", f_lbl)
    ws.write_formula(rr, 5, f'=SUMIFS({QTD},{STS},"Comprou",{SEC},E{rr+1})', f_cell)
    ws.write_formula(rr, 6, f'=SUMIFS({VAL},{STS},"Comprou",{SEC},E{rr+1})', f_cellmt)
ws.write(19, 4, "Vendas por cupão", f_sec)
for j, h in enumerate(["Cupão", "Ingressos", "Receita"]):
    ws.write(20, 4 + j, h, f_head)
for i in range(len(CUPOES)):
    rr = 21 + i
    ws.write_formula(rr, 4, f"=Config!$J${3+i}", f_lbl)
    ws.write_formula(rr, 5, f'=SUMIFS({QTD},{STS},"Comprou",{CUP},E{rr+1})', f_cell)
    ws.write_formula(rr, 6, f'=SUMIFS({VAL},{STS},"Comprou",{CUP},E{rr+1})', f_cellmt)

# Por responsável
r1 = 26
ws.write(r1, 1, "Desempenho por responsável", f_sec)
cab = ["Responsável", "Leads", "Contactados", "Atenderam", "Vão comprar", "Compraram", "Ingressos",
       "Receita", "Follow-ups atrasados"]
for j, h in enumerate(cab):
    ws.write(r1 + 1, 1 + j, h, f_head)
for i in range(10):
    rr = r1 + 2 + i
    a = f"$B{rr+1}"
    ws.write_formula(rr, 1, f'=IF(Config!$A${3+i}="","",Config!$A${3+i})', f_lbl)
    x = f",{RESP},{a}"
    fm = [f'COUNTIFS({RESP},{a})', contactados(x), atenderam(x), f'COUNTIFS({STS},"Vai comprar"{x})',
          f'COUNTIFS({STS},"Comprou"{x})', f'SUMIFS({QTD},{STS},"Comprou"{x})', f'SUMIFS({VAL},{STS},"Comprou"{x})',
          "+".join(f'COUNTIFS({FUP},"<"&TODAY(),{STS},"{e}"{x})' for e in ABERTOS)]
    for j, f in enumerate(fm):
        ws.write_formula(rr, 2 + j, f'=IF({a}="","",{f})', f_cellmt if j == 6 else f_cell)

# Por faixa
r2 = r1 + 14
ws.write(r2, 1, "Qualidade da base por faixa", f_sec)
for j, h in enumerate(["Faixa", "Leads", "Contactados", "Atenderam", "Compraram", "Conversão"]):
    ws.write(r2 + 1, 1 + j, h, f_head)
for i, fx in enumerate("ABCD"):
    rr = r2 + 2 + i
    x = f',{FX},"{fx}"'
    ws.write(rr, 1, f"Faixa {fx}", f_lbl)
    ws.write_formula(rr, 2, f'=COUNTIFS({FX},"{fx}")', f_cell)
    ws.write_formula(rr, 3, "=" + contactados(x), f_cell)
    ws.write_formula(rr, 4, "=" + atenderam(x), f_cell)
    ws.write_formula(rr, 5, f'=COUNTIFS({STS},"Comprou"{x})', f_cell)
    ws.write_formula(rr, 6, f"=IFERROR(F{rr+1}/E{rr+1},0)", f_cellpct)

# Canais e motivos
r3 = r2 + 8
ws.write(r3, 1, "Canal do último contacto", f_sec)
ws.write(r3, 4, "Motivos de recusa", f_sec)
for j, h in enumerate(["Canal", "Leads"]):
    ws.write(r3 + 1, 1 + j, h, f_head)
for j, h in enumerate(["Motivo", "Leads"]):
    ws.write(r3 + 1, 4 + j, h, f_head)
for i in range(8):
    rr = r3 + 2 + i
    ws.write_formula(rr, 1, f'=IF(Config!$N${3+i}="","",Config!$N${3+i})', f_lbl)
    ws.write_formula(rr, 2, f'=IF(B{rr+1}="","",COUNTIFS({CAN},B{rr+1},{STS},"<>Por contactar"))', f_cell)
    ws.write_formula(rr, 4, f'=IF(Config!$P${3+i}="","",Config!$P${3+i})', f_lbl)
    ws.write_formula(rr, 5, f'=IF(E{rr+1}="","",COUNTIFS({MOT},E{rr+1},{STS},"Não vai participar"))', f_cell)

# Atividade diária
r4 = r3 + 12
ws.write(r4, 1, "Atividade por dia", f_sec)
for j, h in enumerate(["Dia", "Tentativas", "Atenderam", "Vendas (pessoas)", "Ingressos", "Receita"]):
    ws.write(r4 + 1, 1 + j, h, f_head)
HD, HN = "'Histórico'!$B$2:$B$100000", "'Histórico'!$F$2:$F$100000"
DC = E("Data da compra")
for i in range((EVENTO - INICIO).days + 1):
    rr = r4 + 2 + i
    d = f"$B{rr+1}"
    ws.write_formula(rr, 1, f"=campanha_inicio+{i}", f_celldate)
    ws.write_formula(rr, 2, f'=COUNTIFS({HD},{d})-COUNTIFS({HD},{d},{HN},"Por contactar")', f_cell)
    ws.write_formula(rr, 3, "=" + "+".join(f'COUNTIFS({HD},{d},{HN},"{e}")' for e in ATENDERAM), f_cell)
    ws.write_formula(rr, 4, f'=COUNTIFS({DC},{d},{STS},"Comprou")', f_cell)
    ws.write_formula(rr, 5, f'=SUMIFS({QTD},{DC},{d},{STS},"Comprou")', f_cell)
    ws.write_formula(rr, 6, f'=SUMIFS({VAL},{DC},{d},{STS},"Comprou")', f_cellmt)

# =====================================================================
# Config
# =====================================================================
ws = wb.add_worksheet("Config")
for col, w in {"A": 16, "B": 2, "C": 20, "D": 46, "E": 2, "F": 12, "G": 13, "H": 24, "I": 2, "J": 20, "K": 8,
               "L": 26, "M": 2, "N": 13, "O": 2, "P": 26, "Q": 2, "R": 20, "S": 48}.items():
    ws.set_column(f"{col}:{col}", w)
ws.write("A1", "Listas e parâmetros. As células amarelas podem ser editadas.", f_sub)
for col, h in [("A", "Responsáveis"), ("C", "Status da ligação"), ("D", "Quando usar"), ("F", "Sectores"),
               ("G", "Preço"), ("H", "Descrição"), ("J", "Cupões"), ("K", "Fator"), ("L", "Validade"),
               ("N", "Canais"), ("P", "Motivos de recusa"), ("R", "Parâmetro"), ("S", "Valor")]:
    ws.write(f"{col}2", h, f_head)
for i in range(18):
    ws.write(2 + i, 0, RESPONSAVEIS[i] if i < len(RESPONSAVEIS) else None, f_cfg)
for i, (n, dsc) in enumerate(STATUS):
    ws.write(2 + i, 2, n, f_lbl); ws.write(2 + i, 3, dsc, f_txt)
for i in range(6):
    s = SECTORES[i] if i < len(SECTORES) else (None, None, None)
    ws.write(2 + i, 5, s[0], f_cfg); ws.write(2 + i, 6, s[1], f_cfgmt); ws.write(2 + i, 7, s[2], f_cfg)
for i in range(6):
    c = CUPOES[i] if i < len(CUPOES) else (None, None, None)
    ws.write(2 + i, 9, c[0], f_cfg); ws.write(2 + i, 10, c[1], f_cfgpct); ws.write(2 + i, 11, c[2], f_cfg)
for i in range(8):
    ws.write(2 + i, 13, CANAIS[i] if i < len(CANAIS) else None, f_cfg)
for i in range(10):
    ws.write(2 + i, 15, MOTIVOS[i] if i < len(MOTIVOS) else None, f_cfg)
for i, (nome, lbl, v) in enumerate(PARAMS):
    ws.write(2 + i, 17, lbl, f_lbl)
    if isinstance(v, dt.datetime):
        ws.write_datetime(2 + i, 18, v, f_cfgdate)
    elif v is None:
        ws.write_blank(2 + i, 18, None, f_cfg)
    else:
        ws.write(2 + i, 18, v, f_cfg)
    wb.define_name(nome, f"=Config!$S${3 + i}")
ws.write("J10", "Fator = parte do preço que o cliente paga (0,85 = 15% de desconto).", f_muted)
ws.write("R17", "A Meta aparece no dashboard quando preenchida.", f_muted)
for nome, ref in [("lista_responsaveis", "$A$3:$A$20"), ("lista_status", "$C$3:$C$9"),
                  ("tabela_sectores", "$F$3:$H$8"), ("tabela_cupoes", "$J$3:$L$8"),
                  ("lista_canais", "$N$3:$N$10"), ("lista_motivos", "$P$3:$P$12")]:
    wb.define_name(nome, f"=Config!{ref}")

wb.worksheets()[1].activate()
wb.close()
print("leads", NL, "historico", len(hist))
