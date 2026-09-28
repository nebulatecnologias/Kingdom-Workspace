// Part of the lite local stack (members/supabase/lite/start.sh).
import { createHmac } from "node:crypto";
const secret = process.argv[2];
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const sign = (payload) => {
  const head = b64({ alg: "HS256", typ: "JWT" });
  const body = b64(payload);
  return `${head}.${body}.${createHmac("sha256", secret).update(`${head}.${body}`).digest("base64url")}`;
};
const exp = Math.floor(Date.now() / 1000) + 10 * 365 * 86400;
console.log(`ANON_KEY=${sign({ role: "anon", iss: "supabase", exp })}`);
console.log(`SERVICE_KEY=${sign({ role: "service_role", iss: "supabase", exp })}`);
