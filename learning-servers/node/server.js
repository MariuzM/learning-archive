import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Fastify from "fastify";

// Read the shared image once at startup; per-request work is assembling the PDF.
const JPEG = readFileSync(fileURLToPath(new URL("../assets/sample.jpg", import.meta.url)));

const HEADER = Buffer.from("%PDF-1.4\n%\xe2\xe3\xcf\xd3\n", "latin1");

const buildPdf = (text) => {
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
  const offsets = [];
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
  const xrefBuf = Buffer.from(xref, "latin1");
  parts.push(xrefBuf);
  const trailer = Buffer.from(
    `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${pos}\n%%EOF\n`,
    "latin1",
  );
  parts.push(trailer);
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
