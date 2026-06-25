# webapp-with-wasm

A tiny web page whose math and device-detection logic runs inside a
**WebAssembly** module compiled from **Zig** (with a bit of **C** linked in).
The page calls exported wasm functions for `add`, `fibonacci`, a `greet`
string-builder, and a device report that pulls browser signals back through JS
imports.

The same program is also ported to **Odin** (`src/main.odin`) and kept side by
side for comparison; the default build uses the Zig version.

## How it works

- `src/main.zig` exports functions callable from JS via the instance's
  `exports`. Strings are written into wasm linear memory at a pointer JS passes
  in, and the byte length is returned so JS knows how much to decode.
- `src/fingerprint.c` is pure C (no libc) compiled into the same wasm module by
  Zig's bundled clang — an FNV-1a hash used by the device report.
- `web/index.html` instantiates `main.wasm` with an import object exposing
  browser signals (`navigator.userAgent`, GPU renderer, cores, screen size, a
  stored per-device UUID, …) that the wasm code reads back.

## Build & run

```sh
zig build            # outputs build/zig/main.wasm (ReleaseSmall by default)
```

Override optimization with `-Doptimize=...`. Serve the `web/` folder (with the
built `main.wasm` alongside `index.html`) over HTTP and open it in a browser —
`WebAssembly.instantiateStreaming` needs a real server, not `file://`.

The Odin port builds standalone:

```sh
odin build src/main.odin -file -target:freestanding_wasm32 \
  -no-entry-point -out:zig-out/bin/main.wasm
```

## Files

- `src/main.zig` — exported wasm functions (Zig).
- `src/fingerprint.c` — FNV-1a hash compiled into the wasm module.
- `src/main.odin` — Odin port of the Zig program.
- `web/index.html` — page that loads and drives the wasm module.
- `build.zig` — build script.
