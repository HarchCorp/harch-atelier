#!/usr/bin/env bash
# Harch Atelier — Fire #8 QA one-shot
set -uo pipefail
cd /home/z/my-project

LOG=/tmp/fire8.log
echo "=== $(date) START ===" > $LOG

# 1. Start dev server
echo "--- starting next dev ---" >> $LOG
pkill -f next-server 2>/dev/null; pkill -f "next dev" 2>/dev/null
sleep 2
rm -rf .next
setsid ./node_modules/.bin/next dev -p 3000 > /tmp/atelier-dev.log 2>&1 &
disown
sleep 14
HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 http://localhost:3000/atelier 2>/dev/null)
echo "HTTP /atelier = $HTTP" >> $LOG

# 2. Quick auth verify
rm -f /tmp/c.txt /tmp/auth.json
CSRF=$(curl -s -c /tmp/c.txt http://localhost:3000/api/auth/csrf 2>/dev/null | grep -oE '"csrfToken":"[^"]+"' | cut -d'"' -f4)
AUTH_HTTP=$(curl -s -b /tmp/c.txt -c /tmp/c.txt -o /tmp/auth.json -w "%{http_code}" \
  -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "email=brand@harch.test" \
  --data-urlencode "password=HarchTest2026!" \
  --data-urlencode "csrfToken=$CSRF" \
  --data-urlencode "callbackUrl=/atelier/console" \
  --data-urlencode "json=true" 2>/dev/null)
echo "Auth HTTP = $AUTH_HTTP" >> $LOG
SESSION=$(curl -s -b /tmp/c.txt http://localhost:3000/api/auth/session 2>/dev/null)
echo "Session: $SESSION" >> $LOG

# 3. Start cloudflared
echo "--- starting cloudflared ---" >> $LOG
if [ ! -x /tmp/cloudflared ]; then
  curl -sL -o /tmp/cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 >> $LOG 2>&1
  chmod +x /tmp/cloudflared
fi
pkill -f "cloudflared tunnel" 2>/dev/null
sleep 1
setsid /tmp/cloudflared tunnel --url http://localhost:3000 > /tmp/tunnel.log 2>&1 &
disown
sleep 10
TUNNEL_URL=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/tunnel.log | head -1)
echo "$TUNNEL_URL" > /tmp/tunnel-url.txt
echo "TUNNEL=$TUNNEL_URL" >> $LOG
THTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$TUNNEL_URL/atelier/login" 2>/dev/null)
echo "Tunnel HTTP = $THTTP" >> $LOG

# 4. QA function
qa_dashboard() {
  local OFFER=$1
  local EMAIL=$2
  local SESS="qa8-$OFFER"
  echo "--- QA $OFFER ($EMAIL) ---" >> $LOG

  agent-browser --session $SESS close 2>/dev/null
  agent-browser --session $SESS open "$TUNNEL_URL/atelier/login" >> $LOG 2>&1
  sleep 5
  agent-browser --session $SESS click "input[type=email]" >> $LOG 2>&1
  sleep 1
  agent-browser --session $SESS keyboard type "$EMAIL" >> $LOG 2>&1
  sleep 1
  agent-browser --session $SESS click "input[type=password]" >> $LOG 2>&1
  sleep 1
  agent-browser --session $SESS keyboard type "HarchTest2026!" >> $LOG 2>&1
  sleep 1
  agent-browser --session $SESS press Enter >> $LOG 2>&1
  sleep 9

  URL=$(agent-browser --session $SESS eval "window.location.pathname" 2>/dev/null | tr -d '"' | tail -1)
  echo "REDIRECT $OFFER -> $URL" >> $LOG
  agent-browser --session $SESS snapshot -i -c > /tmp/snap8-$OFFER.txt 2>&1
  agent-browser --session $SESS screenshot --full "/home/z/my-project/download/qa8-$OFFER-01.png" >> $LOG 2>&1

  if echo "$URL" | grep -q "/atelier/console/"; then
    echo "LOGIN OK for $OFFER" >> $LOG
    # Explore: scroll, screenshot
    agent-browser --session $SESS scroll down 600 >> $LOG 2>&1
    sleep 1
    agent-browser --session $SESS screenshot "/home/z/my-project/download/qa8-$OFFER-02.png" >> $LOG 2>&1
    agent-browser --session $SESS scroll down 800 >> $LOG 2>&1
    sleep 1
    agent-browser --session $SESS screenshot "/home/z/my-project/download/qa8-$OFFER-03.png" >> $LOG 2>&1
    agent-browser --session $SESS scroll up 5000 >> $LOG 2>&1
    sleep 1
    agent-browser --session $SESS screenshot --full "/home/z/my-project/download/qa8-$OFFER-04.png" >> $LOG 2>&1
    # Try clicking sidebar items
    agent-browser --session $SESS snapshot -i -c > /tmp/snap8-$OFFER-sidebar.txt 2>&1
    # Mobile viewport
    agent-browser --session $SESS eval "window.resizeTo(375,812)" >> $LOG 2>&1
    sleep 1
    agent-browser --session $SESS screenshot "/home/z/my-project/download/qa8-$OFFER-05-mobile.png" >> $LOG 2>&1
  else
    echo "LOGIN FAILED for $OFFER" >> $LOG
  fi
  agent-browser --session $SESS close >> $LOG 2>&1
}

mkdir -p /home/z/my-project/download
qa_dashboard brand-monitor brand@harch.test
qa_dashboard market-competitor competitor@harch.test
qa_dashboard investment-bank investor@harch.test
qa_dashboard harch-alpha alpha@harch.test

echo "=== QA DONE ===" >> $LOG
ls -la /home/z/my-project/download/qa8-*.png >> $LOG 2>&1
echo "SCRIPT DONE"
