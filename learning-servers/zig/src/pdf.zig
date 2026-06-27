const std = @import("std");

const zap = @import("zap");

const jpeg = @embedFile("sample_jpg");

const content_json = @embedFile("content_json");
const Doc = struct { lines: [][]const u8 };
pub var lines: [][]const u8 = undefined;

const lines_per_page: usize = 45;
const font_size: usize = 11;
const line_step: usize = 16;
const top_y: usize = 740;

pub fn loadContent() !void {
    const parsed = try std.json.parseFromSlice(Doc, std.heap.c_allocator, content_json, .{ .ignore_unknown_fields = true });
    lines = parsed.value.lines;
}

fn appendInt(buf: *std.ArrayList(u8), alloc: std.mem.Allocator, n: usize) !void {
    var tmp: [20]u8 = undefined;
    try buf.appendSlice(alloc, std.fmt.bufPrint(&tmp, "{d}", .{n}) catch unreachable);
}

pub fn buildPdf(alloc: std.mem.Allocator, heading: []const u8) ![]u8 {
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

    try objects.append(alloc, try alloc.dupe(u8, "<< /Type /Catalog /Pages 2 0 R >>"));
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
        try objects.append(alloc, try o.toOwnedSlice(alloc));
    }
    try objects.append(alloc, try alloc.dupe(u8, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"));
    {
        var o: std.ArrayList(u8) = .empty;
        errdefer o.deinit(alloc);
        try o.appendSlice(alloc, "<< /Type /XObject /Subtype /Image /Width 240 /Height 160 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ");
        try appendInt(&o, alloc, jpeg.len);
        try o.appendSlice(alloc, " >>\nstream\n");
        try o.appendSlice(alloc, jpeg);
        try o.appendSlice(alloc, "\nendstream");
        try objects.append(alloc, try o.toOwnedSlice(alloc));
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

pub fn pdf(r: zap.Request) !void {
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
