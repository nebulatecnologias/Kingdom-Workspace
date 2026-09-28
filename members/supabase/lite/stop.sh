#!/usr/bin/env bash
# Stops the lite stack started by start.sh and deletes its throwaway database.
set -uo pipefail
CACHE="$(cd "$(dirname "$0")" && pwd)/.cache"
for svc in proxy postgrest gotrue; do
  [[ -f "$CACHE/$svc.pid" ]] && kill "$(cat "$CACHE/$svc.pid")" 2>/dev/null
  rm -f "$CACHE/$svc.pid"
done
if [[ -f "$CACHE/pgdir" ]]; then
  PGD="$(cat "$CACHE/pgdir")"
  PGBIN="$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)"
  if [[ $(id -u) -eq 0 ]]; then runuser -u postgres -- "$PGBIN/pg_ctl" -D "$PGD/data" -m fast stop >/dev/null 2>&1; else "$PGBIN/pg_ctl" -D "$PGD/data" -m fast stop >/dev/null 2>&1; fi
  case "$PGD" in /tmp/km-lite-pg.*) rm -rf -- "$PGD" ;; esac
  rm -f "$CACHE/pgdir"
fi
echo "Lite Supabase stopped."
