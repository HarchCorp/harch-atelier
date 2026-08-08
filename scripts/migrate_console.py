#!/usr/bin/env python3
"""
Migrate console.* calls to structured logger (logInfo/logError/logWarn).

Scope: src/app/api/, src/app/atelier/, src/components/ — excluding src/lib/logger/.

For each call:
  console.error("msg", err)  ->  logError("cat", `msg: ${err instanceof Error ? err.message : err}`)
  console.error("msg")       ->  logError("cat", "msg")
  console.log("msg", val)    ->  logInfo("cat", `msg: ${val}`)
  console.log("msg")         ->  logInfo("cat", "msg")
  console.warn(...)          ->  logWarn(...)

Adds `import { logInfo, logError, logWarn } from "@/lib/logger";` if missing.

Skips console.* that appears inside template literals (backtick strings).
Skips files that already use logError/logInfo/logWarn and have no console.* left.
"""

from __future__ import annotations
import os
import re
import sys
from pathlib import Path

ROOT = Path("/home/z/my-project")
TARGET_DIRS = [
    ROOT / "src/app/api",
    ROOT / "src/app/atelier",
    ROOT / "src/components",
    ROOT / "src/lib",        # extended pass — first migration only covered 10 src/lib files
    ROOT / "src/data",
]
# Files (or directories) we must NOT touch.
EXCLUDE_PATHS = {
    ROOT / "src/lib/logger",   # logger cannot log itself
}
# Substrings that, if found in a file path, mean "skip this file".
# E.g. anything under src/lib/logger/ is excluded.
EXCLUDE_SUBSTRINGS = [
    "/lib/logger/",
]

LOG_LEVELS = {"log": "logInfo", "error": "logError", "warn": "logWarn", "debug": "logInfo", "info": "logInfo"}

# Files that contain console.* inside template literals / docs that we must not touch.
SKIP_FILES = {
    ROOT / "src/app/atelier/products/api-mcp/ApiMcpPage.tsx",  # console.log inside code sample
}


def derive_category(file_path: Path) -> str:
    """Derive a logger category from the file path."""
    rel = file_path.relative_to(ROOT / "src")
    parts = list(rel.parts)
    # Drop "route.ts" / "page.tsx" / "page.ts" filename
    if parts and parts[-1] in ("route.ts", "page.tsx", "page.ts"):
        parts = parts[:-1]
    # Drop "api" / "app" prefixes that are redundant
    if parts and parts[0] == "app":
        parts = parts[1:]
    if parts and parts[0] == "api":
        parts = parts[1:]
    if not parts:
        return "app"
    # Use the directory path as category, e.g. "admin.invitations"
    cat = ".".join(parts)
    # Strip extension if any
    cat = re.sub(r"\.(ts|tsx)$", "", cat)
    # Replace any non-alphanumeric with .
    cat = re.sub(r"[^a-zA-Z0-9._-]", ".", cat)
    # Collapse multiple dots
    cat = re.sub(r"\.+", ".", cat).strip(".")
    return cat or "app"


