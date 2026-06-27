const std = @import("std");

const zap = @import("zap");

const host = "127.0.0.1";
const port: usize = 8080;
const body = "Hello from Zig!\n";

// Baked into the binary at compile time; per-request work is assembling the PDF.
// 240x160 baseline JPEG, embedded via /DCTDecode.
const jpeg = @embedFile("sample_jpg");

// The text to render, embedded and parsed once at startup (before zap.start
// forks, so workers inherit it). ~100 pages of lines.
const content_json = @embedFile("content_json");
const Doc = struct { lines: [][]const u8 };
var lines: [][]const u8 = undefined;

const lines_per_page: usize = 45;
const font_size: usize = 11;
const line_step: usize = 16;
const top_y: usize = 740;

const log = std.log.scoped(.server);

fn appendInt(buf: *std.ArrayList(u8), alloc: std.mem.Allocator, n: usize) !void {
    var tmp: [20]u8 = undefined;
    try buf.appendSlice(alloc, std.fmt.bufPrint(&tmp, "{d}", .{n}) catch unreachable);
}

// One cover page (heading + JPEG) then the JSON text paginated 45 lines/page.
fn buildPdf(alloc: std.mem.Allocator, heading: []const u8) ![]u8 {
    var contents: std.ArrayList([]u8) = .empty;
    defer {
        for (contents.items) |c| alloc.free(c);
        contents.deinit(alloc);
    }

    {
        var c: std.ArrayList(u8) = .empty;
        errdefer c.deinit(alloc);
        try c.appendSlice(alloc, "BT\n/F1 24 Tf\n72 720 Td\n(");
        try c.appendSlice(alloc, heading);
        try c.appendSlice(alloc, ") Tj\nET\nq\n240 0 0 160 72 520 cm\n/Im1 Do\nQ\n");
        try contents.append(alloc, try c.toOwnedSlice(alloc));
    }
    var p: usize = 0;
    while (p * lines_per_page < lines.len) : (p += 1) {
        const start = p * lines_per_page;
        const stop = @min(start + lines_per_page, lines.len);
        var c: std.ArrayList(u8) = .empty;
        errdefer c.deinit(alloc);
        try c.appendSlice(alloc, "BT\n/F1 ");
        try appendInt(&c, alloc, font_size);
        try c.appendSlice(alloc, " Tf\n72 ");
        try appendInt(&c, alloc, top_y);
        try c.appendSlice(alloc, " Td\n");
        var j: usize = start;
        while (j < stop) : (j += 1) {
            if (j == start) {
                try c.appendSlice(alloc, "(");
            } else {
                try c.appendSlice(alloc, "0 -");
                try appendInt(&c, alloc, line_step);
                try c.appendSlice(alloc, " Td\n(");
            }
            try c.appendSlice(alloc, lines[j]);
            try c.appendSlice(alloc, ") Tj\n");
        }
        try c.appendSlice(alloc, "ET\n");
        try contents.append(alloc, try c.toOwnedSlice(alloc));
    }
    const num_pages = contents.items.len;

    var objects: std.ArrayList([]u8) = .empty;
    defer {
        for (objects.items) |o| alloc.free(o);
        objects.deinit(alloc);
    }

    try objects.append(alloc, try alloc.dupe(u8, "<< /Type /Catalog /Pages 2 0 R >>")); // 1
    {
        var o: std.ArrayList(u8) = .empty;
        errdefer o.deinit(alloc);
        try o.appendSlice(alloc, "<< /Type /Pages /Kids [");
        var k: usize = 0;
        while (k < num_pages) : (k += 1) {
            if (k > 0) try o.appendSlice(alloc, " ");
            try appendInt(&o, alloc, 5 + 2 * k);
            try o.appendSlice(alloc, " 0 R");
        }
        try o.appendSlice(alloc, "] /Count ");
        try appendInt(&o, alloc, num_pages);
        try o.appendSlice(alloc, " >>");
        try objects.append(alloc, try o.toOwnedSlice(alloc)); // 2
    }
    try objects.append(alloc, try alloc.dupe(u8, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")); // 3
    {
        var o: std.ArrayList(u8) = .empty;
        errdefer o.deinit(alloc);
        try o.appendSlice(alloc, "<< /Type /XObject /Subtype /Image /Width 240 /Height 160 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ");
        try appendInt(&o, alloc, jpeg.len);
        try o.appendSlice(alloc, " >>\nstream\n");
        try o.appendSlice(alloc, jpeg);
        try o.appendSlice(alloc, "\nendstream");
        try objects.append(alloc, try o.toOwnedSlice(alloc)); // 4
    }
    {
        var k: usize = 0;
        while (k < num_pages) : (k += 1) {
            var po: std.ArrayList(u8) = .empty;
            errdefer po.deinit(alloc);
            try po.appendSlice(alloc, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> /XObject << /Im1 4 0 R >> >> /Contents ");
            try appendInt(&po, alloc, 6 + 2 * k);
            try po.appendSlice(alloc, " 0 R >>");
            try objects.append(alloc, try po.toOwnedSlice(alloc));

            var co: std.ArrayList(u8) = .empty;
            errdefer co.deinit(alloc);
            try co.appendSlice(alloc, "<< /Length ");
            try appendInt(&co, alloc, contents.items[k].len);
            try co.appendSlice(alloc, " >>\nstream\n");
            try co.appendSlice(alloc, contents.items[k]);
            try co.appendSlice(alloc, "endstream");
            try objects.append(alloc, try co.toOwnedSlice(alloc));
        }
    }

    var buf: std.ArrayList(u8) = .empty;
    errdefer buf.deinit(alloc);
    try buf.appendSlice(alloc, "%PDF-1.4\n%\xe2\xe3\xcf\xd3\n");
    var offsets: std.ArrayList(usize) = .empty;
    defer offsets.deinit(alloc);
    for (objects.items, 0..) |obj, idx| {
        try offsets.append(alloc, buf.items.len);
        try appendInt(&buf, alloc, idx + 1);
        try buf.appendSlice(alloc, " 0 obj\n");
        try buf.appendSlice(alloc, obj);
        try buf.appendSlice(alloc, "\nendobj\n");
    }
    const xref_off = buf.items.len;
    const n = objects.items.len;
    try buf.appendSlice(alloc, "xref\n0 ");
    try appendInt(&buf, alloc, n + 1);
    try buf.appendSlice(alloc, "\n0000000000 65535 f\r\n");
    for (offsets.items) |off| {
        var tmp: [10]u8 = undefined;
        try buf.appendSlice(alloc, std.fmt.bufPrint(&tmp, "{d:0>10}", .{off}) catch unreachable);
        try buf.appendSlice(alloc, " 00000 n\r\n");
    }
    try buf.appendSlice(alloc, "trailer\n<< /Size ");
    try appendInt(&buf, alloc, n + 1);
    try buf.appendSlice(alloc, " /Root 1 0 R >>\nstartxref\n");
    try appendInt(&buf, alloc, xref_off);
    try buf.appendSlice(alloc, "\n%%EOF\n");

    return buf.toOwnedSlice(alloc);
}

// Heavy, real-world incoming-request validation. Zig has no validation library,
// so std.json does the structural parse (typed fields; unknown fields are an
// error by default) and the field constraints are checked by hand below.
const Item = struct { sku: []const u8, qty: i64, price: f64 };
const Payload = struct {
    username: []const u8,
    email: []const u8,
    age: i64,
    password: []const u8,
    website: []const u8,
    country: []const u8,
    tags: [][]const u8,
    items: []Item,
};

fn validUsername(s: []const u8) bool {
    if (s.len < 3 or s.len > 30) return false;
    for (s) |ch| {
        const ok = (ch >= 'a' and ch <= 'z') or (ch >= '0' and ch <= '9') or ch == '_';
        if (!ok) return false;
    }
    return true;
}

fn validEmail(s: []const u8) bool {
    if (s.len == 0 or s.len > 100) return false;
    for (s) |ch| if (ch == ' ') return false;
    const at = std.mem.indexOfScalar(u8, s, '@') orelse return false;
    if (at == 0) return false;
    const domain = s[at + 1 ..];
    if (std.mem.indexOfScalar(u8, domain, '@') != null) return false;
    const dot = std.mem.indexOfScalar(u8, domain, '.') orelse return false;
    return dot != 0 and dot != domain.len - 1;
}

fn validPassword(s: []const u8) bool {
    if (s.len < 8 or s.len > 100) return false;
    var lo = false;
    var up = false;
    var di = false;
    for (s) |ch| {
        if (ch >= 'a' and ch <= 'z') {
            lo = true;
        } else if (ch >= 'A' and ch <= 'Z') {
            up = true;
        } else if (ch >= '0' and ch <= '9') {
            di = true;
        }
    }
    return lo and up and di;
}

fn validSku(s: []const u8) bool {
    if (s.len != 7 or s[3] != '-') return false;
    for (s[0..3]) |ch| if (ch < 'A' or ch > 'Z') return false;
    for (s[4..7]) |ch| if (ch < '0' or ch > '9') return false;
    return true;
}

fn validCountry(s: []const u8) bool {
    const set = [_][]const u8{ "US", "CA", "GB", "DE", "FR", "JP", "AU", "BR", "IN", "CN" };
    for (set) |x| if (std.mem.eql(u8, x, s)) return true;
    return false;
}

fn validatePayload(p: Payload) bool {
    if (!validUsername(p.username)) return false;
    if (!validEmail(p.email)) return false;
    if (p.age < 13 or p.age > 120) return false;
    if (!validPassword(p.password)) return false;
    if (p.website.len > 200) return false;
    if (!std.mem.startsWith(u8, p.website, "http://") and !std.mem.startsWith(u8, p.website, "https://")) return false;
    if (!validCountry(p.country)) return false;
    if (p.tags.len < 1 or p.tags.len > 10) return false;
    for (p.tags) |t| if (t.len < 1 or t.len > 20) return false;
    if (p.items.len < 1 or p.items.len > 50) return false;
    for (p.items) |it| {
        if (!validSku(it.sku)) return false;
        if (it.qty < 1 or it.qty > 999) return false;
        if (it.price < 0 or it.price > 100000) return false;
    }
    return true;
}

fn validate(r: zap.Request) !void {
    r.setHeader("content-type", "application/json") catch {};
    const req_body = r.body orelse {
        r.setStatus(.bad_request);
        try r.sendBody("{\"valid\":false}");
        return;
    };
    const parsed = std.json.parseFromSlice(Payload, std.heap.c_allocator, req_body, .{}) catch {
        r.setStatus(.bad_request);
        try r.sendBody("{\"valid\":false}");
        return;
    };
    defer parsed.deinit();
    if (validatePayload(parsed.value)) {
        try r.sendBody("{\"valid\":true}");
    } else {
        r.setStatus(.bad_request);
        try r.sendBody("{\"valid\":false}");
    }
}

// Fastify-style app: `app.get("/hello", handler)`. zap's on_request is a bare
// function pointer with no user-data slot, so we follow zap.Router's pattern and
// keep the active App in a singleton the static callback reaches through.
//
// Routes are keyed by "METHOD path" (e.g. "GET /hello") in an exact-match map, so
// the same path under different verbs is just two entries. The map is populated
// before zap.start forks its workers, then read-only — concurrent reads are safe.
const App = struct {
    routes: std.StringHashMap(zap.HttpRequestFn),
    allocator: std.mem.Allocator,
    // zap stashes a pointer to this listener in a global that the request
    // callback dereferences per request, so it must outlive listen(). Keeping it
    // as a field ties its lifetime to the App.
    listener: zap.HttpListener = undefined,

    var _instance: *App = undefined;

    fn init(allocator: std.mem.Allocator) App {
        return .{ .routes = std.StringHashMap(zap.HttpRequestFn).init(allocator), .allocator = allocator };
    }

    fn deinit(self: *App) void {
        var it = self.routes.keyIterator();
        while (it.next()) |k| self.allocator.free(k.*);
        self.routes.deinit();
    }

    fn route(self: *App, method: []const u8, path: []const u8, handler: zap.HttpRequestFn) !void {
        const key = try std.fmt.allocPrint(self.allocator, "{s} {s}", .{ method, path });
        errdefer self.allocator.free(key);
        try self.routes.put(key, handler);
    }

    fn get(self: *App, path: []const u8, handler: zap.HttpRequestFn) !void {
        try self.route("GET", path, handler);
    }
    fn post(self: *App, path: []const u8, handler: zap.HttpRequestFn) !void {
        try self.route("POST", path, handler);
    }
    fn put(self: *App, path: []const u8, handler: zap.HttpRequestFn) !void {
        try self.route("PUT", path, handler);
    }
    fn delete(self: *App, path: []const u8, handler: zap.HttpRequestFn) !void {
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

    fn listen(self: *App) !void {
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

fn pdf(r: zap.Request) !void {
    const alloc = std.heap.c_allocator;
    const doc = buildPdf(alloc, "Hello from Zig! PDF benchmark.") catch {
        r.setStatus(.internal_server_error);
        try r.sendBody("error");
        return;
    };
    defer alloc.free(doc);
    r.setHeader("content-type", "application/pdf") catch {};
    try r.sendBody(doc);
}

pub fn main() !void {
    // Parse the embedded JSON once before zap forks its workers; the parsed data
    // lives for the process lifetime (intentionally not freed).
    const parsed = try std.json.parseFromSlice(Doc, std.heap.c_allocator, content_json, .{ .ignore_unknown_fields = true });
    lines = parsed.value.lines;

    var app = App.init(std.heap.c_allocator);
    defer app.deinit();

    try app.get("/", root);
    try app.get("/hello", helloGet);
    try app.post("/hello", helloPost);
    try app.get("/pdf", pdf);
    try app.post("/validate", validate);

    try app.listen();

    log.info("listening on http://{s}:{d}", .{ host, port });

    // facil.io (under zap) installs its own SIGINT/SIGTERM handlers and drains
    // in-flight work before zap.start returns. Prefork workers each run their own
    // reactor and accept() independently, so connection-churn (one request per
    // connection) scales across processes; threads fan request handling per worker.
    zap.start(.{ .threads = 4, .workers = 2 });

    log.info("shutting down", .{});
}
