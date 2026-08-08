#!/usr/bin/env python3
"""
Fix two issues from the first migration pass:

1. Files that already imported { logInfo, logWarn } from "@/lib/logger"
   but not logError — the import wasn't extended, so logError is undefined.

2. Generated `${X instanceof Error ? X.message : X}` patterns where X is
   not actually an Error-typed value (e.g. already a string from a prior
   `const msg = err instanceof Error ? err.message : String(err)`).
   Simplify to `${X}` which works for any type.
"""

from __future__ import annotations
import re
import sys
from pathlib import Path

ROOT = Path("/home/z/my-project")
TARGET_DIRS = [
    ROOT / "src/app/api",
    ROOT / "src/app/atelier",
    ROOT / "src/components",
]

# Matches: import { logInfo, logWarn } from "@/lib/logger";
# Captures the inside of the braces.
LOGGER_IMPORT_RE = re.compile(
    r'^(?P<prefix>import\s*\{)(?P<symbols>[^}]*)(?P<suffix>\}\s*from\s*"@/lib/logger"\s*;?)\s*$',
    re.MULTILINE,
)


def fix_logger_import(src: str) -> tuple[str, bool]:
    """Ensure logError is in the @/lib/logger import if logInfo/logWarn is."""
    def replacer(m: re.Match) -> str:
        symbols = m.group("symbols")
        names = [s.strip() for s in symbols.split(",") if s.strip()]
        if "logError" in names:
            return m.group(0)
        # Build ordered symbol list. Always include logError since the
        # first-pass migration may have introduced logError calls that
        # we need to cover (we don't know which symbols are actually
        # used — the import extension is safe even if unused, tsc will
        # tree-shake it).
        ordered = []
        for n in ("logInfo", "logWarn", "logError"):
            if n in names:
                ordered.append(n)
        # If logError wasn't in names but we're being asked to extend,
        # add it anyway.
        if "logError" not in ordered:
            ordered.append("logError")
        for n in names:
            if n not in ordered:
                ordered.append(n)
        return f'import {{ {", ".join(ordered)} }} from "@/lib/logger";'

    new_src, count = LOGGER_IMPORT_RE.subn(replacer, src)
    return new_src, count > 0


# Matches: ${X instanceof Error ? X.message : X}
# where X is a JS identifier (possibly with dots, e.g. err.message)
INSTANCEOF_RE = re.compile(
    r'\$\{(?P<var>[a-zA-Z_$][a-zA-Z0-9_$.]*)\s+instanceof\s+Error\s*\?\s*(?P=var)\.message\s*:\s*(?P=var)\}'
)


def fix_instanceof(src: str) -> tuple[str, int]:
    """Replace `${X instanceof Error ? X.message : X}` with `${X}`."""
    new_src, count = INSTANCEOF_RE.subn(lambda m: "${" + m.group("var") + "}", src)
    return new_src, count


def main():
    files = []
    for d in TARGET_DIRS:
        for ext in ("*.ts", "*.tsx"):
            for f in d.rglob(ext):
                files.append(f)

    fixed_imports = 0
    fixed_instanceof = 0
    files_touched = 0
    for f in sorted(files):
        src = f.read_text()
        new_src, imp_changed = fix_logger_import(src)
        new_src, inst_count = fix_instanceof(new_src)
        if imp_changed or inst_count > 0:
            f.write_text(new_src)
            files_touched += 1
            if imp_changed:
                fixed_imports += 1
            fixed_instanceof += inst_count

    print(f"Files touched: {files_touched}")
    print(f"Logger imports extended with logError: {fixed_imports}")
    print(f"instanceof patterns simplified: {fixed_instanceof}")


if __name__ == "__main__":
    main()