def find_console_calls(src: str):
    """
    Find every `console.<level>(...)` call that is NOT inside a
    template literal or a comment.

    Returns list of (start, end, level, args_str) tuples where
    `end` is the index just after the matching close paren.
    """
    results = []
    i = 0
    n = len(src)
    state = "code"  # code | string_single | string_double | template | line_comment | block_comment | regex
    # Track the previous non-whitespace, non-comment character in code state
    # so we can disambiguate `/` as division vs regex start.
    prev_significant = ""  # last non-whitespace char seen in code state

    while i < n:
        ch = src[i]
        nxt = src[i + 1] if i + 1 < n else ""

        if state == "code":
            if ch == '"':
                state = "string_double"
                prev_significant = '"'
                i += 1
                continue
            if ch == "'":
                state = "string_single"
                prev_significant = "'"
                i += 1
                continue
            if ch == "`":
                state = "template"
                prev_significant = "`"
                i += 1
                continue
            if ch == "/" and nxt == "/":
                state = "line_comment"
                i += 2
                continue
            if ch == "/" and nxt == "*":
                state = "block_comment"
                i += 2
                continue
            # Disambiguate `/` as regex start vs division.
            # A `/` is a regex start when the previous significant
            # character is NOT an identifier char, `)`, `]`, or a
            # literal number. (This is the standard heuristic.)
            if ch == "/":
                if prev_significant and (
                    prev_significant.isalnum()
                    or prev_significant in "_$)]\"'`"
                ):
                    # Division — not a regex.
                    prev_significant = "/"
                    i += 1
                    continue
                # Regex literal — scan until matching `/`, skipping
                # character classes `[...]` and escapes.
                state = "regex"
                i += 1
                continue
            # Look for console.<level>(
            if ch == "c" and src[i:i + 8] == "console.":
                # Verify the previous significant char is not an
                # identifier char (so `myconsole.` doesn't match).
                if prev_significant and (prev_significant.isalnum() or prev_significant in "_$"):
                    prev_significant = ch
                    i += 1
                    continue
                m = re.match(r"console\.(log|error|warn|debug|info)\s*\(", src[i:])
                if m:
                    level = m.group(1)
                    open_paren_idx = i + m.end() - 1
                    j = open_paren_idx + 1
                    depth = 1
                    inner_state = "code"
                    while j < n and depth > 0:
                        c = src[j]
                        nc = src[j + 1] if j + 1 < n else ""
                        if inner_state == "code":
                            if c == '"':
                                inner_state = "string_double"
                            elif c == "'":
                                inner_state = "string_single"
                            elif c == "`":
                                inner_state = "template"
                            elif c == "/" and nc == "/":
                                while j < n and src[j] != "\n":
                                    j += 1
                                continue
                            elif c == "/" and nc == "*":
                                j += 2
                                while j < n - 1 and not (src[j] == "*" and src[j + 1] == "/"):
                                    j += 1
                                j += 2
                                continue
                            elif c == "/":
                                # Inside a call's args, regex is rare.
                                # Treat as division-like (skip).
                                pass
                            elif c == "(":
                                depth += 1
                            elif c == ")":
                                depth -= 1
                                if depth == 0:
                                    break
                        elif inner_state == "string_double":
                            if c == "\\":
                                j += 2
                                continue
                            if c == '"':
                                inner_state = "code"
                        elif inner_state == "string_single":
                            if c == "\\":
                                j += 2
                                continue
                            if c == "'":
                                inner_state = "code"
                        elif inner_state == "template":
                            if c == "\\":
                                j += 2
                                continue
                            if c == "`":
                                inner_state = "code"
                        j += 1
                    if depth == 0:
                        end = j + 1
                        args_str = src[open_paren_idx + 1:j]
                        results.append((i, end, level, args_str))
                        prev_significant = ")"
                        i = end
                        continue
                i += 8
                continue
            if not ch.isspace():
                prev_significant = ch
            i += 1
            continue

        if state == "string_double":
            if ch == "\\":
                i += 2
                continue
            if ch == '"':
                state = "code"
                prev_significant = '"'
            i += 1
            continue

        if state == "string_single":
            if ch == "\\":
                i += 2
                continue
            if ch == "'":
                state = "code"
                prev_significant = "'"
            i += 1
            continue

        if state == "template":
            if ch == "\\":
                i += 2
                continue
            if ch == "`":
                state = "code"
                prev_significant = "`"
            i += 1
            continue

        if state == "line_comment":
            if ch == "\n":
                state = "code"
            i += 1
            continue

        if state == "block_comment":
            if ch == "*" and nxt == "/":
                state = "code"
                i += 2
                continue
            i += 1
            continue

        if state == "regex":
            # Inside a regex literal. Skip `[...]` character classes
            # (which can contain `/`) and escapes.
            if ch == "\\":
                i += 2
                continue
            if ch == "[":
                # Skip to matching `]`
                i += 1
                while i < n and src[i] != "]":
                    if src[i] == "\\":
                        i += 2
                        continue
                    i += 1
                i += 1
                continue
            if ch == "/":
                state = "code"
                prev_significant = "/"
                i += 1
                continue
            i += 1
            continue

    return results


