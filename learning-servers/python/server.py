import os

import uvicorn
from starlette.applications import Starlette
from starlette.responses import PlainTextResponse
from starlette.routing import Route

BODY = "Hello from Python!\n"


async def hello(request):
    return PlainTextResponse(BODY)


app = Starlette(routes=[Route("/", hello)])


if __name__ == "__main__":
    # A single ASGI worker is GIL-bound, so prefork one per core to actually use
    # the machine (the import-string form is required for multiple workers).
    # uvicorn's process manager installs the SIGINT/SIGTERM handlers and drains
    # in-flight requests before exiting; timeout_keep_alive caps idle keep-alive
    # connections so a stalled client can't tie one up forever.
    uvicorn.run(
        "server:app",
        host="127.0.0.1",
        port=8080,
        log_level="info",
        access_log=False,
        timeout_keep_alive=15,
        workers=os.cpu_count() or 1,
    )
