import Fastify from "fastify";

export const HOST = "127.0.0.1";
export const PORT = 8080;

export const app = Fastify({ logger: true, disableRequestLogging: true });

export const listen = async () => {
  const shutdown = async () => {
    app.log.info("shutting down");
    await app.close();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  try {
    await app.listen({ port: PORT, host: HOST });
  } catch (e) {
    app.log.error(e);
    process.exit(1);
  }
};
