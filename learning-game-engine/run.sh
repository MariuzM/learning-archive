#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

usage() {
  cat <<EOF
Usage: ./run.sh <lang>

  jai   build & run the Jai engine
  zig   build & run the Zig engine
  cpp   build & run the C++ engine
EOF
  exit 1
}

[ $# -eq 1 ] || usage

case "$1" in
  jai)
    cd "$ROOT/jai" && jai build.jai && ./build/main
    ;;
  zig)
    cd "$ROOT/zig" && zig build run
    ;;
  cpp)
    cd "$ROOT/cpp" && make run
    ;;
  *)
    echo "Unknown lang: $1" >&2
    usage
    ;;
esac
