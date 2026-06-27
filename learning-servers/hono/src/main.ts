import { zValidator } from "@hono/zod-validator";
import { app, listen } from "./app";
import { pdf } from "./pdf";
import { validate, validateBody } from "./validate";

app.get("/", (c) => c.text("Hello from Hono!\n"));
app.get("/hello", (c) => c.text("GET hello from Hono!\n"));
app.post("/hello", (c) => c.text("POST hello from Hono!\n"));
app.get("/pdf", pdf);
app.post("/validate", zValidator("json", validateBody), validate);

listen();
