// Jai HTTP server built on farzher/Jai-HTTP-Server (Express-style routing).
// The library ships Linux (epoll) + Windows only; macos.jai in the cloned repo
// is a kqueue port added so it runs natively on macOS.
#import,file "../Jai-HTTP-Server/module.jai";
#load "validate.jai";

#import "Basic";
#import "File";
Posix :: #import "POSIX";

PORT :: 8080;

LINES_PER_PAGE :: 45;
FONT_SIZE      :: 11;
LINE_STEP      :: 16;
TOP_Y          :: 740;

// Baked into the binary at compile time; per-request work is assembling the PDF.
// 240x160 baseline JPEG, embedded via /DCTDecode.
JPEG :: #run read_asset();
read_asset :: () -> string {
    data, ok := read_entire_file(tprint("%/../../assets/sample.jpg", #filepath));
    assert(ok, "could not read assets/sample.jpg at compile time");
    return data;
}

// The text to render: JSON baked in at compile time, parsed once at startup.
CONTENT :: #run read_content();
read_content :: () -> string {
    data, ok := read_entire_file(tprint("%/../../assets/content.json", #filepath));
    assert(ok, "could not read assets/content.json at compile time");
    return data;
}
LINES: [..]string;

main :: () {
    LINES = parse_lines(CONTENT);

    install_shutdown_handler();

    http_listen(port = PORT);

    // Express/Fastify-style: one handler per method+path. Same /hello route,
    // different verbs.
    get("/", (request: *Request) {
        send_text(request, "Hello from Jai!\n");
    });
    get("/hello", (request: *Request) {
        send_text(request, "GET hello from Jai!\n");
    });
    post("/hello", (request: *Request) {
        send_text(request, "POST hello from Jai!\n");
    });
    get("/pdf", (request: *Request) {
        pdf := build_pdf("Hello from Jai! PDF benchmark.");
        defer free(pdf.data);
        send_response(request, pdf, content_type = "application/pdf");
    });
    post("/validate", (request: *Request) {
        if validate_payload(request.body) {
            send_response(request, "{\"valid\":true}", content_type = "application/json");
        } else {
            send_response(request, "{\"valid\":false}", status_code = 400, content_type = "application/json");
        }
    });

    print("listening on http://127.0.0.1:%\n", PORT);

    // http_listen spawns the worker threads and returns; park the main thread
    // until a shutdown signal flips the flag.
    while !should_shutdown  sleep_milliseconds(50);
    print("shutting down\n");
}

// The library has no graceful-shutdown hook. The signal handler is a #c_call with
// no Jai context, so it just flips a flag the main loop polls.
// (The auto-generated POSIX `signal` binding has a wrong arity, so bind it here.)
should_shutdown := false;
install_shutdown_handler :: () {
    handler :: (sig: s32) #c_call {
        should_shutdown = true;
    }
    c_signal(Posix.SIGINT,  handler);
    c_signal(Posix.SIGTERM, handler);
}
crt :: #system_library "libc";
c_signal :: (sig: s32, handler: #type (s32) -> void #c_call) -> *void #foreign crt "signal";


// Minimal parser for our format: {"title": "...", "lines": ["...", ...]}. The
// strings are clean ASCII with no escapes, so we just scan quoted spans inside
// the first array. Returned strings view into `data` (kept alive for the run).
parse_lines :: (data: string) -> [..]string {
    result: [..]string;
    i := 0;
    while i < data.count && data[i] != #char "["  i += 1;
    i += 1;
    while i < data.count {
        while i < data.count && data[i] != #char "\"" && data[i] != #char "]"  i += 1;
        if i >= data.count || data[i] == #char "]"  break;
        i += 1; // past opening quote
        start := i;
        while i < data.count && data[i] != #char "\""  i += 1;
        line: string = ---;
        line.data = data.data + start;
        line.count = i - start;
        array_add(*result, line);
        i += 1; // past closing quote
    }
    return result;
}


// --- PDF assembly: one cover page (heading + JPEG) then the JSON text
// paginated 45 lines/page — same byte layout as the other servers. ---

build_pdf :: (heading: string) -> string {
    contents: [..]string;

    cover: [..]u8;
    pdf_append(*cover, "BT\n/F1 24 Tf\n72 720 Td\n(");
    pdf_append(*cover, heading);
    pdf_append(*cover, ") Tj\nET\nq\n240 0 0 160 72 520 cm\n/Im1 Do\nQ\n");
    array_add(*contents, arr_to_string(cover));

    p := 0;
    while p * LINES_PER_PAGE < LINES.count {
        stop := min((p + 1) * LINES_PER_PAGE, LINES.count);
        c: [..]u8;
        pdf_append(*c, "BT\n/F1 ");
        pdf_append_int(*c, FONT_SIZE);
        pdf_append(*c, " Tf\n72 ");
        pdf_append_int(*c, TOP_Y);
        pdf_append(*c, " Td\n");
        for j: (p * LINES_PER_PAGE)..(stop - 1) {
            if j == p * LINES_PER_PAGE {
                pdf_append(*c, "(");
            } else {
                pdf_append(*c, "0 -");
                pdf_append_int(*c, LINE_STEP);
                pdf_append(*c, " Td\n(");
            }
            pdf_append(*c, LINES[j]);
            pdf_append(*c, ") Tj\n");
        }
        pdf_append(*c, "ET\n");
        array_add(*contents, arr_to_string(c));
        p += 1;
    }
    num_pages := contents.count;

    objects: [..]string;
    array_add(*objects, copy_string("<< /Type /Catalog /Pages 2 0 R >>")); // 1
    {
        o: [..]u8;
        pdf_append(*o, "<< /Type /Pages /Kids [");
        for k: 0..num_pages-1 {
            if k > 0  pdf_append(*o, " ");
            pdf_append_int(*o, 5 + 2 * k);
            pdf_append(*o, " 0 R");
        }
        pdf_append(*o, "] /Count ");
        pdf_append_int(*o, num_pages);
        pdf_append(*o, " >>");
        array_add(*objects, arr_to_string(o)); // 2
    }
    array_add(*objects, copy_string("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")); // 3
    {
        o: [..]u8;
        pdf_append(*o, "<< /Type /XObject /Subtype /Image /Width 240 /Height 160 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ");
        pdf_append_int(*o, JPEG.count);
        pdf_append(*o, " >>\nstream\n");
        pdf_append(*o, JPEG);
        pdf_append(*o, "\nendstream");
        array_add(*objects, arr_to_string(o)); // 4
    }
    for k: 0..num_pages-1 {
        po: [..]u8;
        pdf_append(*po, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> /XObject << /Im1 4 0 R >> >> /Contents ");
        pdf_append_int(*po, 6 + 2 * k);
        pdf_append(*po, " 0 R >>");
        array_add(*objects, arr_to_string(po));

        co: [..]u8;
        pdf_append(*co, "<< /Length ");
        pdf_append_int(*co, contents[k].count);
        pdf_append(*co, " >>\nstream\n");
        pdf_append(*co, contents[k]);
        pdf_append(*co, "endstream");
        array_add(*objects, arr_to_string(co));
    }

    buf: [..]u8;
    pdf_append(*buf, "%PDF-1.4\n%");
    array_add(*buf, 0xe2); array_add(*buf, 0xe3); array_add(*buf, 0xcf); array_add(*buf, 0xd3);
    array_add(*buf, #char "\n");

    offsets: [..]int;
    for obj, i: objects {
        array_add(*offsets, buf.count);
        pdf_append_int(*buf, i + 1);
        pdf_append(*buf, " 0 obj\n");
        pdf_append(*buf, obj);
        pdf_append(*buf, "\nendobj\n");
    }
    xref_off := buf.count;
    n := objects.count;
    pdf_append(*buf, "xref\n0 ");
    pdf_append_int(*buf, n + 1);
    pdf_append(*buf, "\n0000000000 65535 f\r\n");
    for off: offsets {
        pdf_append_pad10(*buf, off);
        pdf_append(*buf, " 00000 n\r\n");
    }
    pdf_append(*buf, "trailer\n<< /Size ");
    pdf_append_int(*buf, n + 1);
    pdf_append(*buf, " /Root 1 0 R >>\nstartxref\n");
    pdf_append_int(*buf, xref_off);
    pdf_append(*buf, "\n%%EOF\n");

    // Free the per-page intermediates (their bytes were copied into buf).
    for contents  free(it.data);
    for objects   free(it.data);
    array_free(contents);
    array_free(objects);
    array_free(offsets);

    return arr_to_string(buf);
}

// View a dynamic array's bytes as a string (shares the same backing memory).
arr_to_string :: (a: [..]u8) -> string {
    s: string = ---;
    s.data  = a.data;
    s.count = a.count;
    return s;
}

// Bulk append (resize + memcpy) — byte-by-byte is far too slow at ~400 KB/request.
pdf_append :: (buf: *[..]u8, s: string) {
    if s.count == 0  return;
    old := buf.count;
    array_resize(buf, old + s.count);
    memcpy(buf.data + old, s.data, s.count);
}
pdf_append_int :: (buf: *[..]u8, n: int) {
    pdf_append(buf, tprint("%", n));
}
pdf_append_pad10 :: (buf: *[..]u8, n: int) {
    s := tprint("%", n);
    for 1..10-s.count  array_add(buf, #char "0");
    pdf_append(buf, s);
}
