import { readFileSync } from "node:fs";
import { Elysia, t } from "elysia";
import jpegFile from "../../assets/sample.jpg" with { type: "file" };
import contentFile from "../../assets/content.json" with { type: "file" };

// Read the shared assets once at startup; per-request work is assembling the PDF.
const JPEG = readFileSync(jpegFile);
const LINES = (JSON.parse(readFileSync(contentFile, "utf8")) as { lines: string[] }).lines;

const LINES_PER_PAGE = 45;
const FONT_SIZE = 11;
const LINE_STEP = 16;
const TOP_Y = 740;

// One cover page (heading + embedded JPEG) followed by the JSON text paginated
// 45 lines/page — ~101 pages total, hand-assembled on every request.
const buildPdf = (heading: string): Buffer => {
  const contents: Buffer[] = [];
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

  const objects: Buffer[] = [];
  objects.push(Buffer.from("<< /Type /Catalog /Pages 2 0 R >>", "latin1")); // 1

  const kids: string[] = [];
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

  const parts: Buffer[] = [Buffer.from("%PDF-1.4\n%\xe2\xe3\xcf\xd3\n", "latin1")];
  let pos = parts[0].length;
  const offsets: number[] = [];
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

const TEXT = { "content-type": "text/plain; charset=utf-8" };

// Same /hello route, different verbs. Elysia runs on Bun.serve under the hood.
const app = new Elysia()
  .get("/", () => new Response("Hello from Elysia!\n", { headers: TEXT }))
  .get("/hello", () => new Response("GET hello from Elysia!\n", { headers: TEXT }))
  .post("/hello", () => new Response("POST hello from Elysia!\n", { headers: TEXT }))
  .get(
    "/pdf",
    () =>
      new Response(buildPdf("Hello from Elysia! PDF benchmark."), {
        headers: { "content-type": "application/pdf" },
      }),
  )
  // Heavy, real-world incoming-request validation via Elysia's built-in TypeBox
  // schema (compiled validators). Nested objects, an array of objects, regex
  // patterns, an enum, and ranges — a bad body is rejected before the handler.
  .post("/validate", () => ({ valid: true }), {
    body: t.Object(
      {
        username: t.String({ minLength: 3, maxLength: 30, pattern: "^[a-z0-9_]+$" }),
        email: t.String({ maxLength: 100, pattern: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$" }),
        age: t.Integer({ minimum: 13, maximum: 120 }),
        password: t.String({ minLength: 8, maxLength: 100, pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).+$" }),
        website: t.String({ maxLength: 200, pattern: "^https?://" }),
        country: t.Union(
          ["US", "CA", "GB", "DE", "FR", "JP", "AU", "BR", "IN", "CN"].map((c) => t.Literal(c)),
        ),
        tags: t.Array(t.String({ minLength: 1, maxLength: 20 }), { minItems: 1, maxItems: 10 }),
        items: t.Array(
          t.Object({
            sku: t.String({ pattern: "^[A-Z]{3}-[0-9]{3}$" }),
            qty: t.Integer({ minimum: 1, maximum: 999 }),
            price: t.Number({ minimum: 0, maximum: 100000 }),
          }),
          { minItems: 1, maxItems: 50 },
        ),
      },
      { additionalProperties: false },
    ),
  })
  .listen({ port: 8080, hostname: "127.0.0.1" }, () =>
    console.log("listening on http://127.0.0.1:8080"),
  );

// Stop accepting and drain before exiting on Ctrl+C / SIGTERM.
const shutdown = async () => {
  console.log("shutting down");
  await app.stop();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
