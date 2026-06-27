import { Hono } from "hono";

export const HOST = "127.0.0.1";
export const PORT = 8080;

export const app = new Hono();

export const listen = () => {
  const server = Bun.serve({ port: PORT, hostname: HOST, fetch: app.fetch });
  console.log(`listening on http://${HOST}:${PORT}`);

  const shutdown = () => {
    console.log("shutting down");
    server.stop();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};
