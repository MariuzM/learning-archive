#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

usage() {
  cat <<EOF
Usage: ./run.sh <lang>

  jai    build & run the Jai engine
  cpp    build & run the C++ engine
  rust   build & run the Rust engine
EOF
  exit 1
}

[ $# -eq 1 ] || usage

case "$1" in
  jai)
    cd "$ROOT/jai" && jai build.jai && ./build/main
    ;;
  cpp)
    cd "$ROOT/cpp"
    cmake -B build
    cmake --build build
    ./build/game
    ;;
  rust)
    cd "$ROOT/rust"
    cargo build --release
    ./target/release/game
    ;;
  *)
    echo "Unknown lang: $1" >&2
    usage
    ;;
esac
