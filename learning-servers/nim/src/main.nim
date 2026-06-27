import std/[logging, posix, strutils]
import mummy, mummy/routers

const body = "Hello from Nim!\n"

# Baked into the binary at compile time; per-request work is assembling the PDF.
# 240x160 baseline JPEG, embedded via /DCTDecode.
const JPEG = staticRead("../../assets/sample.jpg")

proc buildPdf(text: string): string =
  let content =
    "BT\n/F1 24 Tf\n72 720 Td\n(" & text & ") Tj\nET\n" &
    "q\n240 0 0 160 72 520 cm\n/Im1 Do\nQ\n"
  let objs = @[
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] " &
      "/Resources << /Font << /F1 4 0 R >> /XObject << /Im1 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /XObject /Subtype /Image /Width 240 /Height 160 /ColorSpace /DeviceRGB " &
      "/BitsPerComponent 8 /Filter /DCTDecode /Length " & $JPEG.len & " >>\nstream\n" &
      JPEG & "\nendstream",
    "<< /Length " & $content.len & " >>\nstream\n" & content & "endstream",
  ]
  var buf = "%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"
  var offsets: seq[int]
  for i, obj in objs:
    offsets.add(buf.len)
    buf.add($(i + 1) & " 0 obj\n" & obj & "\nendobj\n")
  let xrefOff = buf.len
  buf.add("xref\n0 7\n0000000000 65535 f\r\n")
  for off in offsets:
    buf.add(align($off, 10, '0') & " 00000 n\r\n")
  buf.add("trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n" & $xrefOff & "\n%%EOF\n")
  result = buf

proc hello(request: Request) =
  var headers: HttpHeaders
  headers["Content-Type"] = "text/plain; charset=utf-8"
  request.respond(200, headers, body)

proc pdf(request: Request) =
  var headers: HttpHeaders
  headers["Content-Type"] = "application/pdf"
  request.respond(200, headers, buildPdf("Hello from Nim! PDF benchmark."))

var router: Router
router.get("/", hello)
router.get("/pdf", pdf)

# mummy runs a fixed pool of worker threads draining one event loop, so a slow
# handler never blocks accept. Tune workerThreads for the box; default is 2x cores.
let server = newServer(router)

# close() unblocks serve() from the event loop; safe to call from a signal.
onSignal(SIGINT, SIGTERM):
  info "shutting down"
  server.close()

addHandler(newConsoleLogger(fmtStr = "[$time] $levelname "))
info "listening on http://127.0.0.1:8080"
server.serve(Port(8080), address = "127.0.0.1")
