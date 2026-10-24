#!/bin/bash
# Builds the playable game into docs/ (served as-is, e.g. by GitHub Pages).
set -e
cd "$(dirname "$0")"
npx esbuild src/js/main.js --bundle --format=esm --external:three --external:'three/addons/*' --loader:.json=json --outfile=docs/main.js --log-level=warning
npx esbuild src/js/tileworker.js --bundle --format=iife --minify --loader:.json=json --outfile=docs/tileworker.js --log-level=warning
cp src/atlas.png src/thumbs.png docs/
sed -e 's#__THREE__#https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js#' -e 's#__ADDONS__#https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/#' src/index.html > docs/index.html
echo "built docs/"
