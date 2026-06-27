import { app, listen } from "./app";
import { pdf } from "./pdf";
import { validate, validateBody } from "./validate";

const TEXT = { "content-type": "text/plain; charset=utf-8" };

app.get("/", () => new Response("Hello from Elysia!\n", { headers: TEXT }));
app.get("/hello", () => new Response("GET hello from Elysia!\n", { headers: TEXT }));
app.post("/hello", () => new Response("POST hello from Elysia!\n", { headers: TEXT }));
app.get("/pdf", pdf);
app.post("/validate", validate, { body: validateBody });

listen();
