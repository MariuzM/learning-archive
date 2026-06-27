# Web Server Comparison

The same small HTTP server, **ten ways across seven languages**. Each listens on
`127.0.0.1:8080`, serves four routes, and is hardened past the textbook example:
concurrent request handling, a full request read, per-connection timeouts,
structured logging, and graceful shutdown on `SIGINT`/`SIGTERM`.

Every server builds to a **single self-contained binary** — every third-party
library and the shared `assets/` are baked in, leaving only macOS system
libraries (`libSystem`, `libc++`, `libz`, `libresolv`) dynamically linked.

## Routes

- `GET /` — `Hello from <language>!`
- `GET` / `POST /hello` — the same path under two verbs.
- `POST /validate` — heavy nested-JSON validation (regex patterns, password
  rules, a country enum, an array of objects); returns `{"valid":true}` (200) or
  `{"valid":false}` (400).
- `GET /pdf` — a ~101-page PDF (cover page + embedded JPEG + 100 pages paginated
  from `assets/content.json`) hand-assembled from scratch on every request with
  no PDF library — a CPU-bound workload.

## Build & run

| Language | Stack | Production build → binary |
|----------|-------|---------------------------|
| Rust   | [`axum`](https://github.com/tokio-rs/axum) + `tokio` | `cd rust && cargo build --release` → `target/release/rust-server` |
| Zig    | [`zap`](https://github.com/zigzap/zap) (facil.io, prefork ×2) | `cd zig && zig build --release=fast` → `zig-out/bin/zigserver` |
| Nim    | [`mummy`](https://github.com/guzba/mummy) | `nimble install mummy && nim c -d:release --threads:on --mm:orc -o:nim/main nim/src/main.nim` |
| Node   | [`fastify`](https://github.com/fastify/fastify) | `cd node && bun install && ./build.sh` → `node-server` |
| Elysia | [`elysia`](https://elysiajs.com/) (Bun) | `cd elysia && bun install && bun build src/server.ts --compile --outfile elysia-server` |
| Hono   | [`hono`](https://hono.dev/) (Bun.serve) | `cd hono && bun install && bun build src/server.ts --compile --outfile hono-server` |
| Jai    | hand-rolled stdlib sockets | `jai jai/src/main.jai -output_path /tmp` → `/tmp/main` |
| Jai (lib) | [`farzher/Jai-HTTP-Server`](https://github.com/farzher/Jai-HTTP-Server) (kqueue) | `jai jai/src/main_farzher.jai -release -output_path /tmp/jf` → `/tmp/jf/main_farzher` |
| Odin   | [`odin-http`](https://github.com/laytan/odin-http) (`core:nbio`) | `cd odin && git clone https://github.com/laytan/odin-http && odin build src -o:speed -out:odinserver` |
| C++    | [`drogon`](https://github.com/drogonframework/drogon) (event loop ×4) | `cd cpp && ./deps.sh && make` → `cpp/server` |

The native compilers static-link their dependencies by default. **C++/Drogon** is
the exception — Homebrew ships Drogon as shared libs only, so `cpp/deps.sh`
fetches and statically builds Drogon + Trantor + jsoncpp into `cpp/.deps/` once.
The **JS servers** embed the whole runtime: Bun's `--compile` for Elysia/Hono,
Node's [single-executable application](https://nodejs.org/api/single-executable-applications.html)
(`node/build.sh`) for Node. For quick iteration, run from source instead
(`cargo run --release`, `zig build run`, `bun start`, `./server`, …).

## Results

One server at a time, [`wrk`](https://github.com/wg/wrk) on macOS (Apple Silicon,
10 cores), localhost, with a 30s drain between runs. **Hello** = 200 keep-alive
connections / 15s. **Churn** = 100 fresh connections (`Connection: close`) / 12s.
**PDF** and **Validate** = 50 keep-alive connections / 8s (throughput · p99).
**RAM** = resident set, idle after startup → peak under the Hello load, summed
across the process tree. These are relative numbers on one machine.

| Language | Binary | RAM idle→peak | Hello | Churn | PDF (p99) | Validate (p99) |
|----------|-------:|--------------:|------:|------:|----------:|---------------:|
| Jai (lib) | 0.6 MB | 2.3→397 MB | **162k** |     — | 3.1k (29ms) | **172k** (0.6ms) |
| Zig    | 1.1 MB |   75→80 MB | 162k | 18k | **16k** (5.5ms) | 152k (0.4ms) |
| C++    | 7.6 MB |  7.6→9.4 MB | 161k | 18k | 4.3k (21ms) | 166k (0.5ms) |
| Rust   | 2.2 MB |   2.5→14 MB | 157k | 20k | 6.1k (18ms) | 151k (0.6ms) |
| Odin   | 0.8 MB |    7→11 MB | 153k | 21k | 5.1k (37ms) | 140k (1.5ms) |
| Elysia |  59 MB |   36→46 MB | 110k | **30k** | 2.5k (37ms) | 63k (1.5ms) |
| Hono   |  59 MB |   39→55 MB | 101k | 30k | 2.6k (36ms) | 55k (1.7ms) |
| Nim    | 0.7 MB |   17→20 MB | 85k | 5.8k | 11k (6.3ms) | 81k (0.9ms) |
| Node   | 113 MB |  68→118 MB | 69k | 8.3k | 1.9k (272ms) | 40k (5.4ms) |
| Jai    | 1.5 MB |  2.0→2.0 MB | 13k | 0.8k | 3.7k (16ms) | 29k (68ms) |

Takeaways:

- **Keep-alive throughput tops out around ~160k** for the compiled event-loop
  stacks — Jai (lib), Zig, C++/Drogon, Rust and Odin all land within ~6% of each
  other. **C++/Drogon and Jai (lib)** also lead `/validate` at ~166–172k.
- **Zig runs away with the CPU-bound `/pdf`** (~16k/s) — its `ReleaseFast` build
  does the byte assembly with bounds checks off; **Nim** is next at ~11k. The
  JS/Bun tier bunches at ~2–4k, where the bottleneck is the same hand-rolled PDF
  build, not the framework.
- **Bun (Elysia/Hono) owns connection churn** (~30k) — a fast `accept` path on a
  single reactor, and ~50% more keep-alive throughput than **Node/Fastify** on
  the same language.
- **Size and memory split cleanly.** Native binaries are 0.6–7.6 MB and run in
  single-digit MB (C++/Drogon: 7.6 MB binary, 7.6 MB idle); the JS binaries are
  59–113 MB because they embed a JS engine. **Jai (lib)** balloons to ~400 MB
  under load — it allocates per request via a `tprint`-style buffer.
- **Jai (hand-rolled)** is the learning outlier: no keep-alive, so it sheds load
  under churn (~0.8k) and stays pinned at 2 MB rather than buffering it.

## Caveats

- These are learning servers — no TLS, no routing beyond the four paths. Front
  them with a reverse proxy (nginx/Caddy) for real use.
- Connection-churn numbers are fragile on macOS localhost: fresh connections
  burn ephemeral ports into `TIME_WAIT`, so treat churn as relative ordering.
  The prefork/Bun gains show up more strongly on Linux with `SO_REUSEPORT`.
- **Odin**'s `/pdf` returns the PDF bytes with a 404 status (a routing quirk),
  and **Elysia** answers an invalid `/validate` body with 422 instead of 400 —
  neither changes the work being measured.
- **Jai** is closed-beta; its module APIs vary between compiler builds (verified
  against the local `~/Dev/jai`). The `farzher` library is vendored with a macOS
  kqueue port under `jai/Jai-HTTP-Server/`.
