// Phone numbers (#14): digits only (spaces, dashes and brackets are fine), 9–15 digits, optional "+".
// Mozambican numbers without the country code get +258 and are written "+258 84 123 4567".
export const PHONE_ERROR = "Número inválido. Ex.: +258 84 123 4567";

export function normalizePhone(raw: string | null | undefined): { ok: true; value: string | null } | { ok: false } {
  const v = (raw ?? "").trim();
  if (!v) return { ok: true, value: null };
  if (!/^\+?[\d\s\-().]+$/.test(v)) return { ok: false };
  let digits = v.replace(/\D/g, "");
  if (v.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 9 && /^[82]/.test(digits)) digits = `258${digits}`;
  if (digits.length < 9 || digits.length > 15) return { ok: false };
  if (digits.startsWith("258") && digits.length === 12) {
    return { ok: true, value: `+258 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}` };
  }
  return { ok: true, value: `+${digits}` };
}
