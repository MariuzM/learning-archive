#import "Basic";
#import "Socket";
#import "POSIX";
Threads :: #import "Thread";

NUM_WORKERS :: 8;
QUEUE_CAP   :: 256;

Response :: struct {
    status:       int = 200;
    content_type: string = "text/plain; charset=utf-8";
    body:         string;
    free_body:    bool;
}

Handler :: #type (body: string) -> Response;

Route :: struct {
    method:  string;
    path:    string;
    handler: Handler;
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

    routes:    [..]Route;
}

app_get :: (server: *Http_Server, path: string, handler: Handler) {
    array_add(*server.routes, .{ method = "GET", path = path, handler = handler });
}

app_post :: (server: *Http_Server, path: string, handler: Handler) {
    array_add(*server.routes, .{ method = "POST", path = path, handler = handler });
}

find_route :: (server: *Http_Server, method: string, path: string) -> *Route {
    for *server.routes  if str_eq(it.method, method) && str_eq(it.path, path)  return it;
    return null;
}

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

    accept_timeout: timeval;
    accept_timeout.tv_sec = 1;
    setsockopt(server.fd, SOL_SOCKET, SO_RCVTIMEO, *accept_timeout, size_of(timeval));

    listen(server.fd, 128);
    return true;
}

http_run :: (server: *Http_Server) {
    LINES = parse_lines(CONTENT);

    Threads.init(*server.mutex);
    Threads.init(*server.not_empty);
    install_signal_handlers(server);

    workers: [NUM_WORKERS] Threads.Thread;
    for *workers {
        Threads.thread_init(it, worker_proc);
        it.data = server;
        Threads.thread_start(it);
    }

    while server.running {
        client := accept(server.fd, null, null);
        if client < 0  continue;

        Threads.lock(*server.mutex);
        if server.count >= QUEUE_CAP {
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

    Threads.lock(*server.mutex);
    for 0..NUM_WORKERS-1  Threads.wake(*server.not_empty);
    Threads.unlock(*server.mutex);

    for *workers {
        while !Threads.thread_is_done(it, -1) {}
        Threads.thread_deinit(it);
    }
    close(server.fd);
}

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

    nodelay: s32 = 1;
    setsockopt(client, xx IPPROTO.IPPROTO_TCP, TCP_NODELAY, *nodelay, size_of(s32));

    tv: timeval;
    tv.tv_sec = 15;
    setsockopt(client, SOL_SOCKET, SO_RCVTIMEO, *tv, size_of(timeval));
    setsockopt(client, SOL_SOCKET, SO_SNDTIMEO, *tv, size_of(timeval));

    buffer: [4096] u8;
    total := 0;
    while total < buffer.count {
        n := recv(client, buffer.data + total, cast(u64)(buffer.count - total), 0);
        if n <= 0  break;
        total += cast(int) n;
        if has_header_end(buffer.data, total)  break;
    }

    method := request_method(buffer.data, total);
    path   := request_path(buffer.data, total);

    route := find_route(server, method, path);
    if route == null {
        send_all(client, "HTTP/1.1 404 Not Found\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Length: 13\r\nConnection: close\r\n\r\n404 Not Found");
        return;
    }

    resp := route.handler(request_body(buffer.data, total));
    send_response(client, resp);
    if resp.free_body  free(resp.body.data);
}

send_response :: (client: s32, resp: Response) {
    header: [..]u8;
    defer array_free(header);
    pdf_append(*header, "HTTP/1.1 ");
    pdf_append_int(*header, resp.status);
    pdf_append(*header, ifx resp.status == 400 then " Bad Request\r\n" else " OK\r\n");
    pdf_append(*header, "Content-Type: ");
    pdf_append(*header, resp.content_type);
    pdf_append(*header, "\r\nContent-Length: ");
    pdf_append_int(*header, resp.body.count);
    pdf_append(*header, "\r\nConnection: close\r\n\r\n");

    send_all(client, to_string(header));
    send_all(client, resp.body);
}

request_body :: (buf: *u8, n: int) -> string {
    i := 0;
    while i <= n - 4 {
        if buf[i] == 13 && buf[i + 1] == 10 && buf[i + 2] == 13 && buf[i + 3] == 10 {
            b: string = ---;
            b.data = buf + i + 4;
            b.count = n - (i + 4);
            return b;
        }
        i += 1;
    }
    empty: string;
    return empty;
}

request_method :: (buf: *u8, n: int) -> string {
    i := 0;
    while i < n && buf[i] != #char " "  i += 1;
    m: string = ---;
    m.data = buf;
    m.count = i;
    return m;
}

request_path :: (buf: *u8, n: int) -> string {
    i := 0;
    while i < n && buf[i] != #char " "  i += 1;
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
