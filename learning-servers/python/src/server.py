import json
import os
from pathlib import Path

import uvicorn
from starlette.applications import Starlette
from starlette.responses import PlainTextResponse, Response
from starlette.routing import Route

BODY = "Hello from Python!\n"

# Read the shared assets once at startup; the per-request work is assembling the
# multi-page PDF, not reading the files.
_ASSETS = Path(__file__).resolve().parent.parent.parent / "assets"
JPEG = (_ASSETS / "sample.jpg").read_bytes()
LINES = json.loads((_ASSETS / "content.json").read_text())["lines"]

LINES_PER_PAGE = 45
FONT_SIZE = 11
LINE_STEP = 16
TOP_Y = 740


def build_pdf(heading: str) -> bytes:
    # One cover page (heading + JPEG) then the JSON text paginated 45 lines/page.
    contents = [
        b"BT\n/F1 24 Tf\n72 720 Td\n(" + heading.encode("latin-1") + b") Tj\nET\n"
        b"q\n240 0 0 160 72 520 cm\n/Im1 Do\nQ\n"
    ]
    p = 0
    while p * LINES_PER_PAGE < len(LINES):
        chunk = LINES[p * LINES_PER_PAGE:(p + 1) * LINES_PER_PAGE]
        s = bytearray(b"BT\n/F1 %d Tf\n72 %d Td\n" % (FONT_SIZE, TOP_Y))
        for i, line in enumerate(chunk):
            if i == 0:
                s += b"(" + line.encode("latin-1") + b") Tj\n"
            else:
                s += b"0 -%d Td\n(" % LINE_STEP + line.encode("latin-1") + b") Tj\n"
        s += b"ET\n"
        contents.append(bytes(s))
        p += 1
    num_pages = len(contents)

    objects = [b"<< /Type /Catalog /Pages 2 0 R >>"]  # 1
    kids = b" ".join(b"%d 0 R" % (5 + 2 * i) for i in range(num_pages))
    objects.append(b"<< /Type /Pages /Kids [" + kids + b"] /Count %d >>" % num_pages)  # 2
    objects.append(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")  # 3
    objects.append(
        b"<< /Type /XObject /Subtype /Image /Width 240 /Height 160 /ColorSpace /DeviceRGB "
        b"/BitsPerComponent 8 /Filter /DCTDecode /Length %d >>\nstream\n" % len(JPEG)
        + JPEG + b"\nendstream"
    )  # 4
    for i in range(num_pages):
        objects.append(
            b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
            b"/Resources << /Font << /F1 3 0 R >> /XObject << /Im1 4 0 R >> >> /Contents %d 0 R >>"
            % (6 + 2 * i)
        )
        c = contents[i]
        objects.append(b"<< /Length %d >>\nstream\n" % len(c) + c + b"endstream")

    buf = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = []
    for i, body in enumerate(objects, start=1):
        offsets.append(len(buf))
        buf += b"%d 0 obj\n" % i + body + b"\nendobj\n"
    xref_off = len(buf)
    n = len(objects)
    buf += b"xref\n0 %d\n0000000000 65535 f\r\n" % (n + 1)
    for off in offsets:
        buf += b"%010d 00000 n\r\n" % off
    buf += (
        b"trailer\n<< /Size " + str(n + 1).encode() + b" /Root 1 0 R >>\nstartxref\n"
        + str(xref_off).encode() + b"\n%%EOF\n"
    )
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
