#!/usr/bin/env bash
set -euo pipefail

if [ $# -eq 0 ]; then
  echo "Usage: ./push.sh <commit message>" >&2
  exit 1
fi

msg="learning-servers: $*"

git add -A
git commit -m "$msg"
git push
