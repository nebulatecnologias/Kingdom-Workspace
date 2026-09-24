import { createHash, randomBytes } from "node:crypto";

/** A 256-bit URL-safe token. Only its SHA-256 hash is stored; the token itself travels in the email link. */
export function generateToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}

/** Hex SHA-256 of the token, in PostgreSQL bytea input format (\x…). */
export function hashToken(token: string) {
  return "\\x" + createHash("sha256").update(token, "utf8").digest("hex");
}

/** Cheap shape check before touching the database. */
export function looksLikeToken(token: string) {
  return /^[A-Za-z0-9_-]{43}$/.test(token);
}
