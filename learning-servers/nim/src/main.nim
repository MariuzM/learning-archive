import std/[logging, posix, strutils, json]
import mummy, mummy/routers

const body = "Hello from Nim!\n"

# Baked into the binary at compile time; per-request work is assembling the PDF.
# 240x160 baseline JPEG, embedded via /DCTDecode.
const JPEG = staticRead("../../assets/sample.jpg")

# The text to render, parsed at compile time so handlers stay GC-safe (like JPEG).
const LINES = block:
  var s: seq[string]
  for x in parseJson(staticRead("../../assets/content.json"))["lines"]:
    s.add x.getStr
  s

const
  LINES_PER_PAGE = 45
  FONT_SIZE = 11
  LINE_STEP = 16
  TOP_Y = 740

# One cover page (heading + JPEG) then the JSON text paginated 45 lines/page.
proc buildPdf(heading: string): string =
  var contents = @[
    "BT\n/F1 24 Tf\n72 720 Td\n(" & heading & ") Tj\nET\n" &
    "q\n240 0 0 160 72 520 cm\n/Im1 Do\nQ\n"
  ]
  var p = 0
  while p * LINES_PER_PAGE < LINES.len:
    var s = "BT\n/F1 " & $FONT_SIZE & " Tf\n72 " & $TOP_Y & " Td\n"
    let stop = min((p + 1) * LINES_PER_PAGE, LINES.len)
    for i in (p * LINES_PER_PAGE) ..< stop:
      if i == p * LINES_PER_PAGE:
        s.add("(" & LINES[i] & ") Tj\n")
      else:
        s.add("0 -" & $LINE_STEP & " Td\n(" & LINES[i] & ") Tj\n")
    s.add("ET\n")
    contents.add(s)
    inc p
  let numPages = contents.len

  var objects = @["<< /Type /Catalog /Pages 2 0 R >>"]  # 1
  var kids = ""
  for i in 0 ..< numPages:
    if i > 0: kids.add(" ")
    kids.add($(5 + 2 * i) & " 0 R")
  objects.add("<< /Type /Pages /Kids [" & kids & "] /Count " & $numPages & " >>")  # 2
  objects.add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")  # 3
  objects.add(
    "<< /Type /XObject /Subtype /Image /Width 240 /Height 160 /ColorSpace /DeviceRGB " &
    "/BitsPerComponent 8 /Filter /DCTDecode /Length " & $JPEG.len & " >>\nstream\n" &
    JPEG & "\nendstream")  # 4
  for i in 0 ..< numPages:
    objects.add(
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] " &
      "/Resources << /Font << /F1 3 0 R >> /XObject << /Im1 4 0 R >> >> /Contents " &
      $(6 + 2 * i) & " 0 R >>")
    let c = contents[i]
    objects.add("<< /Length " & $c.len & " >>\nstream\n" & c & "endstream")

  var buf = "%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"
  var offsets: seq[int]
  for i, obj in objects:
    offsets.add(buf.len)
    buf.add($(i + 1) & " 0 obj\n" & obj & "\nendobj\n")
  let xrefOff = buf.len
  let n = objects.len
  buf.add("xref\n0 " & $(n + 1) & "\n0000000000 65535 f\r\n")
  for off in offsets:
    buf.add(align($off, 10, '0') & " 00000 n\r\n")
  buf.add("trailer\n<< /Size " & $(n + 1) & " /Root 1 0 R >>\nstartxref\n" & $xrefOff & "\n%%EOF\n")
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
