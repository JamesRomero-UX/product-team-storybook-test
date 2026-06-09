#!/bin/bash

# RiskSmart Storybook Installer
# Double-click this file on Mac to install and launch Storybook

set -e

echo ""
echo "========================================"
echo "  RiskSmart Storybook Setup"
echo "========================================"
echo ""

# Get the directory where this script lives
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PARENT_DIR="$(dirname "$SCRIPT_DIR")"

echo "📁 Installing in: $PARENT_DIR"
echo ""

# ── Install Homebrew if missing ──────────────────────────────────────────────
if ! command -v brew &> /dev/null; then
    echo "📦 Installing Homebrew (package manager)..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    # Add Homebrew to PATH for Apple Silicon Macs
    if [ -f "/opt/homebrew/bin/brew" ]; then
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
    echo "✅ Homebrew installed"
    echo ""
fi

# ── Install Git if missing ───────────────────────────────────────────────────
if ! command -v git &> /dev/null; then
    echo "📦 Installing Git..."
    brew install git
    echo "✅ Git installed"
    echo ""
fi

# ── Install Node.js if missing ───────────────────────────────────────────────
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    brew install node
    echo "✅ Node.js installed"
    echo ""
else
    echo "✅ Node.js already installed"
fi

# ── Install pnpm if missing ──────────────────────────────────────────────────
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
    echo "✅ pnpm installed"
    echo ""
else
    echo "✅ pnpm already installed"
fi

echo ""

# ── Clone risksmart-app-test ─────────────────────────────────────────────────
APP_REPO_DIR="$PARENT_DIR/risksmart-app-test"
if [ ! -d "$APP_REPO_DIR" ]; then
    echo "📥 Cloning RiskSmart app repo..."
    git clone https://github.com/JamesRomero-UX/risksmart-app-test.git "$APP_REPO_DIR"
    echo "✅ App repo cloned"
else
    echo "✅ App repo already exists — pulling latest..."
    cd "$APP_REPO_DIR" && git pull
fi
echo ""

# ── Clone product-team-storybook-test ───────────────────────────────────────
SB_REPO_DIR="$PARENT_DIR/product-team-storybook-test"
if [ ! -d "$SB_REPO_DIR" ]; then
    echo "📥 Cloning Storybook repo..."
    git clone https://github.com/JamesRomero-UX/product-team-storybook-test.git "$SB_REPO_DIR"
    echo "✅ Storybook repo cloned"
else
    echo "✅ Storybook repo already exists — pulling latest..."
    cd "$SB_REPO_DIR" && git pull
fi
echo ""

# ── Create .env file ─────────────────────────────────────────────────────────
ENV_FILE="$SB_REPO_DIR/.env"
echo "RS_APP_PATH=$APP_REPO_DIR" > "$ENV_FILE"
echo "✅ Configuration set up"
echo ""

# ── Launch Storybook ─────────────────────────────────────────────────────────
echo "🚀 Starting Storybook..."
echo "   Opening at http://localhost:6007"
echo "   Close this window to stop Storybook"
echo ""
cd "$SB_REPO_DIR"
pnpm storybook
