#!/bin/bash
# VLM analysis with exponential backoff + jitter for 429 rate limit
mkdir -p /tmp/vlm-findings
DIR="/home/z/my-project/screenshots/vlm-cycle-1"

PROMPT='Senior frontend QA. Report ONLY visual defects. Check: overlapping, truncated text, blank cards, grid misalignment, contrast, infinite spinners, missing icons, layout breaks, z-index, footer sticky. Respond with JSON only, NO markdown: {"verdict":"PASS|WARN|FAIL","defects":[{"severity":"low|med|high","type":"overlap|truncation|blank|alignment|contrast|spinner|icon|layout|zindex|footer","selector":"elem","desc":"1-line"}],"summary":"1 sentence"}'

vlm_analyze() {
  local img="$1"
  local name=$(basename "$img" .png)
  local outfile="/tmp/vlm-findings/${name}.json"
  
  # Skip if already has valid verdict
  if [ -f "$outfile" ]; then
    local existing=$(python3 -c "
import json, re
try:
    d = json.load(open('$outfile'))
    inner = d['choices'][0]['message']['content']
    inner = re.sub(r'\`\`\`json\s*', '', inner.strip()).rstrip('\`')
    j = json.loads(inner)
    print(j.get('verdict',''))
except: print('')
" 2>/dev/null)
    if [ -n "$existing" ]; then
      echo "$name: $existing (cached)"
      return 0
    fi
  fi
  
  # Exponential backoff: 4s, 8s, 16s, 32s, 64s
  local delays=(4 8 16 32 64)
  for attempt in 1 2 3 4 5; do
    # Add jitter (0-2s)
    local jitter=$((RANDOM % 3))
    sleep $jitter
    
    z-ai vision -p "$PROMPT" -i "$img" -o "$outfile" 2>/dev/null
    if [ -f "$outfile" ] && [ $(stat -c %s "$outfile") -gt 100 ]; then
      local verdict=$(python3 -c "
import json, re
try:
    d = json.load(open('$outfile'))
    inner = d['choices'][0]['message']['content']
    inner = re.sub(r'\`\`\`json\s*', '', inner.strip()).rstrip('\`')
    j = json.loads(inner)
    print(j.get('verdict','?'))
except: print('?')
" 2>/dev/null)
      if [ "$verdict" != "?" ]; then
        echo "$name: $verdict (attempt $attempt)"
        return 0
      fi
    fi
    
    # Check for 429 in stderr
    local delay=${delays[$((attempt-1))]}
    echo "$name: retry $attempt in ${delay}s" >&2
    sleep $delay
  done
  
  echo "$name: FAILED (5 attempts)"
  return 1
}
export -f vlm_analyze
export PROMPT

# Process all screenshots sequentially (VLM rate-limited)
for img in "$DIR"/*.png; do
  vlm_analyze "$img"
done

echo ""
echo "=== FINAL SUMMARY ==="
PASS=0; WARN=0; FAIL=0; UNKNOWN=0
for f in /tmp/vlm-findings/*.json; do
  v=$(python3 -c "
import json, re
try:
    d = json.load(open('$f'))
    inner = d['choices'][0]['message']['content']
    inner = re.sub(r'\`\`\`json\s*', '', inner.strip()).rstrip('\`')
    j = json.loads(inner)
    print(j.get('verdict','?'))
except: print('?')
" 2>/dev/null)
  case "$v" in
    PASS) PASS=$((PASS+1)) ;;
    WARN) WARN=$((WARN+1)) ;;
    FAIL) FAIL=$((FAIL+1)) ;;
    *) UNKNOWN=$((UNKNOWN+1)) ;;
  esac
done
echo "PASS: $PASS  WARN: $WARN  FAIL: $FAIL  UNKNOWN: $UNKNOWN"
