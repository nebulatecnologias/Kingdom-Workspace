"""Constrói a planilha reorganizada de O Despertar a partir do ficheiro original.

Uso: python3 construir_planilha.py <original.xlsx> <saida.xlsx>
"""
import datetime as dt
import re
import sys

import openpyxl
import xlsxwriter

ORIG, SAIDA = sys.argv[1], sys.argv[2]
DATA_MIGRACAO = dt.date(2026, 11, 27)   # dia em que a lista original foi trabalhada
MAX = 50000                              # linhas cobertas por fórmulas e listas

RESPONSAVEIS = ["Mayra", "Maria", "Pessoa 1", "Pessoa 2", "Pessoa 3"]
ETAPAS = [
    ("Por contactar", "Ainda ninguém falou com esta pessoa."),
    ("Sem resposta", "Ligámos ou escrevemos e não respondeu."),
    ("Em conversa", "Atendeu e está a pensar. Marcar follow-up."),
    ("Vai comprar", "Disse que vai comprar. Marcar follow-up até pagar."),
    ("Comprou", "Pagou o ingresso. Preencher sector e quantidade."),
    ("Não vai participar", "Recusou. Escolher o motivo."),
    ("Contacto inválido", "Número errado, desligado ou sem WhatsApp."),
]
ABERTAS = ["Sem resposta", "Em conversa", "Vai comprar"]       # pedem follow-up
ATENDERAM = ["Em conversa", "Vai comprar", "Comprou", "Não vai participar"]
SECTORES = [("Sector A", None), ("Sector B", None)]
CONDICOES = [("Preço normal", 1), ("Promoção 50%", 0.5)]
CANAIS = ["Chamada", "WhatsApp", "SMS", "Email", "Presencial"]
MOTIVOS = ["Falta de tempo / agenda", "Financeiro", "Viagem / trabalho",
           "Sem interesse", "Já tem outro compromisso", "Outro"]

MAPA_ETAPA = {None: "Por contactar", "Sem Resposta": "Sem resposta",
              "Vai se Inscrever": "Vai comprar", "Nao vai Participar": "Não vai participar",
              "Ja se Inscreveu": "Comprou"}
MAPA_RESP = {"Mayra..KD": "Mayra", "Maria. KD": "Maria"}


def interpretar_obs(obs, etapa):
    """Tira sector, quantidade, condição, motivo e follow-up do texto livre."""
    out = {}
    if obs is None:
        return out
    if isinstance(obs, (int, float)):        # "50%" foi convertido em 0.5 pelo Excel
        if obs == 0.5:
            out["cond"] = "Promoção 50%"
        return out
    t = obs.lower()
    m = re.search(r"\b(sector|sec[cç][aã]o|sess[aã]o)\s*([ab])\b", t)
    if m:
        out["sector"] = "Sector " + m.group(2).upper()
    m = re.search(r"(\d+)\s*(bilhetes?|tickets?|pessoas?)", t)
    if m:
        out["qtd"] = int(m.group(1))
    if "50%" in t:
        out["cond"] = "Promoção 50%"
    if etapa == "Não vai participar":
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
leads_orig = [r for r in src["Leads para Abordar"].iter_rows(min_row=2, values_only=True)
              if any(v is not None for v in r)]
compr_orig = [r for r in src["Já compraram"].iter_rows(min_row=2, values_only=True)
              if any(v is not None for v in r)]

wb = xlsxwriter.Workbook(SAIDA)
wb.set_properties({"title": "O Despertar · Pipeline de vendas", "company": "Kingdom Company"})

# ---------- formatos ----------
AZUL, CINZA, LINHA = "#1F2A44", "#F3F4F7", "#D9DCE3"
f_head = wb.add_format({"bold": True, "font_color": "#FFFFFF", "bg_color": AZUL, "valign": "vcenter",
                        "text_wrap": True, "border": 1, "border_color": AZUL, "font_size": 10})
f_head_auto = wb.add_format({"bold": True, "font_color": "#FFFFFF", "bg_color": "#5B6478", "valign": "vcenter",
                             "text_wrap": True, "border": 1, "border_color": "#5B6478", "font_size": 10})
