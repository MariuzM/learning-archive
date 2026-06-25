const std = @import("std");
const Io = std.Io;
const posix = std.posix;

const log = std.log.scoped(.server);

const host = "127.0.0.1";
const port: u16 = 8080;
const body = "Hello from Zig!\n";

// Set by the signal handler; polled by main to begin a clean shutdown.
var stop = std.atomic.Value(bool).init(false);

fn requestStop(_: posix.SIG) callconv(.c) void {
    stop.store(true, .seq_cst);
}

pub fn main() !void {
    var debug_allocator: std.heap.DebugAllocator(.{}) = .init;
    defer _ = debug_allocator.deinit();
    const gpa = debug_allocator.allocator();

    var threaded: Io.Threaded = .init(gpa, .{});
    defer threaded.deinit();
    const io = threaded.io();

    installSignalHandlers();

    const address = try Io.net.IpAddress.parse(host, port);
    var server = try address.listen(io, .{ .reuse_address = true });
    defer server.deinit(io);

    log.info("listening on http://{s}:{d}", .{ host, port });

    // Run the accept loop on its own thread so main can wait for a signal and
    // then cancel it. Canceling makes the blocked accept() return error.Canceled
    // through the IO's own mechanism (closing the fd would panic the runtime).
    var accept_loop = try io.concurrent(acceptLoop, .{ io, &server });

    while (!stop.load(.seq_cst)) {
        const ts = posix.timespec{ .sec = 0, .nsec = 200 * std.time.ns_per_ms };
        _ = std.c.nanosleep(&ts, null);
    }

    log.info("shutting down", .{});
    accept_loop.cancel(io);
}

fn acceptLoop(io: Io, server: *Io.net.Server) void {
    while (!stop.load(.seq_cst)) {
        const stream = server.accept(io) catch |e| {
            if (e == error.Canceled) break;
            if (stop.load(.seq_cst)) break;
            log.warn("accept failed: {t}", .{e});
            continue;
        };

        // One detached worker per connection keeps slow clients from blocking
        // the accept loop. The handler owns the stream and closes it.
        const worker = std.Thread.spawn(.{}, handleConnection, .{ io, stream }) catch |e| {
            log.warn("spawn failed: {t}", .{e});
            stream.close(io);
            continue;
        };
        worker.detach();
    }
}

fn handleConnection(io: Io, stream: Io.net.Stream) void {
    defer stream.close(io);

    // Reject slowloris-style clients that open a socket and then stall.
    setSocketTimeout(stream.socket.handle, 15);

    var read_buf: [8 * 1024]u8 = undefined;
    var write_buf: [8 * 1024]u8 = undefined;
    var reader = stream.reader(io, &read_buf);
    var writer = stream.writer(io, &write_buf);

    var http_server = std.http.Server.init(&reader.interface, &writer.interface);

    // Loop so HTTP/1.1 keep-alive connections can serve many requests.
    while (true) {
        var request = http_server.receiveHead() catch |e| switch (e) {
            error.HttpConnectionClosing => return,
            else => {
                log.warn("receiveHead failed: {t}", .{e});
                return;
            },
        };

        request.respond(body, .{
            .extra_headers = &.{
                .{ .name = "content-type", .value = "text/plain; charset=utf-8" },
            },
        }) catch |e| {
            log.warn("respond failed: {t}", .{e});
            return;
        };
    }
}

fn setSocketTimeout(fd: Io.net.Socket.Handle, seconds: u32) void {
    const tv = posix.timeval{ .sec = @intCast(seconds), .usec = 0 };
    const bytes = std.mem.asBytes(&tv);
    posix.setsockopt(fd, posix.SOL.SOCKET, posix.SO.RCVTIMEO, bytes) catch {};
    posix.setsockopt(fd, posix.SOL.SOCKET, posix.SO.SNDTIMEO, bytes) catch {};
}

fn installSignalHandlers() void {
    var act = posix.Sigaction{
        .handler = .{ .handler = requestStop },
        .mask = posix.sigemptyset(),
        .flags = 0,
    };
    posix.sigaction(posix.SIG.INT, &act, null);
    posix.sigaction(posix.SIG.TERM, &act, null);
}
