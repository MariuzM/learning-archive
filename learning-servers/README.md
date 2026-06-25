# Web Server Comparison

The same HTTP server in four languages. Each listens on
`127.0.0.1:8080` and replies `Hello from <language>!` to every request.
Each one is hardened past the textbook example: concurrent request
handling, a full request read (not a single `read()`), per-connection
read/write timeouts, structured logging, and **graceful shutdown** on
`SIGINT`/`SIGTERM`.

Where a language has a production HTTP stack it is used; otherwise the
server is built on the standard library and hardened by hand.

## Run each

| Language | Build & run | HTTP stack |
|----------|-------------|------------|
| Rust | `cd rust && cargo run --release` | [`axum`](https://github.com/tokio-rs/axum) + `tokio` |
| Zig  | `zig run zig/main.zig` | `std.http` + `std.Io` (0.16) |
| Jai  | `jai jai/main.jai -output_path /tmp && /tmp/main` | hand-rolled stdlib sockets |
| Nim  | `nim c -r nim/main.nim` | `std/asynchttpserver` |

Then in another terminal: `curl http://127.0.0.1:8080`
Press `Ctrl+C` (or `kill -TERM <pid>`) to watch each one shut down cleanly.

Set `RUST_LOG=debug` for the Rust server to see per-request tracing.

## How each handles concurrency & shutdown

- **Rust** — `axum` on a multi-threaded `tokio` runtime. Connections are
  async tasks; `tower-http` adds request tracing and a 15s timeout layer.
  `axum::serve(...).with_graceful_shutdown()` drains in-flight requests
  when `Ctrl+C`/`SIGTERM` arrives.
- **Zig** — `std.net` is gone in 0.16; networking now lives behind the
  new `std.Io` interface (`Io.Threaded`). The accept loop runs as an
  `io.concurrent` task; a thread per connection serves keep-alive
  requests via `std.http.Server`. A signal handler flips an atomic flag
  and main `cancel`s the accept task — the IO's own cancellation path,
  since closing the listener fd panics the runtime on macOS.
- **Jai** — no HTTP framework in the stdlib, so this is raw
  `socket`/`bind`/`listen`/`accept` plus a fixed worker-thread pool
  draining a mutex+condvar queue (bounded, sheds load when saturated).
  A short `SO_RCVTIMEO` on the listener lets the accept loop poll the
  shutdown flag set by a `sigaction` handler.
- **Nim** — `std/asynchttpserver` dispatches each connection on the async
  event loop. `onSignal` flips a flag that the accept loop notices within
  ~200ms. Highest-level of the four.

## Caveats

- These are learning servers. None terminates TLS or does routing beyond
  `/`. In real deployments you would still front them with a reverse
  proxy (nginx/Caddy) for TLS, timeouts, and load balancing — Nim's
  `asynchttpserver` docs say as much explicitly.
- **Zig** stdlib APIs move fast. This targets **0.16** and uses the new
  `std.Io` model; earlier versions used `std.net.Address.listen` and will
  not compile as-is.
- **Jai** is closed-beta; module APIs (`Socket`, `POSIX`, `Thread`) vary
  between compiler builds. Verified against the build in `~/Dev/jai`.
