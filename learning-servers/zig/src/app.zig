const std = @import("std");

const zap = @import("zap");

pub const host = "127.0.0.1";
pub const port: usize = 8080;

pub const App = struct {
    routes: std.StringHashMap(zap.HttpRequestFn),
    allocator: std.mem.Allocator,
    listener: zap.HttpListener = undefined,

    var _instance: *App = undefined;

    pub fn init(allocator: std.mem.Allocator) App {
        return .{ .routes = std.StringHashMap(zap.HttpRequestFn).init(allocator), .allocator = allocator };
    }

    pub fn deinit(self: *App) void {
        var it = self.routes.keyIterator();
        while (it.next()) |k| self.allocator.free(k.*);
        self.routes.deinit();
    }

    fn route(self: *App, method: []const u8, path: []const u8, handler: zap.HttpRequestFn) !void {
        const key = try std.fmt.allocPrint(self.allocator, "{s} {s}", .{ method, path });
        errdefer self.allocator.free(key);
        try self.routes.put(key, handler);
    }

    pub fn get(self: *App, path: []const u8, handler: zap.HttpRequestFn) !void {
        try self.route("GET", path, handler);
    }
    pub fn post(self: *App, path: []const u8, handler: zap.HttpRequestFn) !void {
        try self.route("POST", path, handler);
    }
    pub fn put(self: *App, path: []const u8, handler: zap.HttpRequestFn) !void {
        try self.route("PUT", path, handler);
    }
    pub fn delete(self: *App, path: []const u8, handler: zap.HttpRequestFn) !void {
        try self.route("DELETE", path, handler);
    }

    fn onRequest(r: zap.Request) !void {
        const self = _instance;
        const method = r.method orelse "GET";
        const path = r.path orelse "/";
        var buf: [1024]u8 = undefined;
        const key = std.fmt.bufPrint(&buf, "{s} {s}", .{ method, path }) catch {
            r.setStatus(.uri_too_long);
            try r.sendBody("414 URI Too Long");
            return;
        };
        if (self.routes.get(key)) |handler| {
            try handler(r);
        } else {
            r.setStatus(.not_found);
            try r.sendBody("404 Not Found");
        }
    }

    pub fn listen(self: *App) !void {
        _instance = self;
        self.listener = zap.HttpListener.init(.{
            .interface = host,
            .port = port,
            .on_request = onRequest,
            .log = false,
            .max_clients = 100_000,
        });
        try self.listener.listen();
    }
};