f_txt = wb.add_format({"font_size": 10})
f_num = wb.add_format({"font_size": 10, "num_format": "0"})
f_date = wb.add_format({"font_size": 10, "num_format": "dd/mm/yyyy"})
f_dt = wb.add_format({"font_size": 10, "num_format": "dd/mm/yyyy hh:mm"})
f_mt = wb.add_format({"font_size": 10, "num_format": '#,##0 "MT"'})
f_link = wb.add_format({"font_size": 10, "font_color": "#1A7F37", "underline": 1})
f_muted = wb.add_format({"font_size": 9, "font_color": "#6B7280"})
f_title = wb.add_format({"bold": True, "font_size": 16, "font_color": AZUL})
f_sub = wb.add_format({"font_size": 10, "font_color": "#6B7280", "italic": True})
f_sec = wb.add_format({"bold": True, "font_size": 11, "font_color": AZUL, "bottom": 2, "bottom_color": AZUL})
f_lbl = wb.add_format({"font_size": 10, "bg_color": CINZA, "border": 1, "border_color": LINHA})
f_val = wb.add_format({"font_size": 11, "bold": True, "border": 1, "border_color": LINHA, "num_format": "#,##0"})
f_valmt = wb.add_format({"font_size": 11, "bold": True, "border": 1, "border_color": LINHA, "num_format": '#,##0 "MT"'})
f_valpct = wb.add_format({"font_size": 11, "bold": True, "border": 1, "border_color": LINHA, "num_format": "0.0%"})
f_cell = wb.add_format({"font_size": 10, "border": 1, "border_color": LINHA, "num_format": "#,##0"})
f_cellpct = wb.add_format({"font_size": 10, "border": 1, "border_color": LINHA, "num_format": "0.0%"})
f_celldate = wb.add_format({"font_size": 10, "border": 1, "border_color": LINHA, "num_format": "ddd dd/mm"})
f_cellmt = wb.add_format({"font_size": 10, "border": 1, "border_color": LINHA, "num_format": '#,##0 "MT"'})
f_cfg = wb.add_format({"font_size": 10, "bg_color": "#FFF8E6", "border": 1, "border_color": "#E8D9A8"})
f_cfgdate = wb.add_format({"font_size": 10, "bg_color": "#FFF8E6", "border": 1, "border_color": "#E8D9A8",
                           "num_format": "dd/mm/yyyy"})
f_cfgmt = wb.add_format({"font_size": 10, "bg_color": "#FFF8E6", "border": 1, "border_color": "#E8D9A8",
                         "num_format": '#,##0 "MT"'})
f_cfgpct = wb.add_format({"font_size": 10, "bg_color": "#FFF8E6", "border": 1, "border_color": "#E8D9A8",
                          "num_format": "0%"})
f_wrap = wb.add_format({"font_size": 10, "text_wrap": True, "valign": "top"})

