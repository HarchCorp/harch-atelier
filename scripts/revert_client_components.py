#!/usr/bin/env python3
"""
Revert migration changes to client components (those with "use client"
directive). The structured logger (@/lib/logger) imports Prisma and
can't run in the browser bundle.

This script:
1. For each modified .tsx file in src/components or src/app/atelier
   that starts with "use client" or 'use client':
   - Removes the `import { ... } from "@/lib/logger";` line
   - Replaces `logInfo("cat", "msg")` back to `console.log("msg")`
   - Replaces `logError("cat", "msg")` back to `console.error("msg")`
   - Replaces `logWarn("cat", "msg")` back to `console.warn("msg")`
   - Replaces `logInfo("cat", \`msg: ${var}\`)` back to `console.log("msg", var)`
   - etc.

Actually — the simplest approach is `git checkout` for files we
should never have touched. We then re-run the migration script with
a "use client" filter.
"""

from __future__ import annotations
import subprocess
from pathlib import Path

ROOT = Path("/home/z/my-project")
TARGET_DIRS = [
    ROOT / "src/components",
    ROOT / "src/app/atelier",
]


def is_client_component(path: Path) -> bool:
    """Check if the file's first non-empty line is a 'use client' directive."""
    try:
        with path.open() as f:
            for line in f:
                stripped = line.strip()
                if not stripped:
                    continue
                # Allow optional semicolon and surrounding quotes
                return stripped.rstrip(";") in ('"use client"', "'use client'")
    except (OSError, UnicodeDecodeError):
        return False
    return False


def main():
    reverted = []
    for d in TARGET_DIRS:
        for ext in ("*.ts", "*.tsx"):
            for f in d.rglob(ext):
                if is_client_component(f):
                    # git checkout this file
                    rel = f.relative_to(ROOT)
                    result = subprocess.run(
                        ["git", "checkout", "--", str(rel)],
                        cwd=ROOT,
                        capture_output=True,
                        text=True,
                    )
                    if result.returncode == 0:
                        reverted.append(str(rel))
                    else:
                        print(f"FAILED to revert {rel}: {result.stderr}")
    print(f"Reverted {len(reverted)} client component files:")
    for r in reverted:
        print(f"  {r}")


if __name__ == "__main__":
    main()
