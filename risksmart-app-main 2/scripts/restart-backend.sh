#!/bin/bash
# Restart backend (dev.js) and wait for SAM to be healthy.
# Env vars like PDP_ENDPOINT are inherited from the caller.
# Extra flags (e.g. --no-watch) are forwarded to dev.js.
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TIMEOUT=120  # seconds

# Kill existing dev.js and wait for ports to free up
pkill -f 'scripts/dev.js' 2>/dev/null || true

echo "Waiting for port 3001 to be released..."
elapsed=0
while lsof -i :3001 -t > /dev/null 2>&1; do
  sleep 1
  elapsed=$((elapsed + 1))
  if [ "$elapsed" -ge 30 ]; then
    echo "ERROR: Port 3001 still in use after ${elapsed}s" >&2
    exit 1
  fi
done

echo "Starting dev.js (--skip-synth $*)..."
: > /tmp/backend-dev.log
nohup node "$SCRIPT_DIR/dev.js" --skip-synth "$@" > /tmp/backend-dev.log 2>&1 &

echo "Waiting for dev.js to finish startup (timeout: ${TIMEOUT}s)..."
elapsed=0
until grep -q 'All services started' /tmp/backend-dev.log 2>/dev/null; do
  sleep 2
  elapsed=$((elapsed + 2))
  if [ "$elapsed" -ge "$TIMEOUT" ]; then
    echo "ERROR: dev.js did not finish startup after ${TIMEOUT}s" >&2
    echo "Last 30 lines of /tmp/backend-dev.log:" >&2
    tail -30 /tmp/backend-dev.log >&2
    exit 1
  fi
done

echo "dev.js startup complete"
