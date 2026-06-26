const std = @import("std");
const zap = @import("zap");

const host = "127.0.0.1";
const port: usize = 8080;
const body = "Hello from Zig!\n";

const log = std.log.scoped(.server);

fn onRequest(r: zap.Request) !void {
    r.setHeader("content-type", "text/plain; charset=utf-8") catch {};
    try r.sendBody(body);
}

pub fn main() !void {
    var listener = zap.HttpListener.init(.{
        .interface = host,
        .port = port,
        .on_request = onRequest,
        .log = false,
        .max_clients = 100_000,
    });
    try listener.listen();

    log.info("listening on http://{s}:{d}", .{ host, port });

    // facil.io (under zap) installs its own SIGINT/SIGTERM handlers and drains
    // in-flight work before zap.start returns. Prefork workers each run their own
    // reactor and accept() independently, so connection-churn (one request per
    // connection) scales across processes; threads fan request handling per worker.
    zap.start(.{
        .threads = 4,
        .workers = 2,
    });

    log.info("shutting down", .{});
}
