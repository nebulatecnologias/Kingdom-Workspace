#!/usr/bin/env bash
# Runs the schema, seed and security tests against PostgreSQL.
# Uses $DATABASE_URL when set (CI); otherwise starts a throwaway local cluster (needs PostgreSQL 15+ binaries).
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
sb="$here/.."

run_all() {
  local url="$1"
  psql "$url" -v ON_ERROR_STOP=1 -q -f "$here/auth_stub.sql"
  for f in "$sb"/migrations/*.sql; do psql "$url" -v ON_ERROR_STOP=1 -q -f "$f"; done
  psql "$url" -v ON_ERROR_STOP=1 -q -f "$sb/seed.sql"
  psql "$url" -v ON_ERROR_STOP=1 -q -f "$here/db_test.sql"
}

if [[ -n "${DATABASE_URL:-}" ]]; then
  run_all "$DATABASE_URL"
  exit 0
fi

bin="$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)"
tmp="$(mktemp -d)"
port=54329
as_pg() { if [[ $(id -u) -eq 0 ]]; then runuser -u postgres -- "$@"; else "$@"; fi; }
chmod 777 "$tmp"
as_pg "$bin/initdb" -D "$tmp/data" -U postgres -A trust >/dev/null
as_pg "$bin/pg_ctl" -D "$tmp/data" -o "-p $port -k $tmp -c listen_addresses=''" -l "$tmp/log" -w start >/dev/null
trap 'as_pg "$bin/pg_ctl" -D "$tmp/data" -m immediate stop >/dev/null; rm -rf "$tmp"' EXIT
run_all "postgresql://postgres@/postgres?host=$tmp&port=$port"
