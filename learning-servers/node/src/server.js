import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { isSea, getRawAsset } from "node:sea";
import Fastify from "fastify";

// Read the shared assets once at startup; per-request work is assembling the PDF.
const asset = (name) =>
  isSea()
    ? Buffer.from(getRawAsset(name))
    : readFileSync(fileURLToPath(new URL("../../assets/" + name, import.meta.url)));
const JPEG = asset("sample.jpg");
const LINES = JSON.parse(asset("content.json").toString("utf8")).lines;

const LINES_PER_PAGE = 45;
const FONT_SIZE = 11;
const LINE_STEP = 16;
const TOP_Y = 740;

// One cover page (heading + embedded JPEG) followed by the JSON text paginated
// 45 lines/page — ~101 pages total, hand-assembled on every request.
const buildPdf = (heading) => {
  const contents = [];
  contents.push(
    Buffer.from(
      `BT\n/F1 24 Tf\n72 720 Td\n(${heading}) Tj\nET\n` +
        "q\n240 0 0 160 72 520 cm\n/Im1 Do\nQ\n",
      "latin1",
    ),
  );
  for (let p = 0; p * LINES_PER_PAGE < LINES.length; p++) {
    const slice = LINES.slice(p * LINES_PER_PAGE, (p + 1) * LINES_PER_PAGE);
    let s = `BT\n/F1 ${FONT_SIZE} Tf\n72 ${TOP_Y} Td\n`;
    for (let i = 0; i < slice.length; i++) {
      s += i === 0 ? `(${slice[i]}) Tj\n` : `0 -${LINE_STEP} Td\n(${slice[i]}) Tj\n`;
    }
    s += "ET\n";
    contents.push(Buffer.from(s, "latin1"));
  }
  const numPages = contents.length;

  const objects = [];
  objects.push(Buffer.from("<< /Type /Catalog /Pages 2 0 R >>", "latin1")); // 1

  // Page objects live at 5, 7, 9, … (content streams at 6, 8, 10, …).
  const kids = [];
  for (let p = 0; p < numPages; p++) kids.push(`${5 + 2 * p} 0 R`);
  objects.push(Buffer.from(`<< /Type /Pages /Kids [${kids.join(" ")}] /Count ${numPages} >>`, "latin1")); // 2
  objects.push(Buffer.from("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>", "latin1")); // 3
  objects.push(
    Buffer.concat([
      Buffer.from(
        "<< /Type /XObject /Subtype /Image /Width 240 /Height 160 /ColorSpace /DeviceRGB " +
          `/BitsPerComponent 8 /Filter /DCTDecode /Length ${JPEG.length} >>\nstream\n`,
        "latin1",
      ),
      JPEG,
      Buffer.from("\nendstream", "latin1"),
    ]),
  ); // 4
  for (let p = 0; p < numPages; p++) {
    objects.push(
      Buffer.from(
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] " +
          `/Resources << /Font << /F1 3 0 R >> /XObject << /Im1 4 0 R >> >> /Contents ${6 + 2 * p} 0 R >>`,
        "latin1",
      ),
    );
    const c = contents[p];
    objects.push(
      Buffer.concat([Buffer.from(`<< /Length ${c.length} >>\nstream\n`, "latin1"), c, Buffer.from("endstream", "latin1")]),
    );
  }

  const parts = [Buffer.from("%PDF-1.4\n%\xe2\xe3\xcf\xd3\n", "latin1")];
  let pos = parts[0].length;
  const offsets = [];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(pos);
    const head = Buffer.from(`${i + 1} 0 obj\n`, "latin1");
    const tail = Buffer.from("\nendobj\n", "latin1");
    parts.push(head, objects[i], tail);
    pos += head.length + objects[i].length + tail.length;
  }
  const n = objects.length;
  let xref = `xref\n0 ${n + 1}\n0000000000 65535 f\r\n`;
  for (const off of offsets) xref += `${String(off).padStart(10, "0")} 00000 n\r\n`;
  parts.push(Buffer.from(xref, "latin1"));
  parts.push(Buffer.from(`trailer\n<< /Size ${n + 1} /Root 1 0 R >>\nstartxref\n${pos}\n%%EOF\n`, "latin1"));
  return Buffer.concat(parts);
};

// Log lifecycle events but not every request — per-request logging dominates
// latency under load and the other servers here stay quiet too.
const app = Fastify({ logger: true, disableRequestLogging: true });

app.get("/", async (req, reply) => {
  reply.header("content-type", "text/plain; charset=utf-8");
  return "Hello from Node!\n";
});

app.get("/pdf", async (req, reply) => {
  reply.header("content-type", "application/pdf");
  return buildPdf("Hello from Node! PDF benchmark.");
});

// Heavy, real-world incoming-request validation via Fastify's built-in
// JSON-schema (AJV compiles it to fast native validation). Nested objects, an
// array of objects, regex patterns, an enum, and number ranges — a bad body
// gets an automatic 400 before the handler runs.
const validateSchema = {
  body: {
    type: "object",
    required: ["username", "email", "age", "password", "website", "country", "tags", "items"],
    additionalProperties: false,
    properties: {
      username: { type: "string", minLength: 3, maxLength: 30, pattern: "^[a-z0-9_]+$" },
      email: { type: "string", maxLength: 100, pattern: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$" },
      age: { type: "integer", minimum: 13, maximum: 120 },
      password: { type: "string", minLength: 8, maxLength: 100, pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).+$" },
      website: { type: "string", maxLength: 200, pattern: "^https?://" },
      country: { type: "string", enum: ["US", "CA", "GB", "DE", "FR", "JP", "AU", "BR", "IN", "CN"] },
      tags: { type: "array", minItems: 1, maxItems: 10, items: { type: "string", minLength: 1, maxLength: 20 } },
      items: {
        type: "array",
        minItems: 1,
        maxItems: 50,
        items: {
          type: "object",
          required: ["sku", "qty", "price"],
          additionalProperties: false,
          properties: {
            sku: { type: "string", pattern: "^[A-Z]{3}-[0-9]{3}$" },
            qty: { type: "integer", minimum: 1, maximum: 999 },
            price: { type: "number", minimum: 0, maximum: 100000 },
          },
        },
      },
    },
  },
};
app.post("/validate", { schema: validateSchema }, async () => ({ valid: true }));

// Drain in-flight requests before exiting on Ctrl+C / SIGTERM.
const shutdown = async () => {
  app.log.info("shutting down");
  await app.close();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

(async () => {
  try {
    await app.listen({ port: 8080, host: "127.0.0.1" });
  } catch (e) {
    app.log.error(e);
    process.exit(1);
  }
})();
