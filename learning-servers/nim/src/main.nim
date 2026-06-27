import mummy
import app, pdf, validate

const body = "Hello from Nim!\n"

proc hello(request: Request) =
  var headers: HttpHeaders
  headers["Content-Type"] = "text/plain; charset=utf-8"
  request.respond(200, headers, body)

var application: App
application.get("/", hello)
application.get("/pdf", pdf.pdf)
application.post("/validate", validate.validate)
application.listen("127.0.0.1", 8080)
