# Rust Rocket Server

Web server built with the Rust Rocket framework — prototyping the routing
features while learning the crate.

**Stack:** Rust, Rocket

`cargo run`, then:

- `GET /` — hello world.
- `GET /greet/<name>` — dynamic path segment.
- `GET /add/<a>/<b>` — typed path params (`i64`).
- `GET /files/<path..>` — multi-segment path capture.
- `GET /search?q=&page=` — required and optional query params.
- `GET /count` — managed state with an atomic visit counter.
- a `404` catcher for unmatched routes.

> Archived learning project. Part of [`learning-archive`](../README.md) — kept for reference with its original git history.
