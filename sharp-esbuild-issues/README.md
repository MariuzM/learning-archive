# Sharp + esbuild Issues

Repro of bundling `sharp` with esbuild. `sharp` ships prebuilt native `.node`
binaries that esbuild can't inline, so bundling it directly breaks at runtime —
the fix is to mark it `external` and let Node resolve it from `node_modules`.

**Stack:** Node.js, sharp, esbuild, Fastify, TypeScript

- `src/images.ts` — sharp experiments: `resize`, `toWebp`, `grayscale`,
  `thumbnail`, `metadata`, `watermark` (composite), and a generated `gradient`.
- `src/app.ts` — Fastify server exposing those as routes.
- `esbuild.config.mjs` — bundles the app to `build/app.cjs` with
  `external: ['sharp']` (the workaround for the bundling issue).

`npm run dev` runs the server with tsx; `npm run bundle` produces the esbuild bundle.

> Archived learning project. Part of [`learning-archive`](../README.md) — kept for reference with its original git history.
