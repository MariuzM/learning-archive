import std/[logging, posix]
import mummy, mummy/routers

const body = "Hello from Nim!\n"

proc hello(request: Request) =
  var headers: HttpHeaders
  headers["Content-Type"] = "text/plain; charset=utf-8"
  request.respond(200, headers, body)

var router: Router
router.get("/", hello)

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
