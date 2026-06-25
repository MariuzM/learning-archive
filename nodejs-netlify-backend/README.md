# Node.js Netlify Backend

Small Express backend plus standalone Netlify serverless functions — testing how
to run an API on Netlify.

**Stack:** Node.js, Express, Netlify

- `src/index.js` — the Express app serving `public/`.
- `netlify.toml` — publish dir, functions dir, and an `/api/*` redirect onto `/.netlify/functions/*`.
- `netlify/functions/hello.js` — query-param greeting.
- `netlify/functions/contact.js` — POST-only form handler with field validation (200 / 422).
- `netlify/functions/ip.js` — reads the caller IP and user-agent from request headers.

Run locally with `netlify dev`; the functions are reachable at `/api/hello`, `/api/contact`, `/api/ip`.

> Archived learning project. Part of [`learning-archive`](../README.md) — kept for reference with its original git history.
