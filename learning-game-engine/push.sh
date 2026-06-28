#!/usr/bin/env bash
set -euo pipefail

if [ $# -eq 0 ]; then
  echo "Usage: ./push.sh <commit message>" >&2
  exit 1
fi

text="$*"
first=$(printf '%s' "${text:0:1}" | tr '[:lower:]' '[:upper:]')
msg="learning-game-engine: ${first}${text:1}"

git add -A
git commit -m "$msg"
git push