def split_top_level_args(args_str: str):
    """Split args on top-level commas, respecting strings/parens/brackets/braces."""
    args = []
    cur = []
    depth = 0
    i = 0
    n = len(args_str)
    state = "code"
    while i < n:
        c = args_str[i]
        nc = args_str[i + 1] if i + 1 < n else ""
        if state == "code":
            if c == '"':
                state = "string_double"
                cur.append(c)
            elif c == "'":
                state = "string_single"
                cur.append(c)
            elif c == "`":
                state = "template"
                cur.append(c)
            elif c in "([{":
                depth += 1
                cur.append(c)
            elif c in ")]}":
                depth -= 1
                cur.append(c)
            elif c == "," and depth == 0:
                args.append("".join(cur).strip())
                cur = []
            else:
                cur.append(c)
        elif state == "string_double":
            cur.append(c)
            if c == "\\":
                if i + 1 < n:
                    cur.append(args_str[i + 1])
                i += 2
                continue
            if c == '"':
                state = "code"
        elif state == "string_single":
            cur.append(c)
            if c == "\\":
                if i + 1 < n:
                    cur.append(args_str[i + 1])
                i += 2
                continue
            if c == "'":
                state = "code"
        elif state == "template":
            cur.append(c)
            if c == "\\":
                if i + 1 < n:
                    cur.append(args_str[i + 1])
                i += 2
                continue
            if c == "`":
                state = "code"
        i += 1
    last = "".join(cur).strip()
    if last:
        args.append(last)
    return args


STRING_LITERAL_RE = re.compile(r'^"((?:[^"\\]|\\.)*)"$')
STRING_LITERAL_SINGLE_RE = re.compile(r"^'((?:[^'\\]|\\.)*)'$")
TEMPLATE_LITERAL_RE = re.compile(r"^`((?:[^`\\]|\\.)*)`$", re.DOTALL)


def parse_string_literal(arg: str):
    """Return the decoded string if arg is a plain string literal, else None."""
    m = STRING_LITERAL_RE.match(arg)
    if m:
        return m.group(1)
    m = STRING_LITERAL_SINGLE_RE.match(arg)
    if m:
        return m.group(1)
    return None


def is_template_literal(arg: str) -> bool:
    """Return True if arg is a backtick template literal."""
    return bool(TEMPLATE_LITERAL_RE.match(arg))


def is_string_like_expr(arg: str) -> bool:
    """
    Heuristic: returns True if `arg` looks like a string-like expression
    we can safely pass as the `message` parameter of logInfo/logError/logWarn.
    Covers:
      - plain string literals ("...", '...')
      - template literals (`...`)
      - concatenations of the above with `+`
      - template/string literals followed by `+ identifier` (rare but seen)
    """
    arg = arg.strip()
    if not arg:
        return False
    # Plain string or template literal
    if parse_string_literal(arg) is not None or is_template_literal(arg):
        return True
    # Concatenation: split on top-level `+` and check each part
    parts = split_top_level_plus(arg)
    if len(parts) > 1:
        return all(
            (parse_string_literal(p) is not None
             or is_template_literal(p)
             or p.strip().startswith("process.env")
             or p.strip().startswith("String("))
            for p in parts
        )
    return False


