import { app, listen } from "./app.js";
import { pdf } from "./pdf.js";
import { validate, validateSchema } from "./validate.js";

app.get("/", async (req, reply) => {
  reply.header("content-type", "text/plain; charset=utf-8");
  return "Hello from Node!\n";
});

app.get("/pdf", pdf);

app.post("/validate", { schema: validateSchema }, validate);

listen();
