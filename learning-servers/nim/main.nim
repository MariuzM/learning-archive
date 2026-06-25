import std/[asynchttpserver, asyncdispatch, httpcore, logging, os, posix]

const body = "Hello from Nim!\n"

# Flipped by the signal handler; the accept loop polls it to stop cleanly.
var running = true

proc handle(req: Request) {.async, gcsafe.} =
  let headers = newHttpHeaders({"Content-Type": "text/plain; charset=utf-8"})
  try:
    await req.respond(Http200, body, headers)
  except CatchableError:
    discard # client went away mid-response; nothing to recover

proc main() =
  addHandler(newConsoleLogger(fmtStr = "[$time] $levelname "))

  onSignal(SIGINT, SIGTERM):
    running = false

  let server = newAsyncHttpServer()
  server.listen(Port(8080), "127.0.0.1")
  info "listening on http://127.0.0.1:8080"

  # acceptRequest dispatches each connection with asyncCheck, so the event loop
  # serves many clients concurrently. Keep exactly one accept outstanding and
  # poll with a timeout so SIGINT/SIGTERM is noticed within ~200ms.
  var accept = server.acceptRequest(handle)
  while running:
    if accept.finished:
      if accept.failed:
        warn "accept failed: " & accept.error.msg
      accept = server.acceptRequest(handle)
    if hasPendingOperations():
      poll(200)
    else:
      sleep(200)
  server.close()
  info "shutting down"

main()
