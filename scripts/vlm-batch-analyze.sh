#!/bin/bash
# Robust sequential VLM analysis with retry/backoff. Resumable. Captures stderr.
set -u
IMG="$1"
BASENAME=$(basename "$IMG" .png)
OUTDIR="/home/z/my-project/vlm-results/per-image"
mkdir -p "$OUTDIR"
OUTFILE="$OUTDIR/${BASENAME}.json"

# Skip if already done (resumable)
if [ -f "$OUTFILE" ] && [ "$(stat -c%s "$OUTFILE" 2>/dev/null || echo 0)" -gt 50 ]; then
    echo "SKIP: $BASENAME (already done)"
    exit 0
fi

PROMPT='You are a senior frontend QA inspector. Analyze this webpage screenshot. Report ONLY visual defects (not content quality). Check: (1) overlapping elements, (2) truncated text, (3) blank/empty cards, (4) grid misalignment, (5) contrast issues, (6) infinite spinners/stuck loading, (7) missing icons/broken images, (8) layout breaks/horizontal scroll, (9) z-index issues, (10) footer not sticky. Respond in EXACTLY this JSON format, no markdown: {"verdict":"PASS|WARN|FAIL","defects":[{"severity":"low|med|high","type":"overlap|truncation|blank|alignment|contrast|spinner|icon|layout|zindex|footer","selector":"element description","desc":"1-line description"}],"summary":"1 sentence"}'

MAX_RETRIES=8
DELAY=15
for attempt in $(seq 1 $MAX_RETRIES); do
    # Capture BOTH stdout and stderr
    RAW=$(z-ai vision -p "$PROMPT" -i "$IMG" 2>&1)
    # Check for 429 explicitly
    if echo "$RAW" | grep -q "429"; then
        echo "  $BASENAME: 429, retry $attempt/$MAX_RETRIES after ${DELAY}s"
        sleep $DELAY
        DELAY=$((DELAY * 2))
        if [ $DELAY -gt 180 ]; then DELAY=180; fi
        continue
    fi
    # Extract the JSON content portion (look for "content" key in API response)
    CONTENT=$(echo "$RAW" | python3 -c "
import sys, json
data = sys.stdin.read()
idx = data.find('{')
if idx == -1:
    print('')
    sys.exit(0)
rest = data[idx:]
depth = 0
start = 0
end = -1
in_str = False
esc = False
for i, c in enumerate(rest):
    if esc:
        esc = False
        continue
    if c == '\\\\':
        esc = True
        continue
    if c == '\"':
        in_str = not in_str
        continue
    if in_str:
        continue
    if c == '{':
        if depth == 0:
            start = i
        depth += 1
    elif c == '}':
        depth -= 1
        if depth == 0:
            end = i + 1
            break
if end == -1:
    print('')
    sys.exit(0)
try:
    obj = json.loads(rest[start:end])
    print(obj['choices'][0]['message']['content'])
except Exception:
    print('')
" 2>/dev/null)

    if [ -n "$CONTENT" ]; then
        echo "$CONTENT" > "$OUTFILE"
        VERDICT=$(echo "$CONTENT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('verdict','?'))" 2>/dev/null)
        echo "OK: $BASENAME -> $VERDICT"
        exit 0
    fi
    echo "  $BASENAME: parse fail attempt $attempt, retrying in ${DELAY}s"
    sleep $DELAY
    DELAY=$((DELAY * 2))
    if [ $DELAY -gt 180 ]; then DELAY=180; fi
done
echo "FAIL: $BASENAME (all retries exhausted)"
echo '{"verdict":"ERROR","defects":[],"summary":"VLM all retries failed (likely 429)"}' > "$OUTFILE"
