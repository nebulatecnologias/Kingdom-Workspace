// GET /api/dados → números agregados da planilha (via Apps Script).
// Enquanto APPS_SCRIPT_URL não estiver definida, devolve o instantâneo guardado.
const instantaneo = require('./_instantaneo.json');

// A equipa não mostra os nomes provisórios "Pessoa 1, 2, 3…" (mantém nomes reais e "Sem responsável").
const provisorio = (nome) => /^pessoa\s*\d+$/i.test(String(nome || '').trim());
// Junta nomes curtos ao nome completo da mesma pessoa ("Mayra" → "Mayra Capitine"),
// quando há um só nome completo que começa por esse nome. Soma todos os números.
function mapaNomes(nomes) {
  const destino = {};
  nomes.forEach((n) => {
    if (!n || n.includes(' ')) return;
    const completos = [...new Set(nomes.filter((m) => m.toLowerCase().startsWith(n.toLowerCase() + ' ')))];
    if (completos.length === 1) destino[n] = completos[0];
  });
  return destino;
}

function juntarNomes(lista, destino) {
  const porNome = {};
  const saida = [];
  lista.forEach((p) => {
    const nome = destino[String(p.nome || '').trim()] || p.nome;
    if (!porNome[nome]) { porNome[nome] = { ...p, nome }; saida.push(porNome[nome]); return; }
    const alvo = porNome[nome];
    Object.keys(p).forEach((k) => { if (typeof p[k] === 'number') alvo[k] = (alvo[k] || 0) + p[k]; });
  });
  return saida;
}

function soNomesReais(d) {
  const todos = [];
  (d.equipa || []).forEach((p) => todos.push(String(p.nome || '').trim()));
  (d.dias || []).forEach((dia) => (dia.equipa || []).forEach((p) => todos.push(String(p.nome || '').trim())));
  const destino = mapaNomes(todos);
  const limpar = (l) => juntarNomes(l.filter((p) => !provisorio(p.nome)), destino);
  if (Array.isArray(d.equipa)) d.equipa = limpar(d.equipa);
  (d.dias || []).forEach((dia) => { if (Array.isArray(dia.equipa)) dia.equipa = limpar(dia.equipa); });
  return d;
}

module.exports = async function handler(req, res) {
  const base = process.env.APPS_SCRIPT_URL;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (!base) {
    res.setHeader('Cache-Control', 'public, s-maxage=300');
    return res.status(200).send(JSON.stringify(soNomesReais({ ...JSON.parse(JSON.stringify(instantaneo)), fonte: 'instantaneo' })));
  }

  const url = new URL(base);
  if (process.env.CHAVE_DASHBOARD) url.searchParams.set('chave', process.env.CHAVE_DASHBOARD);

  const controlo = new AbortController();
  const limite = setTimeout(() => controlo.abort(), 20000);
  try {
    const r = await fetch(url, { redirect: 'follow', signal: controlo.signal });
    const texto = await r.text();
    let dados;
    try {
      dados = JSON.parse(texto);
    } catch {
      throw new Error('A planilha respondeu com algo que não é JSON (o script está publicado como app da Web com acesso "Qualquer pessoa"?)');
    }
    if (dados.erro) throw new Error(dados.erro);
    // ?fresco=... vem do botão "Atualizar": resposta direta da planilha, sem cache na Vercel
    res.setHeader('Cache-Control', req.query && req.query.fresco ? 'no-store' : 'public, s-maxage=30, stale-while-revalidate=300');
    return res.status(200).send(JSON.stringify(soNomesReais({ ...dados, fonte: 'planilha' })));
  } catch (err) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).send(JSON.stringify({ erro: String(err && err.message || err) }));
  } finally {
    clearTimeout(limite);
  }
};
