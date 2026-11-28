// GET /api/dados → números agregados da planilha (via Apps Script).
// Enquanto APPS_SCRIPT_URL não estiver definida, devolve o instantâneo guardado.
const instantaneo = require('./_instantaneo.json');

module.exports = async function handler(req, res) {
  const base = process.env.APPS_SCRIPT_URL;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (!base) {
    res.setHeader('Cache-Control', 'public, s-maxage=300');
    return res.status(200).send(JSON.stringify({ ...instantaneo, fonte: 'instantaneo' }));
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
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=300');
    return res.status(200).send(JSON.stringify({ ...dados, fonte: 'planilha' }));
  } catch (err) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).send(JSON.stringify({ erro: String(err && err.message || err) }));
  } finally {
    clearTimeout(limite);
  }
};
