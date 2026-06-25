# Node TypeScript Setup

Baseline Node.js + TypeScript project configuration, with a few typed scratch
modules to exercise the toolchain.

**Stack:** Node.js, TypeScript

- `src/app.ts` — the original entry point (inquirer + puppeteer experiment).
- `src/utils.ts` — generics practice: a `Result<T, E>` union, `pipe`, `groupBy`,
  `unique`, `range`, and an async `tryCatch`.
- `src/scrape.ts` — a typed puppeteer helper that returns page headings.

`npm run dev` runs with `ts-node-dev`; `npm run build` compiles to `build/`.

> Archived learning project. Part of [`learning-archive`](../README.md) — kept for reference with its original git history.