def split_top_level_plus(s: str):
    """Split a string on top-level `+` operators (not inside strings/parens)."""
    parts = []
    cur = []
    depth = 0
    i = 0
    n = len(s)
    state = "code"
    while i < n:
        c = s[i]
        nc = s[i + 1] if i + 1 < n else ""
        if state == "code":
            if c == '"':
                state = "string_double"; cur.append(c)
            elif c == "'":
                state = "string_single"; cur.append(c)
            elif c == "`":
                state = "template"; cur.append(c)
            elif c in "([{":
                depth += 1; cur.append(c)
            elif c in ")]}":
                depth -= 1; cur.append(c)
            elif c == "+" and depth == 0:
                parts.append("".join(cur).strip())
                cur = []
            else:
                cur.append(c)
        elif state == "string_double":
            cur.append(c)
            if c == "\\" and i + 1 < n:
                cur.append(s[i + 1]); i += 2; continue
            if c == '"':
                state = "code"
        elif state == "string_single":
            cur.append(c)
            if c == "\\" and i + 1 < n:
                cur.append(s[i + 1]); i += 2; continue
            if c == "'":
                state = "code"
        elif state == "template":
            cur.append(c)
            if c == "\\" and i + 1 < n:
                cur.append(s[i + 1]); i += 2; continue
            if c == "`":
                state = "code"
        i += 1
    last = "".join(cur).strip()
    if last:
        parts.append(last)
    return parts


def build_replacement(level: str, category: str, args_str: str):
    """Build the replacement logX(...) call. Returns None if too complex."""
    fn = LOG_LEVELS.get(level)
    if not fn:
        return None

    args = split_top_level_args(args_str)

    if len(args) == 0:
        return f'{fn}("{category}", "")'

    if len(args) == 1:
        s = parse_string_literal(args[0])
        if s is not None:
            # Plain string literal
            escaped = s.replace("\\", "\\\\").replace('"', '\\"')
            return f'{fn}("{category}", "{escaped}")'
        # Template literal — pass through as-is
        if is_template_literal(args[0]):
            return f'{fn}("{category}", {args[0]})'
        # String concatenation like `tmpl1` + `tmpl2` + "str"
        if is_string_like_expr(args[0]):
            return f'{fn}("{category}", {args[0]})'
        # Single non-string arg — wrap it
        # e.g. console.log(err) -> logInfo("cat", `err: ${err}`)  — but this is rare
        return None

    if len(args) == 2:
        s = parse_string_literal(args[0])
        second = args[1].strip()
        if s is not None:
            # Don't handle complex second args (objects, function calls)
            if not re.match(r"^[a-zA-Z_$][a-zA-Z0-9_$.]*\s*(?:\([^)]*\))?$", second):
                return None
            msg = s
            inner = f"${{{second}}}"
        elif is_template_literal(args[0]) or is_string_like_expr(args[0]):
            # console.log(`template`, value) — concat into a new template
            if not re.match(r"^[a-zA-Z_$][a-zA-Z0-9_$.]*\s*(?:\([^)]*\))?$", second):
                return None
            return f'{fn}("{category}", `{args[0]} ${{{second}}}`)'
        else:
            return None

        # If msg already ends with ":", keep it; else add " — "
        if msg.rstrip().endswith(":"):
            tmpl = msg + " " + inner
        elif msg.rstrip().endswith("—") or msg.rstrip().endswith("-"):
            tmpl = msg + " " + inner
        else:
            tmpl = msg + " — " + inner
        return f"{fn}(\"{category}\", `{tmpl}`)"

    # 3+ args: skip (too complex)
    return None


IMPORT_RE = re.compile(r'^import\s*\{[^}]*log(?:Info|Error|Warn)[^}]*\}\s*from\s*"@/lib/logger"\s*;?\s*$', re.MULTILINE)


