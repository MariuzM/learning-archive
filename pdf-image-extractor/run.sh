#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PDF="$ROOT/assets/pdf.pdf"

clean() {
	rm -rf \
		"$ROOT/rust/target" \
		"$ROOT/zig/.zig-cache" "$ROOT/zig/zig-cache" "$ROOT/zig/zig-out" "$ROOT/zig/main" "$ROOT/zig/main.o" \
		"$ROOT/odin/pdf-image-counter" \
		"$ROOT/c/pdf-image-counter" \
		"$ROOT/jai/.build" "$ROOT/jai/main" "$ROOT/jai/main.dSYM"
	echo "Removed build artifacts."
}

if [[ "${1:-}" == "clean" ]]; then
	clean
	exit 0
fi

run_lang() {
	name="$1"
	shift
	printf "%-6s " "$name"
	if out=$("$@" 2>&1); then
		uniq=$(printf '%s' "$out" | grep -oE '[0-9]+ unique images' | grep -oE '^[0-9]+' || true)
		uses=$(printf '%s' "$out" | grep -oE '[0-9]+ image placements' | grep -oE '^[0-9]+' || true)
		echo "${uniq:-?} images, ${uses:-?} placements (incl. reuse)"
	else
		echo "FAILED: $out"
	fi
}

trap clean EXIT

echo "Counting images in $PDF"
echo "------------------------------------------"

# Rust
(cd "$ROOT/rust" && cargo build --release -q)
run_lang "rust" "$ROOT/rust/target/release/pdf-image-counter" "$PDF"

# Zig
(cd "$ROOT/zig" && zig build-exe main.zig -O ReleaseFast)
run_lang "zig" "$ROOT/zig/main" "$PDF"

# Odin
(cd "$ROOT/odin" && odin build . -out:pdf-image-counter -o:speed)
run_lang "odin" "$ROOT/odin/pdf-image-counter" "$PDF"

# C
(cd "$ROOT/c" && cc -O2 main.c -lz -o pdf-image-counter)
run_lang "c" "$ROOT/c/pdf-image-counter" "$PDF"

# Jai
(cd "$ROOT/jai" && jai main.jai >/dev/null 2>&1)
run_lang "jai" "$ROOT/jai/main" "$PDF"
