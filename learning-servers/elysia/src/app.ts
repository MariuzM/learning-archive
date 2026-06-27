import { Elysia } from "elysia";

export const HOST = "127.0.0.1";
export const PORT = 8080;

export const app = new Elysia();

export const listen = () => {
  app.listen({ port: PORT, hostname: HOST }, () =>
    console.log(`listening on http://${HOST}:${PORT}`),
  );

  const shutdown = async () => {
    console.log("shutting down");
    await app.stop();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};
