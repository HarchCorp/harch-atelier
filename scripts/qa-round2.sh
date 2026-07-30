#!/usr/bin/env bash
# Harch Atelier — QA round v2 (fixed: use type instead of fill for React controlled inputs)
set -uo pipefail
cd /home/z/my-project

LOG=/tmp/qa-round2.log
echo "=== $(date) START v2 ===" > $LOG

TUNNEL_URL=$(cat /tmp/tunnel-url.txt)
echo "TUNNEL=$TUNNEL_URL" >> $LOG

# Verify tunnel still up
THTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$TUNNEL_URL/atelier/login" 2>/dev/null)
echo "TUNNEL HTTP /atelier/login = $THTTP" >> $LOG
if [ "$THTTP" != "200" ]; then
  echo "TUNNEL DOWN, aborting" >> $LOG
  exit 1
fi

# QA function — uses type (real keystrokes) for React controlled inputs
qa_dashboard() {
  local OFFER=$1
  local EMAIL=$2
  local SESS="qa2-$OFFER"
  echo "--- QA $OFFER ($EMAIL) ---" >> $LOG

  agent-browser --session $SESS close 2>/dev/null
  agent-browser --session $SESS open "$TUNNEL_URL/atelier/login" >> $LOG 2>&1
  sleep 5

  # Focus email field and type
  agent-browser --session $SESS click "input[type=email]" >> $LOG 2>&1
  sleep 1
  agent-browser --session $SESS keyboard type "$EMAIL" >> $LOG 2>&1
  sleep 1

  # Focus password field and type
  agent-browser --session $SESS click "input[type=password]" >> $LOG 2>&1
  sleep 1
  agent-browser --session $SESS keyboard type "HarchTest2026!" >> $LOG 2>&1
  sleep 1

  # Snapshot before submit
  agent-browser --session $SESS snapshot -i -c > /tmp/snap2-$OFFER-pre.txt 2>&1

  # Submit
  agent-browser --session $SESS click "button[type=submit]" >> $LOG 2>&1
  sleep 7

  # Check redirect
  local URL=$(agent-browser --session $SESS eval "window.location.pathname" 2>/dev/null | tr -d '"' | tail -1)
  echo "REDIRECT $OFFER -> $URL" >> $LOG

  agent-browser --session $SESS snapshot -i -c > /tmp/snap2-$OFFER-post.txt 2>&1
  agent-browser --session $SESS screenshot --full "/home/z/my-project/download/qa2-$OFFER-01.png" >> $LOG 2>&1

  # If logged in, explore
  if echo "$URL" | grep -q "/atelier/console/"; then
    echo "LOGIN OK for $OFFER" >> $LOG
    # scroll down
    agent-browser --session $SESS scroll down 600 >> $LOG 2>&1
    sleep 1
    agent-browser --session $SESS screenshot "/home/z/my-project/download/qa2-$OFFER-02.png" >> $LOG 2>&1
    # scroll more
    agent-browser --session $SESS scroll down 800 >> $LOG 2>&1
    sleep 1
    agent-browser --session $SESS screenshot "/home/z/my-project/download/qa2-$OFFER-03.png" >> $LOG 2>&1
    # scroll top
    agent-browser --session $SESS scroll up 5000 >> $LOG 2>&1
    sleep 1
    # try clicking sidebar items via text
    agent-browser --session $SESS snapshot -i -c > /tmp/snap2-$OFFER-sidebar.txt 2>&1
    # final full screenshot
    agent-browser --session $SESS screenshot --full "/home/z/my-project/download/qa2-$OFFER-04.png" >> $LOG 2>&1
  else
    echo "LOGIN FAILED for $OFFER (stayed at $URL)" >> $LOG
  fi

  agent-browser --session $SESS close >> $LOG 2>&1
}

mkdir -p /home/z/my-project/download
qa_dashboard brand-monitor brand@harch.test
qa_dashboard market-competitor competitor@harch.test
qa_dashboard investment-bank investor@harch.test
qa_dashboard harch-alpha alpha@harch.test

echo "=== DONE v2 ===" >> $LOG
ls -la /home/z/my-project/download/qa2-*.png >> $LOG 2>&1
echo "SCRIPT DONE v2"
