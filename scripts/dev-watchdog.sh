#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  DEV WATCHDOG — Kaelen Vance infrastructure
#
#  The sandbox has 3.9GB RAM + 0 swap. Turbopack OOM-kills the
#  next-server child after 1-2 page compilations. This watchdog
#  keeps the dev server alive by respawning it immediately after
#  death. The dev.log captures the last compile output.
#
#  Method (validated by vlm-capture-with-server.ts in worklog):
#    NODE_OPTIONS=4096 + Turbopack + auto-respawn
# ═══════════════════════════════════════════════════════════════

cd /home/z/my-project
LOG=/home/z/my-project/dev.log
WATCHDOG_LOG=/tmp/watchdog.log

echo "[$(date '+%H:%M:%S')] watchdog started" > "$WATCHDOG_LOG"

while true; do
  # Kill any stale next processes
  pkill -9 -f "next-server" 2>/dev/null
  pkill -9 -f "next dev" 2>/dev/null
  sleep 2

  echo "[$(date '+%H:%M:%S')] launching next dev (NODE_OPTIONS=4096, Turbopack)..." >> "$WATCHDOG_LOG"

  NODE_OPTIONS="--max-old-space-size=4096" node_modules/.bin/next dev -p 3000 > "$LOG" 2>&1
  EXIT=$?
  echo "[$(date '+%H:%M:%S')] next dev exited (code=$EXIT), respawning in 3s..." >> "$WATCHDOG_LOG"
  sleep 3
done
