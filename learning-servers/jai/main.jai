#import "Basic";
#import "Socket";
#import "POSIX";
Threads :: #import "Thread";

NUM_WORKERS :: 8;
QUEUE_CAP   :: 256;

Server :: struct {
    queue:     [QUEUE_CAP] s32;
    head:      int;
    tail:      int;
    count:     int;
    mutex:     Threads.Mutex;
    not_empty: Threads.Condition_Variable;
    running:   bool = true;
}

server: Server;
response: string; // built once in main, read by every worker

BODY :: "Hello from Jai!\n";

main :: () {
    server_fd := socket(AF_INET, .SOCK_STREAM, 0);
    if server_fd < 0 {
        log_error("failed to create socket\n");
        return;
    }

    opt: s32 = 1;
    setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, *opt, size_of(s32));

    addr: sockaddr_in;
    addr.sin_family = AF_INET;
    addr.sin_port = htons(8080);
    addr.sin_addr.s_addr = htonl(INADDR_LOOPBACK);

    if bind(server_fd, cast(*sockaddr) *addr, size_of(sockaddr_in)) < 0 {
        log_error("bind failed\n");
        return;
    }

    // A short accept timeout lets the loop notice SIGINT/SIGTERM even when idle.
    accept_timeout: timeval;
    accept_timeout.tv_sec = 1;
    setsockopt(server_fd, SOL_SOCKET, SO_RCVTIMEO, *accept_timeout, size_of(timeval));

    listen(server_fd, 128);

    response = sprint("HTTP/1.1 200 OK\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Length: %\r\nConnection: close\r\n\r\n%", BODY.count, BODY);

    Threads.init(*server.mutex);
    Threads.init(*server.not_empty);
    install_signal_handlers();

    // Fixed worker pool: bounded concurrency, no unbounded thread spawning.
    workers: [NUM_WORKERS] Threads.Thread;
    for *workers {
        Threads.thread_init(it, worker_proc);
        Threads.thread_start(it);
    }

    print("listening on http://127.0.0.1:8080\n");

    while server.running {
        client := accept(server_fd, null, null);
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
    close(server_fd);
}

worker_proc :: (thread: *Threads.Thread) -> s64 {
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

        handle_client(client);
    }
    return 0;
}

handle_client :: (client: s32) {
    defer close(client);

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

    send_all(client, response);
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
    server.running = false;
}

install_signal_handlers :: () {
    sa: sigaction_t;
    sa.sa_handler = handle_signal;
    sigemptyset(*sa.sa_mask);
    sa.sa_flags = 0;
    sigaction(SIGINT, *sa, null);
    sigaction(SIGTERM, *sa, null);
}