def add_import(src: str, needs_warn: bool, needs_info: bool, needs_error: bool) -> str:
    """Add the logger import if not present."""
    if IMPORT_RE.search(src):
        return src  # already imports from logger
    # Determine which symbols we need
    syms = []
    if needs_info:
        syms.append("logInfo")
    if needs_warn:
        syms.append("logWarn")
    if needs_error:
        syms.append("logError")
    if not syms:
        return src
    # Deduplicate, preserve order
    seen = set()
    syms_uniq = []
    for s in syms:
        if s not in seen:
            syms_uniq.append(s)
            seen.add(s)
    imp = f"import {{ {', '.join(syms_uniq)} }} from \"@/lib/logger\";\n"

    # Find the last import line and insert after it
    lines = src.split("\n")
    last_import_idx = -1
    for idx, line in enumerate(lines):
        if line.startswith("import ") and (" from " in line or ' from "' in line):
            last_import_idx = idx
        elif line.startswith("import ") and last_import_idx >= 0 and not line.startswith("}"):
            # multi-line import — keep scanning
            pass
    if last_import_idx >= 0:
        # Insert a blank line + the import after the last import
        lines.insert(last_import_idx + 1, imp.rstrip("\n"))
        return "\n".join(lines)
    else:
        # Prepend
        return imp + src


def process_file(path: Path) -> tuple[int, int]:
    """Process one file. Returns (replaced_count, skipped_count)."""
    if path in SKIP_FILES:
        return (0, 0)
    src = path.read_text()
    # Skip client components — the structured logger (@/lib/logger)
    # imports Prisma and can't run in the browser bundle. Client
    # components keep their console.* calls (browser devtools are the
    # appropriate destination for client-side logs).
    first_line = ""
    for line in src.split("\n"):
        if line.strip():
            first_line = line.strip().rstrip(";")
            break
    if first_line in ('"use client"', "'use client'"):
        return (0, 0)
    calls = find_console_calls(src)
    if not calls:
        return (0, 0)

    category = derive_category(path)

    # Build replacements (process right-to-left so indices stay valid)
    replacements = []
    needs_warn = needs_info = needs_error = False
    replaced = 0
    skipped = 0
    for start, end, level, args_str in calls:
        fn_name = LOG_LEVELS.get(level, "logInfo")
        if fn_name == "logInfo":
            needs_info = True
        elif fn_name == "logWarn":
            needs_warn = True
        elif fn_name == "logError":
            needs_error = True
        repl = build_replacement(level, category, args_str)
        if repl is None:
            skipped += 1
            continue
        replacements.append((start, end, repl))
        replaced += 1

    if not replacements:
        return (0, skipped)

    # Apply replacements right-to-left
    new_src = src
    for start, end, repl in sorted(replacements, key=lambda r: r[0], reverse=True):
        new_src = new_src[:start] + repl + new_src[end:]

    # Add import if needed
    new_src = add_import(new_src, needs_warn, needs_info, needs_error)

    path.write_text(new_src)
    return (replaced, skipped)


def main():
    files = []
    for d in TARGET_DIRS:
        for ext in ("*.ts", "*.tsx"):
            for f in d.rglob(ext):
                fp_str = str(f)
                # Skip excluded paths
                if any(fp_str.startswith(str(ex)) for ex in EXCLUDE_PATHS):
                    continue
                if any(sub in fp_str for sub in EXCLUDE_SUBSTRINGS):
                    continue
                files.append(f)

    total_replaced = 0
    total_skipped = 0
    files_changed = 0
    skipped_files = []
    for f in sorted(files):
        replaced, skipped = process_file(f)
        if replaced > 0:
            files_changed += 1
            total_replaced += replaced
        if skipped > 0:
            skipped_files.append((str(f.relative_to(ROOT)), skipped))
            total_skipped += skipped

    print(f"Files changed: {files_changed}")
    print(f"Total replacements: {total_replaced}")
    print(f"Total skipped (complex patterns): {total_skipped}")
    if skipped_files:
        print("\nSkipped calls (need manual migration):")
        for f, n in skipped_files:
            print(f"  {f}: {n}")


if __name__ == "__main__":
    main()
