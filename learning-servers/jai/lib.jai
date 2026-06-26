#import "Basic";
#import "File";
#import "Socket";
#import "POSIX";
Threads :: #import "Thread";

NUM_WORKERS :: 8;
QUEUE_CAP   :: 256;

// Baked into the binary at compile time; per-request work is assembling the PDF.
// 240x160 baseline JPEG, embedded via /DCTDecode. Read relative to this file so
// the path holds no matter what directory the compiler is invoked from.
JPEG :: #run read_asset();
read_asset :: () -> string {
    data, ok := read_entire_file(tprint("%/../assets/sample.jpg", #filepath));
    assert(ok, "could not read assets/sample.jpg at compile time");
    return data;
}

Http_Server :: struct {
    fd:        s32;
    queue:     [QUEUE_CAP] s32;
    head:      int;
    tail:      int;
    count:     int;
    mutex:     Threads.Mutex;
    not_empty: Threads.Condition_Variable;
    running:   bool = true;

    // Full HTTP response sent for "/" requests. Built once by the caller.
    response:  string;

    // Text drawn into the PDF returned for "/pdf" requests.
    pdf_text:  string;
}

// Bind and listen on the given port. Returns false if the socket can't be set up.
http_listen :: (server: *Http_Server, port: u16) -> bool {
    server.fd = socket(AF_INET, .SOCK_STREAM, 0);
    if server.fd < 0 {
        log_error("failed to create socket\n");
        return false;
    }

    opt: s32 = 1;
    setsockopt(server.fd, SOL_SOCKET, SO_REUSEADDR, *opt, size_of(s32));

    addr: sockaddr_in;
    addr.sin_family = AF_INET;
    addr.sin_port = htons(port);
    addr.sin_addr.s_addr = htonl(INADDR_LOOPBACK);

    if bind(server.fd, cast(*sockaddr) *addr, size_of(sockaddr_in)) < 0 {
        log_error("bind failed\n");
        return false;
    }

    // A short accept timeout lets the loop notice SIGINT/SIGTERM even when idle.
    accept_timeout: timeval;
    accept_timeout.tv_sec = 1;
    setsockopt(server.fd, SOL_SOCKET, SO_RCVTIMEO, *accept_timeout, size_of(timeval));

    listen(server.fd, 128);
    return true;
}

// Run the worker pool and accept loop until a shutdown signal arrives.
http_run :: (server: *Http_Server) {
    Threads.init(*server.mutex);
    Threads.init(*server.not_empty);
    install_signal_handlers(server);

    // Fixed worker pool: bounded concurrency, no unbounded thread spawning.
    workers: [NUM_WORKERS] Threads.Thread;
    for *workers {
        Threads.thread_init(it, worker_proc);
        it.data = server;
        Threads.thread_start(it);
    }

    while server.running {
        client := accept(server.fd, null, null);
        if client < 0  continue; // timeout or interrupt: re-check running

        Threads.lock(*server.mutex);
        if server.count >= QUEUE_CAP {
            // Saturated: shed load rather than buffer unboundedly.
            Threads.unlock(*server.mutex);
            close(client);
            continue;
        }
        server.queue[server.tail] = client;
        server.tail = (server.tail + 1) % QUEUE_CAP;
        server.count += 1;
        Threads.wake(*server.not_empty);
        Threads.unlock(*server.mutex);
    }

    print("shutting down\n");

    // Wake every worker so each can observe running == false and exit.
    Threads.lock(*server.mutex);
    for 0..NUM_WORKERS-1  Threads.wake(*server.not_empty);
    Threads.unlock(*server.mutex);

    for *workers {
        while !Threads.thread_is_done(it, -1) {}
        Threads.thread_deinit(it);
    }
    close(server.fd);
}

#scope_file

// Signals carry no userdata, so the handler reaches the server through a global.
global_server: *Http_Server;

worker_proc :: (thread: *Threads.Thread) -> s64 {
    server := cast(*Http_Server) thread.data;
    while true {
        Threads.lock(*server.mutex);
        while server.count == 0 && server.running {
            Threads.wait(*server.not_empty, *server.mutex);
        }
        if server.count == 0 && !server.running {
            Threads.unlock(*server.mutex);
            break;
        }
        client := server.queue[server.head];
        server.head = (server.head + 1) % QUEUE_CAP;
        server.count -= 1;
        Threads.unlock(*server.mutex);

        handle_client(server, client);
    }
    return 0;
}

handle_client :: (server: *Http_Server, client: s32) {
    defer close(client);

    // Disable Nagle: send the small response immediately rather than waiting to
    // coalesce. Without this the respond-then-close path can stall on delayed ACKs.
    nodelay: s32 = 1;
    setsockopt(client, xx IPPROTO.IPPROTO_TCP, TCP_NODELAY, *nodelay, size_of(s32));

    // Per-connection timeouts defeat slowloris-style stalls.
    tv: timeval;
    tv.tv_sec = 15;
    setsockopt(client, SOL_SOCKET, SO_RCVTIMEO, *tv, size_of(timeval));
    setsockopt(client, SOL_SOCKET, SO_SNDTIMEO, *tv, size_of(timeval));

    // Read the whole request head instead of assuming it lands in one recv.
    buffer: [4096] u8;
    total := 0;
    while total < buffer.count {
        n := recv(client, buffer.data + total, cast(u64)(buffer.count - total), 0);
        if n <= 0  break;
        total += cast(int) n;
        if has_header_end(buffer.data, total)  break;
    }

    if str_eq(request_path(buffer.data, total), "/pdf") {
        pdf := build_pdf(server.pdf_text);
        defer free(pdf.data);

        header: [..]u8;
        defer array_free(header);
        pdf_append(*header, "HTTP/1.1 200 OK\r\nContent-Type: application/pdf\r\nContent-Length: ");
        pdf_append_int(*header, pdf.count);
        pdf_append(*header, "\r\nConnection: close\r\n\r\n");

        send_all(client, to_string(header));
        send_all(client, pdf);
    } else {
        send_all(client, server.response);
    }
}

// Parse the request-target out of "GET <path> HTTP/1.1", stopping at '?'.
request_path :: (buf: *u8, n: int) -> string {
    i := 0;
    while i < n && buf[i] != #char " "  i += 1; // skip method
    i += 1;
    start := i;
    while i < n && buf[i] != #char " " && buf[i] != #char "?"  i += 1;
    p: string = ---;
    p.data = buf + start;
    p.count = i - start;
    return p;
}

str_eq :: (a: string, b: string) -> bool {
    if a.count != b.count  return false;
    for 0..a.count - 1  if a[it] != b[it]  return false;
    return true;
}

to_string :: (a: [..]u8) -> string {
    s: string = ---;
    s.data = a.data;
    s.count = a.count;
    return s;
}

pdf_append :: (buf: *[..]u8, s: string) {
    old := buf.count;
    array_resize(buf, buf.count + s.count);
    memcpy(buf.data + old, s.data, s.count);
}

// Append decimal digits without touching temporary storage (runs per request).
pdf_append_int :: (buf: *[..]u8, n: int) {
    if n == 0 { array_add(buf, #char "0"); return; }
    digits: [20]u8;
    i := 0;
    v := n;
    while v > 0 { digits[i] = cast(u8)(#char "0" + (v % 10)); v /= 10; i += 1; }
    while i > 0 { i -= 1; array_add(buf, digits[i]); }
}

// 10-digit zero-padded offset for an xref entry.
pdf_append_pad10 :: (buf: *[..]u8, n: int) {
    digits: [10]u8;
    v := n;
    i := 9;
    while i >= 0 { digits[i] = cast(u8)(#char "0" + (v % 10)); v /= 10; i -= 1; }
    for 0..9  array_add(buf, digits[it]);
}

// Assemble a one-page PDF (text + embedded JPEG). Caller frees the returned data.
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
                pdf_append(*buf, to_string(content));
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

    // Hand ownership of the buffer's storage to the caller as a string.
    return to_string(buf);
}

send_all :: (fd: s32, data: string) -> bool {
    sent := 0;
    while sent < data.count {
        n := send(fd, data.data + sent, cast(u64)(data.count - sent), 0);
        if n <= 0  return false;
        sent += cast(int) n;
    }
    return true;
}

has_header_end :: (buf: *u8, n: int) -> bool {
    // Look for the blank line (CR LF CR LF) that terminates the request head.
    i := 0;
    while i <= n - 4 {
        if buf[i] == 13 && buf[i + 1] == 10 && buf[i + 2] == 13 && buf[i + 3] == 10  return true;
        i += 1;
    }
    return false;
}

handle_signal :: (sig: s32) #c_call {
    if global_server  global_server.running = false;
}

install_signal_handlers :: (server: *Http_Server) {
    global_server = server;
    sa: sigaction_t;
    sa.sa_handler = handle_signal;
    sigemptyset(*sa.sa_mask);
    sa.sa_flags = 0;
    sigaction(SIGINT, *sa, null);
    sigaction(SIGTERM, *sa, null);
}
