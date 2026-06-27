#!/usr/bin/env bash
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"
cd "$HERE"

echo "==> bundle (fastify inlined, CJS)"
bun build src/server.js --target node --format cjs --outfile sea-bundle.cjs

echo "==> sea config + blob"
cat > sea-config.json <<EOF
{
  "main": "sea-bundle.cjs",
  "output": "sea-prep.blob",
  "assets": {
    "sample.jpg": "$ROOT/assets/sample.jpg",
    "content.json": "$ROOT/assets/content.json"
  }
}
EOF
node --experimental-sea-config sea-config.json

echo "==> assemble standalone binary"
cp "$(command -v node)" node-server
codesign --remove-signature node-server || true
npx --yes postject node-server NODE_SEA_BLOB sea-prep.blob \
  --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 \
  --macho-segment-name NODE_SEA
codesign --sign - node-server || true
rm -f sea-bundle.cjs sea-prep.blob sea-config.json
echo "built $HERE/node-server"
