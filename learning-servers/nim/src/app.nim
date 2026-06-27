import std/[logging, posix]
import mummy, mummy/routers

type App* = object
  router*: Router

var runningServer: Server

proc get*(app: var App, path: string, handler: RequestHandler) =
  app.router.get(path, handler)

proc post*(app: var App, path: string, handler: RequestHandler) =
  app.router.post(path, handler)

proc listen*(app: App, host: string, port: int) =
  runningServer = newServer(app.router)

  onSignal(SIGINT, SIGTERM):
    info "shutting down"
    runningServer.close()

  addHandler(newConsoleLogger(fmtStr = "[$time] $levelname "))
  info "listening on http://" & host & ":" & $port
  runningServer.serve(Port(port), address = host)
