# Web Server Comparison

The same HTTP server in six languages. Each listens on
`127.0.0.1:8080` and replies `Hello from <language>!` to every request.
Each one is hardened past the textbook example: concurrent request
handling, a full request read (not a single `read()`), per-connection
read/write timeouts, structured logging, and **graceful shutdown** on
`SIGINT`/`SIGTERM`.

Where a language has a production HTTP stack it is used; otherwise the
server is built on the standard library and hardened by hand (Jai).

## Run each

| Language | Build & run | HTTP stack |
|----------|-------------|------------|
| Rust   | `cd rust && cargo run --release` | [`axum`](https://github.com/tokio-rs/axum) + `tokio` |
| Zig    | `cd zig && zig build run` | [`zap`](https://github.com/zigzap/zap) (facil.io, prefork ×2) |
| Nim    | `nimble install mummy && nim c -r --threads:on --mm:orc nim/main.nim` | [`mummy`](https://github.com/guzba/mummy) |
| Node   | `cd node && bun install && node server.js` | [`fastify`](https://github.com/fastify/fastify) |
| Python | `cd python && pip install -r requirements.txt && python server.py` | [`starlette`](https://www.starlette.io/) + [`uvicorn`](https://www.uvicorn.org/) (one worker/core) |
| Jai    | `jai jai/main.jai -output_path /tmp && /tmp/main` | hand-rolled stdlib sockets |

Then in another terminal:

- `curl http://127.0.0.1:8080` — the `Hello from <language>!` text response.
- `curl http://127.0.0.1:8080/pdf -o out.pdf` — a one-page PDF (heading text
  + an embedded JPEG) **built from scratch on every request**. Every server
  hand-assembles the same PDF bytes (objects, xref, `DCTDecode` image) with
  no PDF library, so it doubles as a CPU-bound workload benchmark.

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
| Rust   | axum + tokio                  | **162,000** | **24,300** | clean |
| Zig    | zap (prefork ×2)              |     160,000 |     21,700 | clean |
| Nim    | mummy                         |      89,900 |      6,500 | clean |
| Python | Starlette + uvicorn (10 wkrs) |      77,900 |     24,100 | clean |
| Node   | Fastify                       |      62,600 |      9,200 | clean |
| Jai    | hand-rolled sockets           |      20,100\* |       280 | clean |

Takeaways:

- **Rust/axum** is the most well-rounded — top keep-alive *and* top churn,
  with an orderly connection close that leaves `wrk` reporting zero socket
  errors.
- **Zig/zap** is a hair behind Rust on keep-alive. Running two prefork
  worker processes (`workers = 2`) buys ~+38% connection-churn throughput
  for ~−7% keep-alive versus a single process — each worker `accept`s
  independently, which is what churn is bound by.
- **Connection churn rewards independent `accept` paths.** The three
  multi-process / task-per-connection stacks (Rust, Zig prefork, Python's
  10 workers) all clear ~21–24k; the single-reactor stacks (Nim, Node) sit
  lower even though their keep-alive numbers are healthy.
- **Python** went from the floor to genuinely competitive by running one
  uvicorn worker per core (`workers=os.cpu_count()`): keep-alive 13k → 78k
  and churn 0.9k → 24k versus a single worker. The GIL makes per-process
  scaling the only real lever.
- **Nim/mummy** and **Node/Fastify** are solid mid-pack — great keep-alive,
  moderate churn.
- **Jai** is the hand-rolled outlier. It has no keep-alive (it sends
  `Connection: close` on every response, so even the keep-alive column is
  really churn for it), and its fixed 8-worker mutex-queue collapses under
  fresh-connection load — ~280 req/s. Adding `TCP_NODELAY` helped latency
  but not churn, confirming the bottleneck is the single accept loop +
  queue handoff, not Nagle. Good for learning raw sockets; not production.

\* Jai closes every connection, so its keep-alive figure is connection
churn in disguise.

> The `read N` socket errors `wrk` reports at the end of the churn test
> (where `N` == connection count) are an artifact of the server closing
> each connection as `wrk` finishes — the requests themselves succeeded.

## PDF workload — concurrency & latency

The `/pdf` route is a heavier, CPU-bound task: every request hand-assembles
a one-page PDF (heading text + a 240×160 JPEG embedded via `DCTDecode`,
≈9.5 KB out). No PDF library in any language — the same byte layout built by
hand, so it measures each runtime's allocation + byte-shuffling speed plus
how its concurrency model holds up. Keep-alive, `wrk -t4`, 8s per level.
Throughput is **PDFs built and served per second**; latency is per request.

| Language | @50 conc | p99 | @200 conc | p99 | @400 conc | p99 |
|----------|---------:|----:|----------:|----:|----------:|----:|
| Zig    | 153k | 0.45ms | 159k | 1.6ms | 161k | **3.0ms** |
| Rust   | 143k | 0.60ms | 152k | 2.3ms | 155k | 4.6ms |
| Nim    |  80k | 0.78ms |  78k | 3.3ms |  78k | 6.8ms |
| Python |  64k | 13ms   |  69k | 36ms  |  70k | 37ms |
| Node   |  43k | 2.2ms  |  41k | 75ms  |  38k | **521ms** |
| Jai\*\* |  23k | 28ms   |   — |  —    |   — |  —   |

So at **400 concurrent users**, Zig and Rust each build ~155–160k PDFs/sec
with a p99 under 5ms; Nim sustains ~78k under 7ms; Python ~70k but with a
fatter tail; Node's throughput holds around 40k but its p99 blows out to
half a second.

Takeaways:

- **Zig and Rust** are in a class of their own here — highest throughput,
  and a p99 that barely moves as concurrency climbs. The compiled,
  multi-threaded reactors absorb the per-request allocation cheaply.
- **Nim/mummy** is the steady mid-tier: flat ~78k regardless of load with a
  tight tail.
- **Python** scales throughput well across its 10 workers but carries a
  consistently higher tail (GIL + cross-process scheduling); fine when you
  care about throughput, less so for p99-sensitive work.
- **Node** is the cautionary tale: a single event loop doing CPU-bound
  buffer assembly plus GC means tail latency **detonates** under load (p99
  521ms at 400 concurrent) even though median stays reasonable. You'd move
  the PDF build to a `worker_threads` pool or `cluster` for real use.
- **Jai** can't play this game: with no keep-alive, `/pdf` is pure
  connection churn, so past ~50 concurrent it falls off the same TIME_WAIT
  cliff as the hello benchmark (~220 req/s at 400). Its one honest number is
  ~23k PDFs/sec at 50 concurrent.

\*\* Jai has no keep-alive, so beyond ~50 concurrent connections it collapses
to a few hundred req/s (connection churn, not PDF cost). Numbers omitted.

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
