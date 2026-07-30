#!/usr/bin/env bash
# Harch Atelier — Fix verification + QA + features in one blocking call
set -uo pipefail
cd /home/z/my-project

LOG=/tmp/round6.log
echo "=== $(date) START ===" > $LOG

# 1. Start dev server
echo "--- starting next dev ---" >> $LOG
pkill -f next-server 2>/dev/null
pkill -f "next dev" 2>/dev/null
sleep 2
setsid ./node_modules/.bin/next dev -p 3000 > /tmp/atelier-dev.log 2>&1 &
disown
sleep 12

# Verify server up
HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 20 http://localhost:3000/atelier 2>/dev/null)
echo "HTTP /atelier = $HTTP" >> $LOG

# 2. Test NextAuth login directly
echo "--- testing NextAuth login ---" >> $LOG
rm -f /tmp/c.txt /tmp/auth.json
CSRF_RESP=$(curl -s -c /tmp/c.txt http://localhost:3000/api/auth/csrf 2>/dev/null)
echo "CSRF response: $CSRF_RESP" >> $LOG
CSRF_TOKEN=$(echo "$CSRF_RESP" | grep -oE '"csrfToken":"[^"]+"' | cut -d'"' -f4)
echo "CSRF token: ${CSRF_TOKEN:0:30}..." >> $LOG

AUTH_HTTP=$(curl -s -b /tmp/c.txt -c /tmp/c.txt -o /tmp/auth.json -w "%{http_code}" \
  -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "email=brand@harch.test" \
  --data-urlencode "password=HarchTest2026!" \
  --data-urlencode "csrfToken=$CSRF_TOKEN" \
  --data-urlencode "callbackUrl=/atelier/console" \
  --data-urlencode "json=true" 2>/dev/null)
echo "Auth POST HTTP = $AUTH_HTTP" >> $LOG
echo "Auth response: $(head -c 300 /tmp/auth.json 2>/dev/null)" >> $LOG

SESSION=$(curl -s -b /tmp/c.txt http://localhost:3000/api/auth/session 2>/dev/null)
echo "Session: $SESSION" >> $LOG

# Check dev log for prisma errors
echo "--- dev log tail (checking for prisma errors) ---" >> $LOG
tail -30 /tmp/atelier-dev.log >> $LOG

# 3. If login works, start cloudflared + run QA
if echo "$SESSION" | grep -q "brand@harch.test"; then
  echo "=== LOGIN WORKS ===" >> $LOG
  
  # Start cloudflared
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
  
  # QA each dashboard
  qa_dashboard() {
    local OFFER=$1
    local EMAIL=$2
    local SESS="qa6-$OFFER"
    echo "--- QA $OFFER ---" >> $LOG
    
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
    sleep 8
    
    URL=$(agent-browser --session $SESS eval "window.location.pathname" 2>/dev/null | tr -d '"' | tail -1)
    echo "REDIRECT $OFFER -> $URL" >> $LOG
    agent-browser --session $SESS snapshot -i -c > /tmp/snap6-$OFFER.txt 2>&1
    agent-browser --session $SESS screenshot --full "/home/z/my-project/download/qa6-$OFFER-01.png" >> $LOG 2>&1
    
    if echo "$URL" | grep -q "/atelier/console/"; then
      echo "LOGIN OK for $OFFER" >> $LOG
      agent-browser --session $SESS scroll down 600 >> $LOG 2>&1
      sleep 1
      agent-browser --session $SESS screenshot "/home/z/my-project/download/qa6-$OFFER-02.png" >> $LOG 2>&1
      agent-browser --session $SESS scroll down 800 >> $LOG 2>&1
      sleep 1
      agent-browser --session $SESS screenshot "/home/z/my-project/download/qa6-$OFFER-03.png" >> $LOG 2>&1
      agent-browser --session $SESS scroll up 5000 >> $LOG 2>&1
      sleep 1
      agent-browser --session $SESS screenshot --full "/home/z/my-project/download/qa6-$OFFER-04.png" >> $LOG 2>&1
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
else
  echo "=== LOGIN STILL BROKEN ===" >> $LOG
  echo "Session was: $SESSION" >> $LOG
fi

echo "=== DONE ===" >> $LOG
ls -la /home/z/my-project/download/qa6-*.png 2>/dev/null >> $LOG
echo "SCRIPT DONE"
