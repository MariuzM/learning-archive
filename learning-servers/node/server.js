import Fastify from "fastify";

// Log lifecycle events but not every request — per-request logging dominates
// latency under load and the other servers here stay quiet too.
const app = Fastify({ logger: true, disableRequestLogging: true });

app.get("/", async (req, reply) => {
  reply.header("content-type", "text/plain; charset=utf-8");
  return "Hello from Node!\n";
});

// Drain in-flight requests before exiting on Ctrl+C / SIGTERM.
const shutdown = async () => {
  app.log.info("shutting down");
  await app.close();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

try {
  await app.listen({ port: 8080, host: "127.0.0.1" });
} catch (e) {
  app.log.error(e);
  process.exit(1);
}
