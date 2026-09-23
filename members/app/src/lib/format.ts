/** Formats cents as South African rand in the given Intl locale, e.g. 14900 -> "R 149,00". */
export function formatZar(cents: number, intlTag = "en-ZA"): string {
  return new Intl.NumberFormat(intlTag, { style: "currency", currency: "ZAR" }).format(cents / 100);
}
