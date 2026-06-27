# Web Server Comparison

The same HTTP server, eleven ways across eight languages. Each listens on
`127.0.0.1:8080` and replies `Hello from <language>!` to every request.
Each one is hardened past the textbook example: concurrent request
handling, a full request read (not a single `read()`), per-connection
read/write timeouts, structured logging, and **graceful shutdown** on
`SIGINT`/`SIGTERM`.

Where a language has a production HTTP stack it is used; otherwise the
server is built on the standard library and hardened by hand (Jai). Two
languages get a second entry to compare stacks: Jai (hand-rolled vs the
`farzher` library) and the Bun runtime (Elysia vs Hono, alongside
Node/Fastify).

Each server's hand-written source lives under `<lang>/src/`; build configs
(`Cargo.toml`, `build.zig`, `package.json`, …) and vendored libraries stay at
the language-directory root. All of them load the one shared
`assets/sample.jpg`.

## Run each

| Language | Build & run | HTTP stack |
|----------|-------------|------------|
| Rust   | `cd rust && cargo run --release` | [`axum`](https://github.com/tokio-rs/axum) + `tokio` |
| Zig    | `cd zig && zig build run` | [`zap`](https://github.com/zigzap/zap) (facil.io, prefork ×2) |
| Nim    | `nimble install mummy && nim c -r --threads:on --mm:orc nim/src/main.nim` | [`mummy`](https://github.com/guzba/mummy) |
| Node   | `cd node && bun install && bun start` | [`fastify`](https://github.com/fastify/fastify) |
| Elysia | `cd elysia && bun install && bun start` | [`elysia`](https://elysiajs.com/) (Bun) |
| Hono   | `cd hono && bun install && bun start` | [`hono`](https://hono.dev/) (Bun.serve) |
| Python | `cd python && pip install -r requirements.txt && python src/server.py` | [`starlette`](https://www.starlette.io/) + [`uvicorn`](https://www.uvicorn.org/) (one worker/core) |
| Jai    | `jai jai/src/main.jai -output_path /tmp && /tmp/main` | hand-rolled stdlib sockets |
| Jai (lib) | `mkdir -p /tmp/jf && jai jai/src/main_farzher.jai -release -output_path /tmp/jf && /tmp/jf/main_farzher` | [`farzher/Jai-HTTP-Server`](https://github.com/farzher/Jai-HTTP-Server) (kqueue, one loop/core) |
| Odin   | `cd odin && git clone https://github.com/laytan/odin-http && odin run src -o:speed -out:odinserver` | [`odin-http`](https://github.com/laytan/odin-http) (`core:nbio`, one loop/core) |
| C++    | `cd cpp && make run` (fetch the two headers into `vendor/` first) | [`cpp-httplib`](https://github.com/yhirose/cpp-httplib) + [`nlohmann/json`](https://github.com/nlohmann/json) (thread pool) |

Then in another terminal:

- `curl http://127.0.0.1:8080` — the `Hello from <language>!` text response.
- `curl -X POST http://127.0.0.1:8080/validate -H 'content-type: application/json'
  -d '{"username":"ada_lovelace","email":"ada@example.com","age":36,"password":"Secret123","website":"https://ada.dev","country":"US","tags":["math"],"items":[{"sku":"ABC-123","qty":2,"price":9.99}]}'`
  — heavy nested request validation; returns `{"valid":true}` (200) or `{"valid":false}` (400).
- `curl http://127.0.0.1:8080/pdf -o out.pdf` — a ~101-page PDF (a cover page
  with an embedded JPEG + 100 pages of text paginated from `assets/content.json`)
  **built from scratch on every request**. Every server parses the JSON once at
  startup, then hand-assembles the same multi-page PDF bytes (≈200 objects,
  xref, `DCTDecode` image) with no PDF library, so it doubles as a heavy
  CPU-bound workload benchmark.

Press `Ctrl+C` (or `kill -TERM <pid>`) to watch each one shut down cleanly.

Set `RUST_LOG=debug` for the Rust server to see per-request tracing.

## Benchmark results

Measured with [`wrk`](https://github.com/wg/wrk) on macOS (Apple Silicon,
10 cores), localhost. **Each server was run on its own with a 30s gap
between runs** so the kernel's `TIME_WAIT` ports fully drain — without that
gap the connection-churn numbers are dominated by ephemeral-port
exhaustion, not the server (see caveats). Two workloads: 200 keep-alive
connections for 15s, and 100 fresh connections per request
(`Connection: close`) for 12s. These are **relative** numbers on one
machine — not absolute capacity.

| Language | Stack | Keep-alive req/s | Conn-churn req/s | Graceful shutdown |
|----------|-------|-----------------:|-----------------:|:-----------------:|
| Jai (lib) | farzher (kqueue, 1 loop/core) | **171,000** |    n/a | clean |
| Rust   | axum + tokio                  |     162,000 |     24,300 | clean |
| Zig    | zap (prefork ×2)              |     160,000 |     21,700 | clean |
| Odin   | odin-http (nbio, 1 loop/core) |     155,000 |     20,600 | clean |
| Hono   | Bun.serve                     |     105,000 | **26,400** | clean |
| Elysia | Bun.serve                     |     104,000 |     25,200 | clean |
| Nim    | mummy                         |      89,900 |      6,500 | clean |
| Python | Starlette + uvicorn (10 wkrs) |      77,900 |     24,100 | clean |
| C++    | cpp-httplib (thread pool)     |      74,300 |     25,700 | clean |
| Node   | Fastify                       |      62,600 |      9,200 | clean |
| Jai    | hand-rolled sockets           |      20,100 |       280 | clean |

Takeaways:

- **Jai (lib)** posts the highest keep-alive number of the whole set (~171k)
  — a tight kqueue reactor (one event loop per core, `TCP_NODELAY`, no
  per-request logging or allocation beyond the response). But it only does
  keep-alive: it ignores `Connection: close` and never closes the socket, so
  there's no honest churn figure. Great at the one thing it does.
- **Rust/axum** is the most well-rounded *compiled* stack — near-top on both
  keep-alive and churn, with an orderly connection close that leaves `wrk`
  reporting zero socket errors. Unlike Jai (lib) it actually closes
  connections when asked.
- **Zig/zap** is a hair behind Rust on keep-alive. Running two prefork
  worker processes (`workers = 2`) buys ~+38% connection-churn throughput
  for ~−7% keep-alive versus a single process — each worker `accept`s
  independently, which is what churn is bound by.
- **Odin/odin-http** runs with the leaders on raw throughput — keep-alive
  ~155k, churn ~21k — for the same reason as Zig prefork and Python: one
  `nbio` event loop per core, each `accept`ing independently. Pure-Odin
  stack, no C server underneath.
- **Elysia & Hono (Bun)** are the surprise: ~105k keep-alive (well above
  Node/Fastify's 63k — same language, different runtime) and the *highest
  churn of the set*, ~25–26k. Bun is a single reactor, yet its `accept` path
  is fast enough to top the multi-process stacks at churn. The two frameworks
  are within noise of each other — both are thin layers over the same
  `Bun.serve`, so this really measures Bun, not Elysia vs Hono.
- **Connection churn rewards a fast `accept` path** — usually via independent
  ones. The multi-process / multi-loop stacks (Rust, Zig prefork, Odin,
  Python's 10 workers) all clear ~20–24k; Bun matches them with one reactor by
  making `accept` cheap. The other single-reactor stacks (Nim, Node) sit lower
  even though their keep-alive numbers are healthy.
- **Python** went from the floor to genuinely competitive by running one
  uvicorn worker per core (`workers=os.cpu_count()`): keep-alive 13k → 78k
  and churn 0.9k → 24k versus a single worker. The GIL makes per-process
  scaling the only real lever.
- **Nim/mummy** is solid mid-pack — great keep-alive, moderate churn.
  **Node/Fastify** trails the two Bun stacks at ~63k keep-alive: same JS, but
  Node's HTTP server plus Fastify's per-request overhead cost it versus Bun.
- **Jai** is the hand-rolled outlier. It has no keep-alive (it sends
  `Connection: close` on every response, so even the keep-alive column is
  really churn for it), and its fixed 8-worker mutex-queue collapses under
  fresh-connection load — ~280 req/s. Adding `TCP_NODELAY` helped latency
  but not churn, confirming the bottleneck is the single accept loop +
  queue handoff, not Nagle. Good for learning raw sockets; not production.

> The `read N` socket errors `wrk` reports at the end of the churn test
> (where `N` == connection count) are an artifact of the server closing
> each connection as `wrk` finishes — the requests themselves succeeded.

## PDF workload — concurrency & latency

The `/pdf` route is now a genuinely heavy, CPU-bound task: every request
hand-assembles a **~101-page PDF** — a cover page (heading + the 240×160
`DCTDecode` JPEG) plus 100 pages of text paginated from `assets/content.json`
(4500 lines), ≈400 KB out. No PDF library in any language: each server parses
the JSON once at startup, then builds the same multi-page byte layout (≈200
objects, an xref table, per-page content streams) by hand on every request.
So this measures raw allocation + byte-shuffling throughput, not the HTTP
stack. Keep-alive, `wrk -t4`, 8s per level. Throughput is **PDFs built and
served per second**; latency is per request.

| Language | @50 conc | p99 | @200 conc | p99 | @400 conc | p99 |
|----------|---------:|----:|----------:|----:|----------:|----:|
| Nim    | 11.8k | 6.1ms | 10.7k | 24ms  | **10.5k** | 388ms |
| Rust   |  6.3k | 14ms  |  6.1k | 80ms  |   6.0k | **164ms** |
| C++    |  6.8k | 568ms |  6.8k | 1.5s  |     — | —     |
| Zig    |  4.7k | 25ms  |  4.7k | 127ms |   4.7k | 667ms |
| Odin   |  7.0k | 25ms  |  3.0k | 161ms |   2.6k | 538ms |
| Node   |  1.9k | 254ms |  1.8k | 871ms |   1.8k | 544ms |
| Elysia |  1.9k | 250ms |  1.8k | 870ms |   1.8k | 576ms |
| Python |  1.8k | 268ms |  1.8k | 873ms |   1.8k | 554ms |
| Jai (lib) | 1.9k | 244ms | 1.8k | 901ms | 1.8k | 552ms |
| Jai    |  1.8k | 257ms |  1.8k | 895ms |   1.7k | 562ms |
| Hono   |  1.9k | 255ms |  1.8k | 876ms |   1.5k | 620ms |

The 400 KB build dominates everything, so the ordering looks nothing like the
tiny-`Hello` benchmark above. Two tiers emerge: the compiled servers
(Nim, Rust, Zig, Odin) at 2.6–10.5k PDFs/sec, and everyone else — the JS/Bun
runtimes, Python, and both Jai servers — bunched at **~1.8k**, because at that
point the bottleneck is the same hand-rolled byte assembly, not the framework.

Takeaways:

- **Nim/mummy** runs away with throughput here — ~10–12k PDFs/sec, roughly
  double Rust. Its fixed thread pool draining one loop chews through the
  per-request string building cheaply, and it stays flat as concurrency climbs
  (the p99 only blows out at 400).
- **Rust** trades throughput for the *tightest tail under load*: ~6k/sec but a
  p99 of 164ms at 400 concurrent — the lowest of anyone at max load, and far
  flatter than Zig or Nim. tokio's scheduler keeps latency predictable.
- **Zig** holds a dead-flat ~4.7k across all concurrency levels, but its tail
  detonates to 667ms at 400 — the prefork workers each block on a heavy build.
- **C++** has the split personality: compiled-tier *throughput* (~6.8k, flat)
  but the *worst tail of the lot* — p99 568ms at 50, 1.5s at 200. cpp-httplib's
  thread pool is small (≈cores−1) and each thread blocks for the whole 400 KB
  build, so the queue behind those threads is what the tail measures. Raising
  `CPPHTTPLIB_THREAD_POOL_COUNT` would trade memory for a flatter tail.
- **Odin** is the one that *degrades*: 7.0k → 2.6k as load climbs. `odin-http`
  allocates each request into a per-connection growing arena, and a 400 KB
  build on every keep-alive request makes that arena balloon — exactly the
  effect that was a minor tail issue on the 1-page workload, now dominant.
- **The whole interpreted/JS tier collapses together at ~1.8k.** Node, Elysia,
  Hono (all single-event-loop JS) and Python (10 GIL-bound workers) land within
  noise of each other, with p99s of 0.5–0.9s — when one request ties up a core
  for ~0.5ms of pure CPU, a single loop can't hide it. You'd offload the build
  to a worker pool for real use.
- **Both Jai servers** now post real numbers (~1.8k) and sit in that same tier.
  The hand-rolled server's lack of keep-alive no longer sinks it: at ~1.8k
  req/s the connection churn is slow enough not to exhaust ephemeral ports in
  the 8s window, so the PDF build cost is what's measured, same as everyone
  else.

## Validation workload — incoming request validation

`POST /validate` takes a realistic nested JSON body — a user/order payload with
`username`/`email`/`sku` regex patterns, password complexity (upper+lower+digit),
a 10-value country enum, number ranges, and an **array of nested objects** — and
returns `{"valid":true}` (200) or `{"valid":false}` (400). Each server uses its
language's best validation library, or a hand-written validator where none
exists. Keep-alive POST, `wrk -t4`, 8s per level.

| Language | Validator | @50 conc | p99 | @200 conc | p99 |
|----------|-----------|---------:|----:|----------:|----:|
| Jai (lib) | hand-rolled      | **169k** | 0.68ms | **169k** | 1.3ms |
| Rust   | `garde` + serde     | 147k | 0.60ms | 156k | 4.5ms |
| Odin   | hand-rolled         | 137k | 2.9ms  | 151k | 57ms  |
| Zig    | hand-rolled         | 138k | 0.94ms | 144k | 2.1ms |
| Nim    | hand-rolled         |  79k | 0.87ms |  77k | 3.4ms |
| C++    | nlohmann + std::regex |  73k | 52ms |  72k | 197ms |
| Node   | Fastify (AJV)       |  34k | 5.8ms  |  34k | 152ms |
| Hono   | Zod                 |  34k | 5.5ms  |  34k | 144ms |
| Elysia | TypeBox             |  35k | 5.4ms  |  33k | 114ms |
| Python | Pydantic v2         |  34k | 5.4ms  |  33k | 122ms |
| Jai    | hand-rolled         |  25k | 29ms   |  13k | 28ms  |

The body is small (~250 bytes), so parse + validate is cheap and throughput is
HTTP-stack-bound — the ranking mirrors the `Hello` benchmark more than the PDF
one. Takeaways:

- **Jai (lib)** is fastest (~169k, p99 1.3ms): the kqueue reactor plus a fixed,
  hand-rolled parser/validator with no allocator churn. **Rust/garde**,
  **Zig** and **Odin** follow at 144–156k — compiled validation is nearly free.
- **The library choice barely matters within a runtime.** Node (AJV), Hono
  (Zod), Elysia (TypeBox) and Python (Pydantic v2) all land at ~33–34k — four
  different validators, same ceiling. At that point the per-request cost is the
  JS/Python runtime, not the validator; all four libraries are "fast enough"
  that they're not the bottleneck.
- **The hand-written validators (Zig/Odin/Nim/Jai) beat every library here** —
  not because they're cleverer, but because they're compiled and the schema is
  fixed at build time. The library's value is ergonomics and maintainability
  (one declarative schema, good error messages), not throughput.
- **Odin** blows its tail again (57ms at 200) from the per-connection arena;
  **Jai (hand-rolled)** is throttled by its no-keep-alive churn at this higher
  request rate (25k → 13k as concurrency climbs).
- **C++** sits apart: ~72k throughput (2× the JS/Python tier) but a much fatter
  tail (52–197ms) than the other compiled servers. `std::regex` is genuinely
  slow to execute, and the small cpp-httplib thread pool queues requests behind
  it — fast in aggregate, jittery per request.

## How each handles concurrency & shutdown

- **Rust** — `axum` on a multi-threaded `tokio` runtime. Connections are
  async tasks; `tower-http` adds request tracing and a 15s timeout layer.
  `axum::serve(...).with_graceful_shutdown()` drains in-flight requests
  when `Ctrl+C`/`SIGTERM` arrives.
- **Zig** — `zap`, a thin Zig wrapper over the C `facil.io` server. It runs
  two prefork worker processes (`workers = 2`), each with 4 threads over
  facil.io's evented core; the extra process parallelizes `accept` for
  connection churn. facil.io installs its own `SIGINT`/`SIGTERM` handlers
  and drains in-flight work before `zap.start` returns. Needs `zig build`
  (a `build.zig` + `build.zig.zon` pull zap in) rather than `zig run`.
- **Nim** — `mummy` runs a fixed pool of OS threads draining a single
  `kqueue`/`epoll` loop — no `async`/`await`, so a slow handler never
  blocks `accept`. The signal handler calls `server.close()` to unblock
  `serve()`. Built with `--threads:on`.
- **Node** — `fastify` on Node's single-threaded event loop; handlers are
  async. `SIGINT`/`SIGTERM` call `app.close()` to stop accepting and drain
  in-flight requests. Per-request logging is disabled so it doesn't
  dominate latency under load.
- **Elysia** — runs on Bun's native `Bun.serve` (a single fast event loop).
  Routes are `.get`/`.post` chained on the `Elysia` instance; the `/pdf`
  handler returns a `Response` wrapping the raw PDF bytes. `SIGINT`/`SIGTERM`
  call `app.stop()` to drain before exiting.
- **Hono** — a runtime-agnostic router whose `app.fetch` we hand to
  `Bun.serve` directly, so we keep the server handle for `server.stop()` on
  shutdown. Same `.get`/`.post` route shape; `/pdf` uses `c.body(bytes)` with
  an `application/pdf` header. Nearly identical numbers to Elysia because both
  are thin layers over the same Bun server.
- **Python** — a `starlette` ASGI app served by `uvicorn` (with
  `httptools`/`uvloop`). Because a single ASGI worker is GIL-bound, it
  preforks one worker per core (`workers=os.cpu_count()`); uvicorn's
  process manager installs the signal handlers and drains all workers on
  shutdown. Front it with a reverse proxy in production.
- **Jai** — no HTTP framework in the stdlib, so this is raw
  `socket`/`bind`/`listen`/`accept` plus a fixed worker-thread pool
  draining a mutex+condvar queue (bounded, sheds load when saturated).
  Client sockets get `TCP_NODELAY` and read/write timeouts; a short
  `SO_RCVTIMEO` on the listener lets the accept loop poll the shutdown flag
  set by a `sigaction` handler. The server lives in `jai/lib.jai` (reusable
  API: `http_listen` + `http_run`); `jai/main.jai` just configures and runs
  it.
- **Jai (lib)** — the same language via `farzher/Jai-HTTP-Server`, an
  Express-style library (`http_listen` + `get`/`post`/`put`/`delete`). It
  runs one event-loop thread per core (cores/2), each with its own `kqueue`
  and all `accept`ing the shared listen socket — `TCP_NODELAY`, edge-free
  level-triggered reads. The upstream library is Linux (epoll) + Windows
  only; `jai/Jai-HTTP-Server/macos.jai` is a `kqueue` port written for this
  repo (registered via `#if OS == .MACOS` in the library's `module.jai`).
  Workers run under the main thread's context so the library's `tprint`-based
  responder works. It has no graceful-drain hook, so `main_farzher.jai`
  installs a `SIGINT`/`SIGTERM` handler that flips a flag and exits.
- **Odin** — `odin-http`, a pure-Odin HTTP/1.1 stack over `core:nbio`. It
  spins up one non-blocking event loop per core (`thread_count` defaults to
  the core count), each accepting independently, so churn parallelizes the
  way Zig's prefork and Python's workers do. Routing is `router_init` +
  `route_get`/`route_post` (Lua-pattern paths), one handler per method per
  path. `server_shutdown_on_interrupt` installs the `SIGINT`/`SIGTERM`
  handlers and drains in-flight requests on each loop before
  `listen_and_serve` returns.
- **C++** — `cpp-httplib`, a header-only server that runs a fixed thread pool
  (≈cores−1), one connection per pool thread with keep-alive. Routing is
  `svr.Get`/`svr.Post`; `nlohmann/json` parses the `/pdf` content and the
  `/validate` body, with `std::regex` for the field patterns. A `SIGINT`/
  `SIGTERM` handler calls `svr.stop()` to unblock `listen()` and drain. Both
  headers are vendored into `cpp/vendor/` (fetched, gitignored); build with
  `make`. Assets are loaded at startup relative to the executable.

## Caveats

- These are learning servers. None terminates TLS or does routing beyond
  `/`. In real deployments you would still front them with a reverse
  proxy (nginx/Caddy) for TLS, timeouts, and load balancing.
- The benchmark numbers are localhost, one machine. Treat them as orders of
  magnitude and relative ordering, not capacity planning.
- **Connection-churn numbers are fragile on macOS localhost.** Fresh
  connections burn ephemeral ports into `TIME_WAIT`; run the churn test
  back-to-back and throughput falls off a cliff (we saw the same config
  swing from ~22k to ~460 req/s). The table was produced one server at a
  time with a 30s drain between runs. Real churn capacity is higher and the
  prefork gains (Zig, Python) show up more strongly on Linux with
  `SO_REUSEPORT`.
- **Jai** is the weak link for real traffic: no keep-alive and ~280 req/s
  under connection churn. It's closed-beta and its module APIs (`Socket`,
  `POSIX`, `Thread`) vary between compiler builds — verified against the
  build in `~/Dev/jai`.
- **Zig**'s `zap` is `*nix`-only (facil.io). The `zig fetch`-pinned commit
  in `build.zig.zon` targets Zig **0.16.0**.
- **Odin**'s `odin-http` is beta and vendored, not a package-managed dep:
  `git clone` it into `odin/` (gitignored) before building. It's pure Odin
  over `core:nbio` — only the *client* subpackage needs OpenSSL, so the
  server here builds without it. Verified against the `dev-2026-06` nightly.
- **Jai (lib)** is the most patched of the bunch. `farzher/Jai-HTTP-Server`
  targets an old Jai (beta 0.1.090) and has no macOS path, so it's vendored
  *with* fixes under `jai/Jai-HTTP-Server/`: a new `macos.jai` (kqueue), a
  `.MACOS` socket overload in `modules/mysocket`, and a worker-context fix
  for Jai's newer threading (`thread.starting_context` no longer copies
  `print_style`, which broke the library's `tprint` responder). Verified
  against Jai **beta 0.2.009**. Keep-alive only — it ignores `Connection:
  close`. Linux/Windows still build from the upstream files unchanged.
- **C++** vendors two single headers into `cpp/vendor/` (gitignored), fetched
  from [cpp-httplib](https://github.com/yhirose/cpp-httplib) v0.18.3 and
  [nlohmann/json](https://github.com/nlohmann/json) v3.11.3 — re-download them
  before building. `std::regex` is the throughput ceiling on `/validate`, and
  the fixed thread pool gives it the worst `/pdf` tail of the set; both are the
  obvious things to swap (RE2/`ctre`, a bigger or work-stealing pool) for real
  use. Built with `make` against Apple clang 17 (`-std=c++17`).
