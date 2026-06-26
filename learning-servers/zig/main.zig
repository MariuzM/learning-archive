const std = @import("std");
const zap = @import("zap");

const host = "127.0.0.1";
const port: usize = 8080;
const body = "Hello from Zig!\n";

// Baked into the binary at compile time; per-request work is assembling the PDF.
// 240x160 baseline JPEG, embedded via /DCTDecode.
const jpeg = @embedFile("sample_jpg");

const log = std.log.scoped(.server);

fn appendInt(buf: *std.ArrayList(u8), alloc: std.mem.Allocator, n: usize) !void {
    var tmp: [20]u8 = undefined;
    try buf.appendSlice(alloc, std.fmt.bufPrint(&tmp, "{d}", .{n}) catch unreachable);
}

fn buildPdf(alloc: std.mem.Allocator, text: []const u8) ![]u8 {
    var content: std.ArrayList(u8) = .empty;
    defer content.deinit(alloc);
    try content.appendSlice(alloc, "BT\n/F1 24 Tf\n72 720 Td\n(");
    try content.appendSlice(alloc, text);
    try content.appendSlice(alloc, ") Tj\nET\nq\n240 0 0 160 72 520 cm\n/Im1 Do\nQ\n");

    var buf: std.ArrayList(u8) = .empty;
    errdefer buf.deinit(alloc);
    try buf.appendSlice(alloc, "%PDF-1.4\n%\xe2\xe3\xcf\xd3\n");

    var offsets: [6]usize = undefined;
    var i: usize = 0;
    while (i < 6) : (i += 1) {
        offsets[i] = buf.items.len;
        try appendInt(&buf, alloc, i + 1);
        try buf.appendSlice(alloc, " 0 obj\n");
        switch (i) {
            0 => try buf.appendSlice(alloc, "<< /Type /Catalog /Pages 2 0 R >>"),
            1 => try buf.appendSlice(alloc, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>"),
            2 => try buf.appendSlice(alloc, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> /XObject << /Im1 5 0 R >> >> /Contents 6 0 R >>"),
            3 => try buf.appendSlice(alloc, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"),
            4 => {
                try buf.appendSlice(alloc, "<< /Type /XObject /Subtype /Image /Width 240 /Height 160 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ");
                try appendInt(&buf, alloc, jpeg.len);
                try buf.appendSlice(alloc, " >>\nstream\n");
                try buf.appendSlice(alloc, jpeg);
                try buf.appendSlice(alloc, "\nendstream");
            },
            5 => {
                try buf.appendSlice(alloc, "<< /Length ");
                try appendInt(&buf, alloc, content.items.len);
                try buf.appendSlice(alloc, " >>\nstream\n");
                try buf.appendSlice(alloc, content.items);
                try buf.appendSlice(alloc, "endstream");
            },
            else => unreachable,
        }
        try buf.appendSlice(alloc, "\nendobj\n");
    }

    const xref_off = buf.items.len;
    try buf.appendSlice(alloc, "xref\n0 7\n0000000000 65535 f\r\n");
    for (offsets) |off| {
        var tmp: [10]u8 = undefined;
        try buf.appendSlice(alloc, std.fmt.bufPrint(&tmp, "{d:0>10}", .{off}) catch unreachable);
        try buf.appendSlice(alloc, " 00000 n\r\n");
    }
    try buf.appendSlice(alloc, "trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n");
    try appendInt(&buf, alloc, xref_off);
    try buf.appendSlice(alloc, "\n%%EOF\n");

    return buf.toOwnedSlice(alloc);
}

fn onRequest(r: zap.Request) !void {
    const path = r.path orelse "/";
    if (std.mem.eql(u8, path, "/pdf")) {
        const alloc = std.heap.c_allocator;
        const doc = buildPdf(alloc, "Hello from Zig! PDF benchmark.") catch {
            try r.sendBody("error");
            return;
        };
        defer alloc.free(doc);
        r.setHeader("content-type", "application/pdf") catch {};
        try r.sendBody(doc);
    } else {
        r.setHeader("content-type", "text/plain; charset=utf-8") catch {};
        try r.sendBody(body);
    }
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
