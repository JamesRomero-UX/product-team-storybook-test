#!/bin/bash
# check-integrations-version.sh
#
# Pre-commit hook to ensure that changes to packages/integrations source files
# are accompanied by a version bump in package.json.
#
# This prevents the scenario where code changes are committed but the artifact
# version is not updated, leading to a mismatch between code and published image.

set -euo pipefail

INTEGRATIONS_DIR="packages/integrations"

# Get list of staged files in the integrations package (excluding package.json, changelog, etc.)
# Using directory paths - git matches recursively by default
# ACMRD = Added, Copied, Modified, Renamed, Deleted
STAGED_SOURCE_FILES=$(git diff --cached --name-only --diff-filter=ACMRD -- \
  "${INTEGRATIONS_DIR}/src/" \
  "${INTEGRATIONS_DIR}/Dockerfile" \
  "${INTEGRATIONS_DIR}/docker-compose.yml" \
  "${INTEGRATIONS_DIR}/tsconfig.json" \
  "${INTEGRATIONS_DIR}/postPack.sh" \
  2>/dev/null || true)

# If no source files are staged, nothing to check
if [[ -z "${STAGED_SOURCE_FILES}" ]]; then
  exit 0
fi

# Check if package.json is also staged
PACKAGE_JSON_STAGED=$(git diff --cached --name-only -- "${INTEGRATIONS_DIR}/package.json" 2>/dev/null || true)

if [[ -z "${PACKAGE_JSON_STAGED}" ]]; then
  echo ""
  echo "INTEGRATIONS VERSION CHECK FAILED"
  echo ""
  echo "You have staged changes to integrations source files but have not updated"
  echo "the version in packages/integrations/package.json."
  echo ""
  echo "Without a version bump, the pipeline will NOT publish a new artifact,"
  echo "causing a mismatch between code in the repo and the published image."
  echo ""
  echo "Please bump the version in packages/integrations/package.json and update"
  echo "the CHANGELOG.md before committing."
  echo ""
  echo "Staged source files:"
  echo "${STAGED_SOURCE_FILES}" | head -10 | sed 's/^/  /'
  if [[ "$(echo "${STAGED_SOURCE_FILES}" | wc -l)" -gt 10 ]]; then
    echo "  ... and more"
  fi
  echo ""
  echo "To bypass this check (not recommended):"
  echo "  git commit --no-verify"
  echo ""
  exit 1
fi

# Check if the version field actually changed (not just formatting)
VERSION_CHANGED=$(git diff --cached -- "${INTEGRATIONS_DIR}/package.json" | grep -E '^\+.*"version"' || true)

if [[ -z "${VERSION_CHANGED}" ]]; then
  echo ""
  echo "INTEGRATIONS VERSION CHECK FAILED"
  echo ""
  echo "packages/integrations/package.json is staged, but the version field has"
  echo "not been changed."
  echo ""
  echo "Please bump the version before committing."
  echo ""
  exit 1
fi

echo "Integrations version check passed"
exit 0
