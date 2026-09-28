import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Kingdom gateway webhook signatures.
 * Header: `X-Kingdom-Signature: t=<unix seconds>,v1=<hex>[,v1=<hex>]`, where each v1 is
 * HMAC-SHA256(secret, "<t>.<raw body>"). During a secret rotation the gateway sends one v1 per secret.
 */

export const SIGNATURE_TOLERANCE_SECONDS = 5 * 60;

export function signPayload(secret: string, timestamp: number, body: string) {
  return createHmac("sha256", secret).update(`${timestamp}.${body}`, "utf8").digest("hex");
}

/** Builds a header value, as the gateway does. Used by the simulator and tests. */
export function signatureHeader(secrets: string[], body: string, timestamp = Math.floor(Date.now() / 1000)) {
  return [`t=${timestamp}`, ...secrets.map((s) => `v1=${signPayload(s, timestamp, body)}`)].join(",");
}

export function parseSignatureHeader(header: string | null | undefined) {
  if (!header) return null;
  let timestamp: number | null = null;
  const signatures: string[] = [];
  for (const part of header.split(",")) {
    const [key, ...rest] = part.trim().split("=");
    const value = rest.join("=").trim();
    if (key === "t" && /^\d{1,12}$/.test(value)) timestamp = Number(value);
    else if (key === "v1" && /^[0-9a-f]{64}$/i.test(value)) signatures.push(value.toLowerCase());
  }
  return timestamp === null || signatures.length === 0 ? null : { timestamp, signatures };
}

export type SignatureCheck = { ok: true } | { ok: false; reason: "missing" | "malformed" | "stale" | "mismatch" | "no_secret" };

export function verifySignature(opts: {
  header: string | null | undefined;
  body: string;
  secrets: string[];
  now?: number;
  toleranceSeconds?: number;
}): SignatureCheck {
  if (!opts.header) return { ok: false, reason: "missing" };
  const secrets = opts.secrets.filter(Boolean);
  if (!secrets.length) return { ok: false, reason: "no_secret" };
  const parsed = parseSignatureHeader(opts.header);
  if (!parsed) return { ok: false, reason: "malformed" };
  const now = opts.now ?? Math.floor(Date.now() / 1000);
  if (Math.abs(now - parsed.timestamp) > (opts.toleranceSeconds ?? SIGNATURE_TOLERANCE_SECONDS)) return { ok: false, reason: "stale" };
  for (const secret of secrets) {
    const expected = Buffer.from(signPayload(secret, parsed.timestamp, opts.body), "hex");
    for (const candidate of parsed.signatures) {
      const given = Buffer.from(candidate, "hex");
      if (given.length === expected.length && timingSafeEqual(given, expected)) return { ok: true };
    }
  }
  return { ok: false, reason: "mismatch" };
}
