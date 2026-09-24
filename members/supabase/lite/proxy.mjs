// Part of the lite local stack (members/supabase/lite/start.sh).
// One URL like Supabase's: /auth/v1 -> GoTrue, /rest/v1 -> PostgREST.
// Like Supabase's gateway, it answers CORS itself, so browser calls (e.g. two-step verification) work too.
import http from "node:http";
const routes = [["/auth/v1", 9999], ["/rest/v1", 54330]];
const cors = (req) => ({
  "access-control-allow-origin": req.headers.origin ?? "*",
  "access-control-allow-credentials": "true",
  "access-control-allow-methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "access-control-allow-headers": req.headers["access-control-request-headers"] ?? "*",
  "access-control-expose-headers": "content-range, x-supabase-api-version",
  vary: "Origin",
});
http.createServer((req, res) => {
  if (req.method === "OPTIONS") { res.writeHead(204, cors(req)); res.end(); return; }
  const route = routes.find(([p]) => req.url.startsWith(p + "/") || req.url === p || req.url.startsWith(p + "?"));
  if (!route) { res.writeHead(404, { "content-type": "application/json", ...cors(req) }); res.end('{"message":"not available in lite stack"}'); return; }
  const path = req.url.slice(route[0].length) || "/";
  const up = http.request({ host: "127.0.0.1", port: route[1], path, method: req.method, headers: req.headers }, (r) => {
    const headers = Object.fromEntries(Object.entries(r.headers).filter(([k]) => !k.startsWith("access-control-")));
    res.writeHead(r.statusCode, { ...headers, ...cors(req) });
    r.pipe(res);
  });
  up.on("error", (e) => { res.writeHead(502); res.end(String(e)); });
  req.pipe(up);
}).listen(54321, "127.0.0.1", () => console.log("proxy on 54321"));
