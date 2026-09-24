/**
 * Formats cents as South African rand, e.g. 14900 -> "R 149,00".
 * Prices are always in rand, so they keep the South African form in every language
 * (Portuguese or Spanish formatting would print "149,00 ZAR").
 */
export function formatZar(cents: number, _intlTag?: string): string {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(cents / 100);
}
