const std = @import("std");

const zap = @import("zap");

const app_mod = @import("app.zig");
const pdf_mod = @import("pdf.zig");
const validate_mod = @import("validate.zig");

const App = app_mod.App;
const host = app_mod.host;
const port = app_mod.port;
const body = "Hello from Zig!\n";

const log = std.log.scoped(.server);

fn helloGet(r: zap.Request) !void {
    r.setHeader("content-type", "text/plain; charset=utf-8") catch {};
    try r.sendBody("GET hello from Zig!\n");
}

fn helloPost(r: zap.Request) !void {
    r.setHeader("content-type", "text/plain; charset=utf-8") catch {};
    try r.sendBody("POST hello from Zig!\n");
}

fn root(r: zap.Request) !void {
    r.setHeader("content-type", "text/plain; charset=utf-8") catch {};
    try r.sendBody(body);
}

pub fn main() !void {
    try pdf_mod.loadContent();

    var app = App.init(std.heap.c_allocator);
    defer app.deinit();

    try app.get("/", root);
    try app.get("/hello", helloGet);
    try app.post("/hello", helloPost);
    try app.get("/pdf", pdf_mod.pdf);
    try app.post("/validate", validate_mod.validate);

    try app.listen();

    log.info("listening on http://{s}:{d}", .{ host, port });

    zap.start(.{ .threads = 4, .workers = 2 });

    log.info("shutting down", .{});
}
