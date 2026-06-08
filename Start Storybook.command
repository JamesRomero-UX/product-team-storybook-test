#!/bin/bash
# ─────────────────────────────────────────────────────────────
#  Product Team Storybook — Start
#  Double-click this file in Finder to open Storybook.
# ─────────────────────────────────────────────────────────────

STORYBOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$STORYBOOK_DIR"

clear
echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   Product Team Storybook — Starting...   ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Check setup has been run
if [ ! -f "$STORYBOOK_DIR/.env" ] || [ ! -d "$STORYBOOK_DIR/node_modules" ]; then
  echo "⚠️  Storybook hasn't been set up yet."
  echo ""
  echo "    Please double-click 'Setup Storybook.command' first,"
  echo "    then come back to this one."
  echo ""
  read -rp "    Press Enter to close..."
  exit 1
fi

echo "🚀  Starting Storybook..."
echo "    Opening http://localhost:6007 in your browser."
echo ""
echo "    Keep this window open while you work."
echo "    Close it (or press Ctrl+C) to stop Storybook."
echo ""

sleep 2
open "http://localhost:6007" &
pnpm storybook
