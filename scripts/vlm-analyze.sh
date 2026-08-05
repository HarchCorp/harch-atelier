#!/bin/bash
# VLM analysis with proper JSON parsing — sequential (rate limit safe)
mkdir -p /tmp/vlm-findings
DIR="/home/z/my-project/screenshots/vlm-cycle-1"

PROMPT='You are a senior frontend QA inspector. Analyze this webpage screenshot. Report ONLY visual defects (not content quality). Check: overlapping elements, truncated text, blank/empty cards, grid misalignment, contrast issues, infinite spinners/stuck loading, missing icons/broken images, layout breaks/horizontal scroll, z-index issues, footer not sticky. Respond in EXACTLY this JSON format only, no markdown: {"verdict":"PASS|WARN|FAIL","defects":[{"severity":"low|med|high","type":"overlap|truncation|blank|alignment|contrast|spinner|icon|layout|zindex|footer","selector":"element","desc":"1-line"}],"summary":"1 sentence"}'

for img in "$DIR"/*.png; do
  name=$(basename "$img" .png)
  outfile="/tmp/vlm-findings/${name}.json"
  
  # Skip if already analyzed successfully
  if [ -f "$outfile" ] && rg -q '"verdict"' "$outfile" 2>/dev/null; then
    content=$(rg -o '"content":"[^"]*"' "$outfile" | head -1)
    if echo "$content" | rg -q 'PASS\|WARN\|FAIL'; then
      verdict=$(echo "$content" | rg -o '\\"verdict\\":\\"[^"]*\\"' | head -1 | rg -o 'PASS\|WARN\|FAIL')
      echo "$name: $verdict (cached)"
      continue
    fi
  fi
  
  # Call VLM
  z-ai vision -p "$PROMPT" -i "$img" -o "$outfile" 2>/dev/null
  
  # Parse the nested JSON content
  if [ -f "$outfile" ]; then
    # Extract content field, unescape the JSON inside
    content=$(python3 -c "
import json, sys
with open('$outfile') as f:
    data = json.load(f)
inner = data.get('choices',[{}])[0].get('message',{}).get('content','')
print(inner)
" 2>/dev/null)
    
    if [ -n "$content" ]; then
      verdict=$(echo "$content" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('verdict','?'))" 2>/dev/null)
      ndefects=$(echo "$content" | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('defects',[])))" 2>/dev/null)
      echo "$name: $verdict ($ndefects defects)"
    else
      echo "$name: PARSE_FAILED"
    fi
  else
    echo "$name: VLM_FAILED"
  fi
done

echo ""
echo "=== SUMMARY ==="
PASS=0; WARN=0; FAIL=0
for f in /tmp/vlm-findings/*.json; do
  content=$(python3 -c "
import json
with open('$f') as fh:
    data = json.load(fh)
inner = data.get('choices',[{}])[0].get('message',{}).get('content','')
try:
    d = json.loads(inner)
    print(d.get('verdict','?'))
except: print('PARSE_ERR')
" 2>/dev/null)
  case "$content" in
    PASS) PASS=$((PASS+1)) ;;
    WARN) WARN=$((WARN+1)) ;;
    FAIL) FAIL=$((FAIL+1)) ;;
  esac
done
echo "PASS: $PASS  WARN: $WARN  FAIL: $FAIL"

echo ""
echo "=== ALL DEFECTS ==="
for f in /tmp/vlm-findings/*.json; do
  name=$(basename "$f" .json)
  python3 -c "
import json
with open('$f') as fh:
    data = json.load(fh)
inner = data.get('choices',[{}])[0].get('message',{}).get('content','')
try:
    d = json.loads(inner)
    for defect in d.get('defects',[]):
        sev = defect.get('severity','?')
        typ = defect.get('type','?')
        desc = defect.get('desc','?')
        print(f'$name | {sev} | {typ} | {desc}')
except: pass
" 2>/dev/null
done | sort