ETAPA_COR = {"Por contactar": ("#F3F4F6", "#374151"), "Sem resposta": ("#FEF3C7", "#92400E"),
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
ws.write("B3", "Laços Eternos & Deive Leonardo · Vendas: Kingdom Company", f_sub)
linhas = [
    ("sec", "Como trabalhar cada contacto"),
    ("txt", "1. Abra a aba Leads e filtre a coluna Responsável pelo seu nome e a coluna Etapa por \"Por contactar\"."),
    ("txt", "2. Ligue ou escreva no WhatsApp (o link abre a conversa). Depois de cada tentativa, escolha a Etapa e o Canal."),
    ("txt", "3. Se a pessoa pediu para voltar a falar mais tarde, preencha Próximo follow-up com a data combinada."),
    ("txt", "4. Quando a pessoa pagar: Etapa = Comprou, e preencha Sector, Qtd ingressos e Condição. O Valor calcula-se sozinho."),
    ("txt", "5. Se recusar: Etapa = Não vai participar, e escolha o Motivo. Use Observação só para detalhes que não cabem nas colunas."),
    ("sec", "O que é automático (depois de instalar o script)"),
    ("txt", "• Último contacto, Tentativas e Data da compra preenchem-se sozinhos quando muda a Etapa."),
    ("txt", "• Cada mudança de Etapa fica registada na aba Histórico. É daí que sai a atividade por dia do dashboard. Não edite o Histórico."),
    ("txt", "• O dashboard dos clientes lê a planilha a cada minuto e mostra só números agregados: nunca nomes, telefones ou emails."),
    ("sec", "Etapas"),
]
r = 5
for tipo, txt in linhas:
    if tipo == "sec":
        r += 1
        ws.write(r, 1, txt, f_sec)
    else:
        ws.write(r, 1, txt, f_wrap)
    r += 1
for nome, desc in ETAPAS:
    bg, fg = ETAPA_COR[nome]
    ws.write_rich_string(r, 1, wb.add_format({"bold": True, "font_color": fg, "bg_color": bg, "font_size": 10}),
                         f" {nome} ", f_txt, f"  {desc}")
    r += 1
r += 1
ws.write(r, 1, "Regras de ouro", f_sec); r += 1
for t in ["• Uma linha por pessoa. Novos contactos entram no fim da aba Leads, com Responsável e Etapa \"Por contactar\".",
          "• Use sempre as listas (setas) e não escreva à mão nas colunas Responsável, Etapa, Canal, Sector, Condição e Motivo.",
          "• Preços, metas, nomes da equipa e data do evento mudam-se só na aba Config."]:
    ws.write(r, 1, t, f_wrap); r += 1

# =====================================================================
# Leads
# =====================================================================
ws = wb.add_worksheet("Leads")
COLS = [  # (cabeçalho, largura, automático?)
    ("ID", 8, False), ("Prioridade", 9, False), ("Faixa", 6, False), ("Pontos", 7, False),
    ("Nome", 26, False), ("Telefone", 17, False), ("WhatsApp", 15, True), ("Email", 28, False),
    ("Responsável", 13, False), ("Etapa", 18, False), ("Canal", 11, False),
    ("Tentativas", 10, True), ("Último contacto", 12, True), ("Próximo follow-up", 12, False),
    ("Sector", 10, False), ("Qtd ingressos", 9, False), ("Condição", 14, False), ("Valor", 12, True),
    ("Motivo (se não vai)", 22, False), ("Data da compra", 12, True), ("Observação", 34, False),
    ("Porquê esta prioridade", 40, False),
]
C = {nome: i for i, (nome, _, _) in enumerate(COLS)}
L = {nome: xlsxwriter.utility.xl_col_to_name(i) for nome, i in C.items()}
for i, (nome, larg, auto) in enumerate(COLS):
    ws.write(0, i, nome, f_head_auto if auto else f_head)
    ws.set_column(i, i, larg)
ws.set_row(0, 30)
ws.freeze_panes(1, 5)

hist = []  # linhas do histórico a semear
for n, r in enumerate(leads_orig, start=1):
    prio, faixa, pts, nome, tel, wa, email, porque, lig, status, obs = (tuple(r) + (None,) * 11)[:11]
    row = n
    etapa = MAPA_ETAPA.get(status, status)
    if status is None and obs:            # há nota mas não escolheram etapa
        etapa = "Sem resposta"
    info = interpretar_obs(obs, etapa)
    trabalhado = etapa != "Por contactar"
    lid = f"L{n:05d}"
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
    ws.write_string(row, C["Responsável"], MAPA_RESP.get(lig, lig), f_txt)
    ws.write_string(row, C["Etapa"], etapa, f_txt)
    qtd = info.get("qtd")
    if etapa == "Comprou" and not qtd:
        qtd = 1
    if trabalhado:
        ws.write_string(row, C["Canal"], info.get("canal", "Chamada"), f_txt)
        ws.write_number(row, C["Tentativas"], 1, f_num)
        ws.write_datetime(row, C["Último contacto"], dt.datetime.combine(DATA_MIGRACAO, dt.time()), f_date)
    if info.get("follow") and etapa in ABERTAS:
        ws.write_datetime(row, C["Próximo follow-up"], dt.datetime.combine(info["follow"], dt.time()), f_date)
    if info.get("sector"):
        ws.write_string(row, C["Sector"], info["sector"], f_txt)
    if qtd:
        ws.write_number(row, C["Qtd ingressos"], qtd, f_num)
    if info.get("cond") or qtd:
        ws.write_string(row, C["Condição"], info.get("cond", "Preço normal"), f_txt)
    p, s, q = (L[k] + str(row + 1) for k in ("Qtd ingressos", "Sector", "Condição"))
    ws.write_formula(row, C["Valor"],
                     f'=IF(OR({p}="",{s}=""),"",{p}*IFERROR(VLOOKUP({s},Config!$E$3:$F$12,2,FALSE),0)'
                     f'*IFERROR(VLOOKUP({q},Config!$H$3:$I$8,2,FALSE),1))', f_mt, "")
    if info.get("motivo"):
        ws.write_string(row, C["Motivo (se não vai)"], info["motivo"], f_txt)
    if etapa == "Comprou":
        ws.write_datetime(row, C["Data da compra"], dt.datetime.combine(DATA_MIGRACAO, dt.time()), f_date)
    if obs is not None:
        ws.write_string(row, C["Observação"], "50%" if obs == 0.5 else str(obs).strip(), f_txt)
    ws.write_string(row, C["Porquê esta prioridade"], porque or "", f_muted)
    if trabalhado:
        hist.append([DATA_MIGRACAO, lid, MAPA_RESP.get(lig, lig), "Por contactar", etapa,
                     info.get("canal", "Chamada"), faixa, info.get("sector", ""), qtd or "",
                     info.get("cond", "Preço normal" if qtd else ""), "Migração (data aproximada)"])

NL = len(leads_orig)
ws.autofilter(0, 0, NL, len(COLS) - 1)
rng = lambda col: f"{L[col]}2:{L[col]}{MAX}"
dv = lambda col, src: ws.data_validation(rng(col), {"validate": "list", "source": src,
                                                    "error_title": "Valor fora da lista",
                                                    "error_message": "Escolha um valor da lista. Para mudar as opções, edite a aba Config."})
dv("Responsável", "=Config!$A$3:$A$20")
dv("Etapa", "=Config!$C$3:$C$9")
dv("Canal", "=Config!$K$3:$K$10")
dv("Sector", "=Config!$E$3:$E$12")
dv("Condição", "=Config!$H$3:$H$8")
dv("Motivo (se não vai)", "=Config!$M$3:$M$12")
ws.data_validation(rng("Qtd ingressos"), {"validate": "integer", "criteria": "between", "minimum": 1, "maximum": 50,
                                          "error_message": "Escreva um número inteiro de ingressos (1 a 50)."})
for col in ("Próximo follow-up",):
    ws.data_validation(rng(col), {"validate": "date", "criteria": ">", "value": dt.date(2026, 1, 1),
                                  "error_message": "Escreva uma data, por exemplo 30/11/2026."})
for nome, (bg, fg) in ETAPA_COR.items():
    ws.conditional_format(rng("Etapa"), {"type": "cell", "criteria": "==", "value": f'"{nome}"',
                                         "format": wb.add_format({"bg_color": bg, "font_color": fg, "bold": True})})
fu, et = L["Próximo follow-up"], L["Etapa"]
ws.conditional_format(rng("Próximo follow-up"), {
    "type": "formula",
    "criteria": f'=AND({fu}2<>"",{fu}2<TODAY(),OR({et}2="Sem resposta",{et}2="Em conversa",{et}2="Vai comprar"))',
    "format": wb.add_format({"bg_color": "#FEE2E2", "font_color": "#991B1B", "bold": True})})
ws.conditional_format(rng("Próximo follow-up"), {
    "type": "formula", "criteria": f'=AND({fu}2<>"",{fu}2=TODAY())',
    "format": wb.add_format({"bg_color": "#FEF3C7", "font_color": "#92400E", "bold": True})})

# =====================================================================
# Compradores
# =====================================================================
ws = wb.add_worksheet("Compradores")
CC = [("Nome", 28), ("Telefone", 16), ("Email", 32), ("Origem", 22), ("Qtd ingressos", 10),
      ("Sector", 10), ("Data da compra", 12), ("Observação", 30)]
for i, (h, w) in enumerate(CC):
    ws.write(0, i, h, f_head); ws.set_column(i, i, w)
ws.set_row(0, 30); ws.freeze_panes(1, 1)
for n, rc in enumerate(compr_orig, start=1):
    nome, tel, email = (tuple(rc) + (None,) * 3)[:3]
    ws.write_string(n, 0, (nome or "").strip(), f_txt)
    ws.write_string(n, 1, tel or "", f_txt)
    ws.write_string(n, 2, email or "", f_txt)
    ws.write_string(n, 3, "Lista do cliente", f_txt)
    ws.write_number(n, 4, 1, f_num)
ws.autofilter(0, 0, len(compr_orig), len(CC) - 1)
ws.data_validation(f"D2:D{MAX}", {"validate": "list", "source": ["Lista do cliente", "Plataforma de bilhetes",
                                                                 "Bilheteira física", "Outro"]})
ws.data_validation(f"F2:F{MAX}", {"validate": "list", "source": "=Config!$E$3:$E$12"})
ws.data_validation(f"E2:E{MAX}", {"validate": "integer", "criteria": "between", "minimum": 1, "maximum": 50})
ws.write_comment("A1", "Pessoas que compraram por outros canais (não pela equipa a partir da aba Leads). "
                       "Não precisam de ser contactadas. Vendas da equipa registam-se na aba Leads com Etapa = Comprou.")

# =====================================================================
# Histórico
# =====================================================================
ws = wb.add_worksheet("Histórico")
HC = [("Data e hora", 16), ("Data", 11), ("ID", 9), ("Responsável", 12), ("Etapa anterior", 16),
      ("Nova etapa", 16), ("Canal", 11), ("Faixa", 6), ("Sector", 10), ("Qtd ingressos", 9),
      ("Condição", 14), ("Origem do registo", 26)]
for i, (h, w) in enumerate(HC):
    ws.write(0, i, h, f_head_auto); ws.set_column(i, i, w)
ws.set_row(0, 30); ws.freeze_panes(1, 0)
for n, h in enumerate(hist, start=1):
    d = dt.datetime.combine(h[0], dt.time())
    ws.write_datetime(n, 0, d, f_dt); ws.write_datetime(n, 1, d, f_date)
    for j, v in enumerate(h[1:], start=2):
        if isinstance(v, int):
            ws.write_number(n, j, v, f_num)
        else:
            ws.write_string(n, j, v, f_txt)
ws.write_comment("A1", "Preenchido automaticamente pelo script sempre que alguém muda a Etapa na aba Leads. Não editar.")

# =====================================================================
# Painel (resumo para a equipa, só fórmulas)
# =====================================================================
ws = wb.add_worksheet("Painel")
ws.hide_gridlines(2)
ws.set_column("A:A", 2); ws.set_column("B:B", 30); ws.set_column("C:J", 13)
ws.write("B2", "O Despertar · Painel de vendas", f_title)
ws.write_formula("B3", '="Atualizado ao abrir · hoje "&TEXT(TODAY(),"dd/mm/yyyy")', f_sub)

E = lambda col: f"Leads!${L[col]}$2:${L[col]}${MAX}"
ETP, RESP, FX, CAN = E("Etapa"), E("Responsável"), E("Faixa"), E("Canal")
QTD, VAL, FUP, MOT = E("Qtd ingressos"), E("Valor"), E("Próximo follow-up"), E("Motivo (se não vai)")
ID = E("ID")


def soma_cont(extra=""):
    return "+".join(f'COUNTIFS({ETP},"{e}"{extra})' for e in ATENDERAM)


def contactados(extra=""):
    return f'COUNTIFS({ID},"<>"{extra})-COUNTIFS({ETP},"Por contactar"{extra})'


kpis = [
    ("Leads na base", f'=COUNTIFS({ID},"<>")', f_val),
    ("Contactados (pelo menos uma tentativa)", "=" + contactados(), f_val),
    ("Taxa de contacto", "=IFERROR(C7/C6,0)", f_valpct),
    ("Atenderam", "=" + soma_cont(), f_val),
    ("Vão comprar (compromisso)", f'=COUNTIFS({ETP},"Vai comprar")', f_val),
    ("Compraram pela equipa (pessoas)", f'=COUNTIFS({ETP},"Comprou")', f_val),
    ("Ingressos vendidos pela equipa", f'=SUMIFS({QTD},{ETP},"Comprou")', f_val),
    ("Receita da equipa", f'=SUMIFS({VAL},{ETP},"Comprou")', f_valmt),
    ("Conversão (compraram ÷ atenderam)", "=IFERROR(C11/C9,0)", f_valpct),
    ("Ingressos de outros canais", "=SUM(Compradores!$E$2:$E$50000)", f_val),
    ("Ingressos vendidos no total", "=C12+C15", f_val),
    ("Meta de ingressos", "=Config!$P$6", f_val),
    ("Progresso da meta", "=IFERROR(C16/C17,0)", f_valpct),
    ("Follow-ups marcados para hoje", f'=COUNTIFS({FUP},TODAY(),{ETP},"<>Comprou",{ETP},"<>Não vai participar")', f_val),
    ("Follow-ups em atraso",
     "=" + "+".join(f'COUNTIFS({FUP},"<"&TODAY(),{ETP},"{e}")' for e in ABERTAS), f_val),
]
ws.write("B5", "Números principais", f_sec)
for i, (lbl, fml, fmt) in enumerate(kpis):
    ws.write(5 + i, 1, lbl, f_lbl)
    ws.write_formula(5 + i, 2, fml, fmt)

# Funil
r0 = 5
ws.write(r0 - 1, 4, "Funil por etapa", f_sec)
ws.write(r0, 4, "Etapa", f_head); ws.write(r0, 5, "Leads", f_head); ws.write(r0, 6, "% da base", f_head)
ws.set_column("E:E", 20)
for i, (nome, _) in enumerate(ETAPAS):
    rr = r0 + 1 + i
    ws.write(rr, 4, nome, f_lbl)
    ws.write_formula(rr, 5, f'=COUNTIFS({ETP},"{nome}")', f_cell)
    ws.write_formula(rr, 6, f"=IFERROR(F{rr+1}/$C$6,0)", f_cellpct)

# Por responsável
r1 = 23
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
    fm = [f'COUNTIFS({RESP},{a})', contactados(x), soma_cont(x), f'COUNTIFS({ETP},"Vai comprar"{x})',
          f'COUNTIFS({ETP},"Comprou"{x})', f'SUMIFS({QTD},{ETP},"Comprou"{x})', f'SUMIFS({VAL},{ETP},"Comprou"{x})',
          "+".join(f'COUNTIFS({FUP},"<"&TODAY(),{ETP},"{e}"{x})' for e in ABERTAS)]
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
    ws.write_formula(rr, 4, "=" + soma_cont(x), f_cell)
    ws.write_formula(rr, 5, f'=COUNTIFS({ETP},"Comprou"{x})', f_cell)
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
    ws.write_formula(rr, 1, f'=IF(Config!$K${3+i}="","",Config!$K${3+i})', f_lbl)
    ws.write_formula(rr, 2, f'=IF(B{rr+1}="","",COUNTIFS({CAN},B{rr+1},{ETP},"<>Por contactar"))', f_cell)
    ws.write_formula(rr, 4, f'=IF(Config!$M${3+i}="","",Config!$M${3+i})', f_lbl)
    ws.write_formula(rr, 5, f'=IF(E{rr+1}="","",COUNTIFS({MOT},E{rr+1},{ETP},"Não vai participar"))', f_cell)

# Atividade diária (do Histórico)
r4 = r3 + 12
ws.write(r4, 1, "Atividade por dia (aba Histórico)", f_sec)
for j, h in enumerate(["Dia", "Tentativas", "Atenderam", "Vendas (pessoas)", "Ingressos"]):
    ws.write(r4 + 1, 1 + j, h, f_head)
HD, HN, HQ = "'Histórico'!$B$2:$B$100000", "'Histórico'!$F$2:$F$100000", "'Histórico'!$J$2:$J$100000"
for i in range(30):
    rr = r4 + 2 + i
    d = f"$B{rr+1}"
    ws.write_formula(rr, 1, f'=IF(Config!$P$5="","",IF(Config!$P$5+{i}>TODAY(),"",Config!$P$5+{i}))', f_celldate)
    ws.write_formula(rr, 2, f'=IF({d}="","",COUNTIFS({HD},{d})-COUNTIFS({HD},{d},{HN},"Por contactar"))', f_cell)
    ws.write_formula(rr, 3, f'=IF({d}="","",' + "+".join(f'COUNTIFS({HD},{d},{HN},"{e}")' for e in ATENDERAM) + ")", f_cell)
    ws.write_formula(rr, 4, f'=IF({d}="","",COUNTIFS({HD},{d},{HN},"Comprou"))', f_cell)
    ws.write_formula(rr, 5, f'=IF({d}="","",SUMIFS({HQ},{HD},{d},{HN},"Comprou"))', f_cell)

# =====================================================================
# Config
# =====================================================================
ws = wb.add_worksheet("Config")
ws.set_column("A:A", 16); ws.set_column("B:B", 2); ws.set_column("C:C", 20); ws.set_column("D:D", 48)
ws.set_column("E:E", 14); ws.set_column("F:F", 14); ws.set_column("G:G", 2); ws.set_column("H:H", 16)
ws.set_column("I:I", 9); ws.set_column("J:J", 2); ws.set_column("K:K", 13); ws.set_column("L:L", 2)
ws.set_column("M:M", 26); ws.set_column("N:N", 2); ws.set_column("O:O", 22); ws.set_column("P:P", 26)
ws.write("A1", "Listas e parâmetros. As células amarelas podem ser editadas.", f_sub)
for col, h in [("A", "Responsáveis"), ("C", "Etapas"), ("D", "Quando usar"), ("E", "Sectores"),
               ("F", "Preço por ingresso"), ("H", "Condições"), ("I", "Fator"), ("K", "Canais"),
               ("M", "Motivos de recusa"), ("O", "Parâmetro"), ("P", "Valor")]:
    ws.write(f"{col}2", h, f_head)
for i, v in enumerate(RESPONSAVEIS):
    ws.write(2 + i, 0, v, f_cfg)
for i in range(len(RESPONSAVEIS), 18):
    ws.write_blank(2 + i, 0, None, f_cfg)
for i, (n, d) in enumerate(ETAPAS):
    ws.write(2 + i, 2, n, f_lbl); ws.write(2 + i, 3, d, f_txt)
for i in range(10):
    if i < len(SECTORES):
        ws.write(2 + i, 4, SECTORES[i][0], f_cfg)
    else:
        ws.write_blank(2 + i, 4, None, f_cfg)
    ws.write_blank(2 + i, 5, None, f_cfgmt)
for i in range(6):
    if i < len(CONDICOES):
        ws.write(2 + i, 7, CONDICOES[i][0], f_cfg); ws.write(2 + i, 8, CONDICOES[i][1], f_cfgpct)
    else:
        ws.write_blank(2 + i, 7, None, f_cfg); ws.write_blank(2 + i, 8, None, f_cfgpct)
for i in range(8):
    ws.write(2 + i, 10, CANAIS[i] if i < len(CANAIS) else None, f_cfg)
for i in range(10):
    ws.write(2 + i, 12, MOTIVOS[i] if i < len(MOTIVOS) else None, f_cfg)
params = [("Nome do evento", "O Despertar", f_cfg), ("Data do evento", None, f_cfgdate),
          ("Início da campanha", dt.datetime(2026, 11, 27), f_cfgdate), ("Meta de ingressos", None, f_cfg),
          ("Moeda", "MT", f_cfg), ("Produção", "Laços Eternos & Deive Leonardo", f_cfg),
          ("Equipa de vendas", "Kingdom Company", f_cfg)]
for i, (k, v, fmt) in enumerate(params):
    ws.write(2 + i, 14, k, f_lbl)
    if isinstance(v, dt.datetime):
        ws.write_datetime(2 + i, 15, v, fmt)
    elif v is None:
        ws.write_blank(2 + i, 15, None, fmt)
    else:
        ws.write(2 + i, 15, v, fmt)
ws.write("O11", "A Data do evento e a Meta aparecem no dashboard quando preenchidas.", f_muted)
ws.write("E14", "Preencha os preços para o Valor e a Receita serem calculados.", f_muted)

for nome, ref in [("evento_nome", "$P$3"), ("evento_data", "$P$4"), ("campanha_inicio", "$P$5"),
                  ("meta_ingressos", "$P$6"), ("moeda", "$P$7"), ("producao", "$P$8"), ("equipa_vendas", "$P$9"),
                  ("lista_responsaveis", "$A$3:$A$20"), ("lista_etapas", "$C$3:$C$9"),
                  ("tabela_sectores", "$E$3:$F$12"), ("tabela_condicoes", "$H$3:$I$8"),
                  ("lista_canais", "$K$3:$K$10"), ("lista_motivos", "$M$3:$M$12")]:
    wb.define_name(nome, f"=Config!{ref}")

wb.worksheets()[1].activate()
wb.close()
print("leads", NL, "compradores", len(compr_orig), "historico", len(hist))
