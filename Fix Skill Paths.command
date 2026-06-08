#!/bin/bash
# ─────────────────────────────────────────────────────────────
#  Fix Skill Paths — updates james-design-lead SKILL.md
#  to point at the OneDrive Storybook instead of ~/Documents.
#  Double-click once, then throw this file away.
# ─────────────────────────────────────────────────────────────

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   Fix Skill Paths                        ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "🔍  Searching for james-design-lead SKILL.md..."
echo ""

SKILL_FILES=()
while IFS= read -r line; do
  SKILL_FILES+=("$line")
done < <(find "$HOME/Library/Application Support/Claude" \
    -path "*/james-design-lead/SKILL.md" 2>/dev/null)

if [ ${#SKILL_FILES[@]} -eq 0 ]; then
  echo "❌  No SKILL.md files found."
  echo "    Make sure Claude is installed and the skill has been used at least once."
  echo ""
  read -rp "    Press Enter to close..."
  exit 1
fi

echo "    Found ${#SKILL_FILES[@]} file(s)."
echo ""

PATCHED=0
for SKILL in "${SKILL_FILES[@]}"; do
  echo "    Patching: $SKILL"

  python3 - "$SKILL" <<'PYEOF'
import sys

path = sys.argv[1]
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = [
    (
        '~/Documents/product-team-storybook/',
        '~/Library/CloudStorage/OneDrive-RiskSmart/Product - Product Dream Team/product-team-storybook/'
    ),
    (
        '~/Documents/risksmart-app-main 2/',
        '~/Library/CloudStorage/OneDrive-RiskSmart/Product - Product Dream Team/product-team-storybook/risksmart-app-main 2/'
    ),
    (
        'Documents/risksmart-app-main\\ 2/',
        'Library/CloudStorage/OneDrive-RiskSmart/Product\\ -\\ Product\\ Dream\\ Team/product-team-storybook/risksmart-app-main\\ 2/'
    ),
]

for old, new in replacements:
    content = content.replace(old, new)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("    ✅  Done.")
PYEOF

  # Also copy the patched file to the _package source so new installs get the right paths
  PACKAGE_SKILL="$HOME/Library/CloudStorage/OneDrive-RiskSmart/Product - Product Dream Team/_package/skills/james-design-lead/SKILL.md"
  if [ -f "$PACKAGE_SKILL" ]; then
    cp "$SKILL" "$PACKAGE_SKILL" && echo "    ✅  _package updated too."
  fi

  PATCHED=$((PATCHED + 1))
done

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   ✅  Patched $PATCHED file(s).              ║"
echo "║                                          ║"
echo "║   Restart Claude for the changes         ║"
echo "║   to take effect.                        ║"
echo "╚══════════════════════════════════════════╝"
echo ""
read -rp "    Press Enter to close..."
