// Formatação moçambicana: 12 500,00 MT, datas dd/mm/aaaa.

const NBSP = " ";

export function mt(value: number, opts: { decimals?: boolean; unit?: boolean } = {}) {
  const { decimals = true, unit = true } = opts;
  const negative = value < 0;
  const abs = Math.abs(value);
  const fixed = decimals ? abs.toFixed(2) : Math.round(abs).toString();
  const [int, dec] = fixed.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  const body = dec ? `${grouped},${dec}` : grouped;
  return `${negative ? "−" : ""}${body}${unit ? `${NBSP}MT` : ""}`;
}

/** Valor abreviado para eixos e etiquetas: 1,4 M MT, 640 mil MT */
export function mtShort(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(".", ",")}${NBSP}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}${NBSP}mil`;
  return `${value}`;
}

export function pct(value: number, decimals = 1) {
  return `${value.toFixed(decimals).replace(".", ",")}%`;
}

export function int(value: number) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
}
