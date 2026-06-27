// Jai HTTP server built on farzher/Jai-HTTP-Server (Express-style routing).
// The library ships Linux (epoll) + Windows only; macos.jai in the cloned repo
// is a kqueue port added so it runs natively on macOS.
#import,file "../Jai-HTTP-Server/module.jai";

#import "Basic";
#import "File";
Posix :: #import "POSIX";

PORT :: 8080;

// Baked into the binary at compile time; per-request work is assembling the PDF.
// 240x160 baseline JPEG, embedded via /DCTDecode.
JPEG :: #run read_asset();
read_asset :: () -> string {
    data, ok := read_entire_file(tprint("%/../../assets/sample.jpg", #filepath));
    assert(ok, "could not read assets/sample.jpg at compile time");
    return data;
}

main :: () {
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


// --- PDF assembly (same byte layout as the other servers) ---

build_pdf :: (text: string) -> string {
    content: [..]u8;
    defer array_free(content);
    pdf_append(*content, "BT\n/F1 24 Tf\n72 720 Td\n(");
    pdf_append(*content, text);
    pdf_append(*content, ") Tj\nET\nq\n240 0 0 160 72 520 cm\n/Im1 Do\nQ\n");

    buf: [..]u8;
    pdf_append(*buf, "%PDF-1.4\n%");
    array_add(*buf, 0xe2); array_add(*buf, 0xe3); array_add(*buf, 0xcf); array_add(*buf, 0xd3);
    array_add(*buf, #char "\n");

    offsets: [6]int;
    for i: 0..5 {
        offsets[i] = buf.count;
        pdf_append_int(*buf, i + 1);
        pdf_append(*buf, " 0 obj\n");
        if i == {
            case 0; pdf_append(*buf, "<< /Type /Catalog /Pages 2 0 R >>");
            case 1; pdf_append(*buf, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
            case 2; pdf_append(*buf, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> /XObject << /Im1 5 0 R >> >> /Contents 6 0 R >>");
            case 3; pdf_append(*buf, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
            case 4;
                pdf_append(*buf, "<< /Type /XObject /Subtype /Image /Width 240 /Height 160 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ");
                pdf_append_int(*buf, JPEG.count);
                pdf_append(*buf, " >>\nstream\n");
                pdf_append(*buf, JPEG);
                pdf_append(*buf, "\nendstream");
            case 5;
                pdf_append(*buf, "<< /Length ");
                pdf_append_int(*buf, content.count);
                pdf_append(*buf, " >>\nstream\n");
                pdf_append(*buf, arr_to_string(content));
                pdf_append(*buf, "endstream");
        }
        pdf_append(*buf, "\nendobj\n");
    }

    xref_off := buf.count;
    pdf_append(*buf, "xref\n0 7\n0000000000 65535 f\r\n");
    for off: offsets {
        pdf_append_pad10(*buf, off);
        pdf_append(*buf, " 00000 n\r\n");
    }
    pdf_append(*buf, "trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n");
    pdf_append_int(*buf, xref_off);
    pdf_append(*buf, "\n%%EOF\n");

    return arr_to_string(buf);
}

// View a dynamic array's bytes as a string (shares the same backing memory).
arr_to_string :: (a: [..]u8) -> string {
    s: string = ---;
    s.data  = a.data;
    s.count = a.count;
    return s;
}

pdf_append :: (buf: *[..]u8, s: string) {
    for i: 0..s.count-1  array_add(buf, s[i]);
}
pdf_append_int :: (buf: *[..]u8, n: int) {
    pdf_append(buf, tprint("%", n));
}
pdf_append_pad10 :: (buf: *[..]u8, n: int) {
    s := tprint("%", n);
    for 1..10-s.count  array_add(buf, #char "0");
    pdf_append(buf, s);
}
