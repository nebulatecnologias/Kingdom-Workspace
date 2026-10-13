#!/bin/bash
# Cloud sessions only: the container runs as root, and Chrome refuses to start as
# root without --no-sandbox. The motionmaxxing skill launches Chrome from
# $CHROME_PATH, so point it at a wrapper that adds the flag.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

CHROME=""
for p in /opt/pw-browsers/chromium "$(command -v google-chrome 2>/dev/null || true)" \
         "$(command -v chromium 2>/dev/null || true)"; do
  if [ -n "$p" ] && [ -x "$p" ]; then CHROME="$p"; break; fi
done
[ -n "$CHROME" ] || exit 0

if [ "$(id -u)" = 0 ]; then
  WRAPPER="$HOME/.local/bin/chrome-nosandbox"
  mkdir -p "$(dirname "$WRAPPER")"
  printf '#!/usr/bin/env bash\nexec "%s" --no-sandbox "$@"\n' "$CHROME" > "$WRAPPER"
  chmod +x "$WRAPPER"
  CHROME="$WRAPPER"
fi

if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo "export CHROME_PATH=\"$CHROME\"" >> "$CLAUDE_ENV_FILE"
fi
