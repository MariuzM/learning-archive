# Web Server Comparison

The same minimal HTTP server in four languages. Each listens on
`127.0.0.1:8080` and replies `Hello from <language>!` to every request.
All use only standard-library sockets (no frameworks) so the language
itself is what you're comparing.

## Run each

| Language | Build & run |
|----------|-------------|
| Rust | `rustc rust/main.rs -o /tmp/rust_server && /tmp/rust_server` |
| Zig  | `zig run zig/main.zig` |
| Jai  | `jai jai/main.jai -output_path /tmp && /tmp/main` |
| Nim  | `nim c -r nim/main.nim` |

Then in another terminal: `curl http://127.0.0.1:8080`

## Notes

- **Rust**: `TcpListener` from `std::net` gives you a high-level
  blocking loop; manual HTTP string formatting.
- **Zig**: `std.net` exposes a lower-level `Address.listen`. Buffers are
  fixed-size and explicit; errors are values you handle with `catch`.
- **Jai**: closest to raw C — calls `socket`/`bind`/`listen`/`accept`
  directly. Most verbose because there's no socket abstraction in the
  stdlib here.
- **Nim**: highest-level of the four; `newSocket` plus `acceptAddr`
  reads almost like Python.

Zig stdlib APIs move fast between versions — if `Address.listen` doesn't
exist on your version, check the release notes for the current net API.
