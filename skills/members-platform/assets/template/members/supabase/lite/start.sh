#!/usr/bin/env bash
# Lightweight local Supabase for machines without Docker: PostgreSQL + GoTrue (auth) + PostgREST (API),
# behind one URL like Supabase's (http://127.0.0.1:54321). No Storage, Realtime or Studio.
# Applies members/supabase/migrations and seed.sql, then writes app/.env.lite with the keys.
#
#   members/supabase/lite/start.sh      # start (downloads the binaries once into .cache/)
#   members/supabase/lite/stop.sh       # stop and delete the throwaway database
#
# Needs PostgreSQL 15+ server binaries (initdb, pg_ctl), psql, node and curl. Run as root or as the postgres user.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SB="$(cd "$HERE/.." && pwd)"
APP="$(cd "$SB/../app" && pwd)"
CACHE="$HERE/.cache"
SECRET=super-secret-jwt-token-with-at-least-32-characters-long
PG_PORT=54400
POSTGREST_VERSION=v12.2.3
GOTRUE_VERSION=v2.186.0

mkdir -p "$CACHE/bin"
if [[ ! -x "$CACHE/bin/postgrest" ]]; then
  curl -fsSL "https://github.com/PostgREST/postgrest/releases/download/$POSTGREST_VERSION/postgrest-$POSTGREST_VERSION-linux-static-x64.tar.xz" | tar -xJ -C "$CACHE/bin"
fi
if [[ ! -x "$CACHE/bin/auth" ]]; then
  curl -fsSL "https://github.com/supabase/auth/releases/download/$GOTRUE_VERSION/auth-$GOTRUE_VERSION-x86.tar.gz" | tar -xz -C "$CACHE/bin"
fi

PGBIN="$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)"
as_pg() { if [[ $(id -u) -eq 0 ]]; then runuser -u postgres -- "$@"; else "$@"; fi; }
PGD="$(mktemp -d /tmp/km-lite-pg.XXXX)"
chmod 777 "$PGD"
echo "$PGD" > "$CACHE/pgdir"
as_pg "$PGBIN/initdb" -D "$PGD/data" -U postgres -A trust >/dev/null
as_pg "$PGBIN/pg_ctl" -D "$PGD/data" -o "-p $PG_PORT -k $PGD -c listen_addresses=127.0.0.1" -l "$PGD/log" -w start >/dev/null
DB="postgresql://postgres@127.0.0.1:$PG_PORT/postgres"

# Roles and grants as on Supabase.
psql "$DB" -q -v ON_ERROR_STOP=1 <<SQL
create role anon nologin noinherit;
create role authenticated nologin noinherit;
create role service_role nologin noinherit bypassrls;
create role authenticator login noinherit;
grant anon, authenticated, service_role to authenticator;
grant anon, authenticated, service_role to postgres;
create role supabase_auth_admin login superuser;
create schema auth authorization supabase_auth_admin;
alter role supabase_auth_admin set search_path = auth;
grant usage on schema public to anon, authenticated, service_role;
grant usage on schema auth to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
SQL

# GoTrue creates the auth schema tables on start.
(
  cd "$CACHE/bin"
  export GOTRUE_DB_DRIVER=postgres DATABASE_URL="postgres://supabase_auth_admin@127.0.0.1:$PG_PORT/postgres?sslmode=disable"
  export API_EXTERNAL_URL=http://127.0.0.1:54321/auth/v1 GOTRUE_API_HOST=127.0.0.1 PORT=9999 GOTRUE_SITE_URL=http://localhost:3000
  export GOTRUE_JWT_SECRET=$SECRET GOTRUE_JWT_EXP=3600 GOTRUE_JWT_AUD=authenticated GOTRUE_JWT_DEFAULT_GROUP_NAME=authenticated GOTRUE_JWT_ADMIN_ROLES=service_role
  export GOTRUE_DISABLE_SIGNUP=true GOTRUE_EXTERNAL_EMAIL_ENABLED=true GOTRUE_MAILER_AUTOCONFIRM=true GOTRUE_DB_NAMESPACE=auth GOTRUE_URI_ALLOW_LIST="http://localhost:3000/**"
  nohup ./auth > "$CACHE/gotrue.log" 2>&1 &
  echo $! > "$CACHE/gotrue.pid"
)
for _ in $(seq 1 60); do curl -sf http://127.0.0.1:9999/health >/dev/null && break; sleep 0.5; done
curl -sf http://127.0.0.1:9999/health >/dev/null || { tail -20 "$CACHE/gotrue.log"; exit 1; }
psql "$DB" -q -v ON_ERROR_STOP=1 -c "grant execute on all functions in schema auth to anon, authenticated, service_role;"

for f in "$SB"/migrations/*.sql; do psql "$DB" -q -v ON_ERROR_STOP=1 -f "$f"; done
psql "$DB" -q -v ON_ERROR_STOP=1 -f "$SB/seed.sql"

cat > "$CACHE/postgrest.conf" <<CONF
db-uri = "postgres://authenticator@127.0.0.1:$PG_PORT/postgres"
db-schemas = "public"
db-anon-role = "anon"
jwt-secret = "$SECRET"
server-port = 54330
server-host = "127.0.0.1"
CONF
nohup "$CACHE/bin/postgrest" "$CACHE/postgrest.conf" > "$CACHE/postgrest.log" 2>&1 &
echo $! > "$CACHE/postgrest.pid"
nohup node "$HERE/proxy.mjs" > "$CACHE/proxy.log" 2>&1 &
echo $! > "$CACHE/proxy.pid"

eval "$(node "$HERE/jwt.mjs" "$SECRET")"
cat > "$APP/.env.lite" <<ENV
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SERVICE_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
KM_DEV_MAILBOX=true
GATEWAY_WEBHOOK_SECRET=whsec_e2e_test_secret
GATEWAY_ACCEPT_TEST_EVENTS=true
ENV
for _ in $(seq 1 40); do curl -sf -o /dev/null http://127.0.0.1:54321/rest/v1/ && break; sleep 0.5; done
echo "Lite Supabase ready on http://127.0.0.1:54321. App settings written to members/app/.env.lite"
