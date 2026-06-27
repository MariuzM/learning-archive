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

# Heavy, real-world incoming-request validation. Nim has no validation library,
# so std/json does the structural parse and the field constraints are checked by
# hand on the parsed tree below.
proc isCountry(s: string): bool =
  s in ["US", "CA", "GB", "DE", "FR", "JP", "AU", "BR", "IN", "CN"]

proc validUsername(s: string): bool =
  if s.len < 3 or s.len > 30: return false
  for ch in s:
    if not ((ch >= 'a' and ch <= 'z') or (ch >= '0' and ch <= '9') or ch == '_'): return false
  return true

proc validEmail(s: string): bool =
  if s.len == 0 or s.len > 100 or ' ' in s: return false
  let at = s.find('@')
  if at <= 0: return false
  let domain = s[at + 1 .. ^1]
  if '@' in domain: return false
  let dot = domain.find('.')
  return dot > 0 and dot != domain.len - 1

proc validPassword(s: string): bool =
  if s.len < 8 or s.len > 100: return false
  var lo, up, di = false
  for ch in s:
    if ch >= 'a' and ch <= 'z': lo = true
    elif ch >= 'A' and ch <= 'Z': up = true
    elif ch >= '0' and ch <= '9': di = true
  return lo and up and di

proc validSku(s: string): bool =
  if s.len != 7 or s[3] != '-': return false
  for i in 0 .. 2:
    if s[i] < 'A' or s[i] > 'Z': return false
  for i in 4 .. 6:
    if s[i] < '0' or s[i] > '9': return false
  return true

proc validatePayload(jsonBody: string): bool =
  var node: JsonNode
  try:
    node = parseJson(jsonBody)
  except CatchableError:
    return false
  if node.kind != JObject or node.len != 8: return false
  for k in ["username", "email", "age", "password", "website", "country", "tags", "items"]:
    if not node.hasKey(k): return false
  if node["username"].kind != JString or not validUsername(node["username"].getStr): return false
  if node["email"].kind != JString or not validEmail(node["email"].getStr): return false
  if node["age"].kind != JInt: return false
  let age = node["age"].getInt
  if age < 13 or age > 120: return false
  if node["password"].kind != JString or not validPassword(node["password"].getStr): return false
  if node["website"].kind != JString: return false
  let web = node["website"].getStr
  if web.len > 200 or not (web.startsWith("http://") or web.startsWith("https://")): return false
  if node["country"].kind != JString or not isCountry(node["country"].getStr): return false
  let tags = node["tags"]
  if tags.kind != JArray or tags.len < 1 or tags.len > 10: return false
  for t in tags:
    if t.kind != JString or t.getStr.len < 1 or t.getStr.len > 20: return false
  let items = node["items"]
  if items.kind != JArray or items.len < 1 or items.len > 50: return false
  for it in items:
    if it.kind != JObject or it.len != 3: return false
    if not (it.hasKey("sku") and it.hasKey("qty") and it.hasKey("price")): return false
    if it["sku"].kind != JString or not validSku(it["sku"].getStr): return false
    if it["qty"].kind != JInt: return false
    let q = it["qty"].getInt
    if q < 1 or q > 999: return false
    var price: float
    case it["price"].kind
    of JFloat: price = it["price"].getFloat
    of JInt: price = it["price"].getInt.float
    else: return false
    if price < 0 or price > 100000: return false
  return true

proc validate(request: Request) =
  var headers: HttpHeaders
  headers["Content-Type"] = "application/json"
  if validatePayload(request.body):
    request.respond(200, headers, "{\"valid\":true}")
  else:
    request.respond(400, headers, "{\"valid\":false}")

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
router.post("/validate", validate)

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
