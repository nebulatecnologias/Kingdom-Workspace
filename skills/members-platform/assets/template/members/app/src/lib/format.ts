/**
 * Formats cents as South African rand, e.g. 14900 -> "R 149,00".
 * Prices are always in rand, so they keep the South African form in every language
 * (Portuguese or Spanish formatting would print "149,00 ZAR").
 */
export function formatZar(cents: number, _intlTag?: string): string {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(cents / 100);
}

/** Whole rand without cents when there are none: 7500 -> "R 75", 7550 -> "R 75,50". For headline prices. */
export function formatZarShort(cents: number): string {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: cents % 100 ? 2 : 0, minimumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100);
}
