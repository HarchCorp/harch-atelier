#!/usr/bin/env bash
# QA FINAL — login real accounts, screenshots, VLM analysis
set -uo pipefail
cd /home/z/my-project
LOG=/tmp/qa-final.log
echo "=== $(date) START ===" > $LOG
mkdir -p /home/z/my-project/download/qa-final

# 1. Start server
pkill -f next-server 2>/dev/null
sleep 2
rm -rf .next
setsid ./node_modules/.bin/next dev -p 3000 > /tmp/atelier-dev.log 2>&1 &
disown
sleep 15
HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 20 http://localhost:3000/atelier 2>/dev/null)
echo "HTTP /atelier = $HTTP" >> $LOG

# 2. Start tunnel
pkill -f "cloudflared" 2>/dev/null
sleep 1
if [ ! -x /tmp/cloudflared ]; then
  curl -sL -o /tmp/cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
  chmod +x /tmp/cloudflared
fi
setsid /tmp/cloudflared tunnel --url http://localhost:3000 > /tmp/tunnel.log 2>&1 &
disown
sleep 12
TUNNEL_URL=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/tunnel.log | head -1)
echo "$TUNNEL_URL" > /tmp/tunnel-url.txt
echo "TUNNEL=$TUNNEL_URL" >> $LOG

# 3. Login function — real accounts
login_account() {
  local EMAIL=$1
  local SESS=$2
  echo "--- LOGIN $EMAIL ---" >> $LOG
  agent-browser --session $SESS close 2>/dev/null
  agent-browser --session $SESS open "http://localhost:3000/atelier/login" >> $LOG 2>&1
  sleep 5
  agent-browser --session $SESS fill "input[type=email]" "$EMAIL" >> $LOG 2>&1
  sleep 1
  agent-browser --session $SESS fill "input[type=password]" "HarchTest2026!" >> $LOG 2>&1
  sleep 1
  agent-browser --session $SESS click "button[type=submit]" >> $LOG 2>&1
  sleep 8
  agent-browser --session $SESS eval "window.location.pathname" >> $LOG 2>&1
}

# 4. QA function — screenshot + scroll + screenshot
qa_dashboard() {
  local SESS=$1
  local NAME=$2
  echo "--- QA $NAME ---" >> $LOG
  # Full page screenshot
  agent-browser --session $SESS screenshot --full "/home/z/my-project/download/qa-final/${NAME}-01-full.png" >> $LOG 2>&1
  sleep 2
  # Scroll down
  agent-browser --session $SESS scroll down 600 >> $LOG 2>&1
  sleep 2
  agent-browser --session $SESS screenshot "/home/z/my-project/download/qa-final/${NAME}-02-scroll1.png" >> $LOG 2>&1
  # Scroll more
  agent-browser --session $SESS scroll down 800 >> $LOG 2>&1
  sleep 2
  agent-browser --session $SESS screenshot "/home/z/my-project/download/qa-final/${NAME}-03-scroll2.png" >> $LOG 2>&1
  # Scroll to top
  agent-browser --session $SESS scroll up 5000 >> $LOG 2>&1
  sleep 1
  # Mobile viewport
  agent-browser --session $SESS eval "window.resizeTo(375,812)" >> $LOG 2>&1
  sleep 2
  agent-browser --session $SESS screenshot "/home/z/my-project/download/qa-final/${NAME}-04-mobile.png" >> $LOG 2>&1
  # Back to desktop
  agent-browser --session $SESS eval "window.resizeTo(1920,1080)" >> $LOG 2>&1
  sleep 2
  # Snapshot for text analysis
  agent-browser --session $SESS snapshot -i -c > "/tmp/snap-${NAME}.txt" 2>&1
}

# 5. Login + QA each account
login_account "amine@harchcorp.com" "qa-admin"
qa_dashboard "qa-admin" "admin"

login_account "brand@harch.test" "qa-brand"
qa_dashboard "qa-brand" "brand-monitor"

login_account "competitor@harch.test" "qa-competitor"
qa_dashboard "qa-competitor" "competitor-intel"

login_account "investor@harch.test" "qa-investor"
qa_dashboard "qa-investor" "investor-desk"

login_account "alpha@harch.test" "qa-alpha"
qa_dashboard "qa-alpha" "alpha-desk"

# 6. Close all sessions
for SESS in qa-admin qa-brand qa-competitor qa-investor qa-alpha; do
  agent-browser --session $SESS close 2>/dev/null
done

echo "=== DONE ===" >> $LOG
ls -la /home/z/my-project/download/qa-final/*.png >> $LOG 2>&1
echo "SCRIPT DONE"
