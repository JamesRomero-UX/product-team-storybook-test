#!/bin/bash
set -e

VERSION=$(jq -r '.version' package.json)
TARBALL="n8n-nodes-risksmart-${VERSION}.tgz"

rm -rf dist2
mkdir dist2
tar -xvzf "$TARBALL" -C dist2
rm -rf dist
jq 'del(.devDependencies)' "dist2/package/package.json" > "dist2/package/package.json.tmp"
mv "dist2/package/package.json.tmp" "dist2/package/package.json"
cp dist2/package/package.json dist2/package/dist/package.json
cp -R dist2/package/dist dist
rm -rf dist2
rm "$TARBALL"
