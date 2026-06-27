import os
from pathlib import Path

import uvicorn
from starlette.applications import Starlette
from starlette.responses import PlainTextResponse, Response
from starlette.routing import Route

BODY = "Hello from Python!\n"

# Read the shared image once at startup; the per-request work is assembling the
# PDF, not reading the file. 240x160 baseline JPEG, embedded via /DCTDecode.
JPEG = (Path(__file__).resolve().parent.parent.parent / "assets" / "sample.jpg").read_bytes()
IMG_W, IMG_H = 240, 160


def build_pdf(text: str) -> bytes:
    content = (
        b"BT\n/F1 24 Tf\n72 720 Td\n(" + text.encode("latin-1") + b") Tj\nET\n"
        b"q\n240 0 0 160 72 520 cm\n/Im1 Do\nQ\n"
    )
    objs = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
        b"/Resources << /Font << /F1 4 0 R >> /XObject << /Im1 5 0 R >> >> /Contents 6 0 R >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        b"<< /Type /XObject /Subtype /Image /Width 240 /Height 160 /ColorSpace /DeviceRGB "
        b"/BitsPerComponent 8 /Filter /DCTDecode /Length " + str(len(JPEG)).encode()
        + b" >>\nstream\n" + JPEG + b"\nendstream",
        b"<< /Length " + str(len(content)).encode() + b" >>\nstream\n" + content + b"endstream",
    ]
    buf = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = []
    for i, body in enumerate(objs, start=1):
        offsets.append(len(buf))
        buf += str(i).encode() + b" 0 obj\n" + body + b"\nendobj\n"
    xref_off = len(buf)
    buf += b"xref\n0 7\n0000000000 65535 f\r\n"
    for off in offsets:
        buf += ("%010d 00000 n\r\n" % off).encode()
    buf += b"trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n" + str(xref_off).encode() + b"\n%%EOF\n"
    return bytes(buf)


async def hello(request):
    return PlainTextResponse(BODY)


async def pdf(request):
    return Response(build_pdf("Hello from Python! PDF benchmark."), media_type="application/pdf")


app = Starlette(routes=[Route("/", hello), Route("/pdf", pdf)])


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