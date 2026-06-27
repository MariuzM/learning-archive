import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Hono } from "hono";

// Read the shared image once at startup; per-request work is assembling the PDF.
const JPEG = readFileSync(fileURLToPath(new URL("../../assets/sample.jpg", import.meta.url)));

const HEADER = Buffer.from("%PDF-1.4\n%\xe2\xe3\xcf\xd3\n", "latin1");

const buildPdf = (text: string): Buffer => {
  const content = Buffer.from(
    `BT\n/F1 24 Tf\n72 720 Td\n(${text}) Tj\nET\n` +
      "q\n240 0 0 160 72 520 cm\n/Im1 Do\nQ\n",
    "latin1",
  );
  const objs = [
    Buffer.from("<< /Type /Catalog /Pages 2 0 R >>", "latin1"),
    Buffer.from("<< /Type /Pages /Kids [3 0 R] /Count 1 >>", "latin1"),
    Buffer.from(
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] " +
        "/Resources << /Font << /F1 4 0 R >> /XObject << /Im1 5 0 R >> >> /Contents 6 0 R >>",
      "latin1",
    ),
    Buffer.from("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>", "latin1"),
    Buffer.concat([
      Buffer.from(
        "<< /Type /XObject /Subtype /Image /Width 240 /Height 160 /ColorSpace /DeviceRGB " +
          `/BitsPerComponent 8 /Filter /DCTDecode /Length ${JPEG.length} >>\nstream\n`,
        "latin1",
      ),
      JPEG,
      Buffer.from("\nendstream", "latin1"),
    ]),
    Buffer.from(`<< /Length ${content.length} >>\nstream\n`, "latin1"),
  ];

  const parts = [HEADER];
  let pos = HEADER.length;
  const offsets: number[] = [];
  for (let i = 0; i < objs.length; i++) {
    offsets.push(pos);
    const head = Buffer.from(`${i + 1} 0 obj\n`, "latin1");
    const tail = Buffer.from("\nendobj\n", "latin1");
    // object 6 (content stream) carries the trailing "endstream" inside objs[5]
    const body = i === 5 ? Buffer.concat([objs[5], content, Buffer.from("endstream", "latin1")]) : objs[i];
    parts.push(head, body, tail);
    pos += head.length + body.length + tail.length;
  }

  let xref = `xref\n0 7\n0000000000 65535 f\r\n`;
  for (const off of offsets) xref += `${String(off).padStart(10, "0")} 00000 n\r\n`;
  parts.push(Buffer.from(xref, "latin1"));
  parts.push(
    Buffer.from(`trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${pos}\n%%EOF\n`, "latin1"),
  );
  return Buffer.concat(parts);
};

const app = new Hono();

// Same /hello route, different verbs.
app.get("/", (c) => c.text("Hello from Hono!\n"));
app.get("/hello", (c) => c.text("GET hello from Hono!\n"));
app.post("/hello", (c) => c.text("POST hello from Hono!\n"));
app.get("/pdf", (c) => {
  c.header("content-type", "application/pdf");
  return c.body(buildPdf("Hello from Hono! PDF benchmark."));
});

// Hono is runtime-agnostic; drive it with Bun.serve so we get a server handle
// to stop on shutdown.
const server = Bun.serve({ port: 8080, hostname: "127.0.0.1", fetch: app.fetch });
console.log("listening on http://127.0.0.1:8080");

const shutdown = () => {
  console.log("shutting down");
  server.stop();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
