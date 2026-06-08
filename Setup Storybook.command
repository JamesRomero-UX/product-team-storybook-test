#!/bin/bash
# ─────────────────────────────────────────────────────────────
#  Product Team Storybook — Installer
#  Double-click this file in Finder to set up Storybook.
# ─────────────────────────────────────────────────────────────

# Always run from the folder this script lives in
STORYBOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$STORYBOOK_DIR"

clear
echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   Product Team Storybook — Setup         ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── Step 1: Check Node.js ────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo "❌  Node.js is not installed."
  echo ""
  echo "    Please install it from: https://nodejs.org"
  echo "    Then double-click this file again."
  echo ""
  read -rp "    Press Enter to close..."
  exit 1
fi
echo "✅  Node.js $(node -v) found."

# ── Step 2: Check pnpm ───────────────────────────────────────
if ! command -v pnpm &>/dev/null; then
  echo ""
  echo "⚙️   pnpm not found — installing it now..."
  npm install -g pnpm
  if ! command -v pnpm &>/dev/null; then
    echo ""
    echo "❌  Could not install pnpm automatically."
    echo "    Please open Terminal and run:  npm install -g pnpm"
    echo "    Then double-click this file again."
    echo ""
    read -rp "    Press Enter to close..."
    exit 1
  fi
fi
echo "✅  pnpm $(pnpm -v) found."
echo ""

# ── Step 3: Set the dev repo path ───────────────────────────
APP_PATH="$STORYBOOK_DIR/risksmart-app-main 2"

if [ ! -d "$APP_PATH" ]; then
  echo "❌  The risksmart-app repo wasn't found inside this folder."
  echo "    Expected: $APP_PATH"
  echo ""
  echo "    Make sure the 'risksmart-app-main 2' folder is"
  echo "    inside the same folder as this installer."
  echo ""
  read -rp "    Press Enter to close..."
  exit 1
fi

echo "✅  Dev repo found (bundled in this folder)."

# Write .env
echo "RS_APP_PATH=$APP_PATH" > "$STORYBOOK_DIR/.env"

echo ""

# ── Step 4: Install dependencies ────────────────────────────
echo "📦  Installing dependencies..."
echo "    (This usually takes 1–3 minutes the first time)"
echo ""

if pnpm install; then
  echo ""
  echo "╔══════════════════════════════════════════╗"
  echo "║   ✅  Setup complete!                    ║"
  echo "║                                          ║"
  echo "║   To start Storybook, run:               ║"
  echo "║   pnpm storybook                         ║"
  echo "║                                          ║"
  echo "║   Then open: http://localhost:6007       ║"
  echo "╚══════════════════════════════════════════╝"
  echo ""
  read -rp "    Start Storybook now? (y/n): " START
  if [[ "$START" =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀  Starting Storybook — opening http://localhost:6007 ..."
    echo "    (Close this window to stop it)"
    echo ""
    sleep 1
    open "http://localhost:6007" &
    pnpm storybook
  fi
else
  echo ""
  echo "❌  Installation failed."
  echo "    Please share this window (screenshot or copy-paste) with James."
  echo ""
  read -rp "    Press Enter to close..."
  exit 1
fi
