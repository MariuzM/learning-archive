const std = @import("std");

const Range = struct { s: usize, e: usize };
const ParsedUint = struct { v: u32, next: usize };
const ParsedName = struct { name: []const u8, next: usize };

fn isWs(b: u8) bool {
    return switch (b) {
        0x00, 0x09, 0x0A, 0x0C, 0x0D, 0x20 => true,
        else => false,
    };
}

fn isDelim(b: u8) bool {
    return switch (b) {
        '(', ')', '<', '>', '[', ']', '{', '}', '/', '%' => true,
        else => false,
    };
}

fn find(hay: []const u8, from: usize, needle: []const u8) ?usize {
    if (from > hay.len) return null;
    return std.mem.indexOfPos(u8, hay, from, needle);
}

fn skipWs(d: []const u8, i: usize) usize {
    var j = i;
    while (j < d.len and isWs(d[j])) j += 1;
    return j;
}

fn parseUint(d: []const u8, i: usize) ?ParsedUint {
    var j = i;
    var v: u32 = 0;
    while (j < d.len and d[j] >= '0' and d[j] <= '9') : (j += 1) {
        v = v * 10 + (d[j] - '0');
    }
    if (j == i) return null;
    return .{ .v = v, .next = j };
}

fn tokenBounded(d: []const u8, end: usize) bool {
    return end >= d.len or isWs(d[end]) or isDelim(d[end]);
}

fn readName(d: []const u8, i: usize) ?ParsedName {
    if (i >= d.len or d[i] != '/') return null;
    var j = i + 1;
    while (j < d.len and !isWs(d[j]) and !isDelim(d[j])) j += 1;
    return .{ .name = d[i + 1 .. j], .next = j };
}

fn nameHasValue(d: []const u8, key: []const u8, val: []const u8) bool {
    var from: usize = 0;
    while (find(d, from, key)) |p| {
        const j = skipWs(d, p + key.len);
        if (std.mem.startsWith(u8, d[j..], val) and tokenBounded(d, j + val.len)) return true;
        from = p + key.len;
    }
    return false;
}

fn parseRef(d: []const u8, i: usize) ?ParsedUint {
    const num = parseUint(d, i) orelse return null;
    const b = skipWs(d, num.next);
    const g = parseUint(d, b) orelse return null;
    const e = skipWs(d, g.next);
    if (e < d.len and d[e] == 'R') return .{ .v = num.v, .next = e + 1 };
    return null;
}

fn parseObjects(gpa: std.mem.Allocator, d: []const u8) !std.AutoHashMap(u32, Range) {
    var objs = std.AutoHashMap(u32, Range).init(gpa);
    var i: usize = 0;
    while (i < d.len) {
        const boundary = i == 0 or isWs(d[i - 1]) or isDelim(d[i - 1]);
        if (boundary and d[i] >= '0' and d[i] <= '9') {
            if (parseUint(d, i)) |num| {
                const b = skipWs(d, num.next);
                if (b > num.next) {
                    if (parseUint(d, b)) |_gen| {
                        const e = skipWs(d, _gen.next);
                        if (e > _gen.next and std.mem.startsWith(u8, d[e..], "obj") and tokenBounded(d, e + 3)) {
                            const start = e + 3;
                            if (find(d, start, "endobj")) |end| {
                                try objs.put(num.v, .{ .s = start, .e = end });
                                i = end + 6;
                                continue;
                            }
                        }
                    }
                }
            }
        }
        i += 1;
    }
    return objs;
}

fn streamBytes(d: []const u8, range: Range) ?[]const u8 {
    const kw = find(d[0..range.e], range.s, "stream") orelse return null;
    var p = kw + 6;
    if (std.mem.startsWith(u8, d[p..], "\r\n")) {
        p += 2;
    } else if (p < d.len and (d[p] == '\n' or d[p] == '\r')) {
        p += 1;
    }
    const end = find(d[0..range.e], p, "endstream") orelse return null;
    return d[p..end];
}

fn inflateZlib(gpa: std.mem.Allocator, src: []const u8) ?[]u8 {
    var in: std.Io.Reader = .fixed(src);
    var win: [std.compress.flate.max_window_len]u8 = undefined;
    var d: std.compress.flate.Decompress = .init(&in, .zlib, &win);
    return d.reader.allocRemaining(gpa, .unlimited) catch null;
}

fn countNameDo(content: []const u8, name: []const u8) usize {
    var buf: [256]u8 = undefined;
    if (name.len + 1 > buf.len) return 0;
    buf[0] = '/';
    @memcpy(buf[1 .. 1 + name.len], name);
    const pat = buf[0 .. 1 + name.len];
    var count: usize = 0;
    var from: usize = 0;
    while (find(content, from, pat)) |p| {
        const after = p + pat.len;
        from = p + 1;
        if (after < content.len and isWs(content[after])) {
            const j = skipWs(content, after);
            if (std.mem.startsWith(u8, content[j..], "Do") and tokenBounded(content, j + 2)) count += 1;
        }
    }
    return count;
}

fn imageNames(
    gpa: std.mem.Allocator,
    d: []const u8,
    res: Range,
    images: *std.AutoHashMap(u32, void),
) !std.ArrayList([]const u8) {
    var names: std.ArrayList([]const u8) = .empty;
    const xo = find(d[0..res.e], res.s, "/XObject") orelse return names;
    const open = (find(d[0..res.e], xo, "<<") orelse return names) + 2;
    const close = find(d[0..res.e], open, ">>") orelse res.e;
    const dict = d[open..close];
    var i: usize = 0;
    while (i < dict.len) {
        if (dict[i] == '/') {
            if (readName(dict, i)) |rn| {
                const k = skipWs(dict, rn.next);
                if (parseRef(dict, k)) |pr| {
                    if (images.contains(pr.v)) try names.append(gpa, rn.name);
                }
                i = rn.next;
                continue;
            }
        }
        i += 1;
    }
    return names;
}

fn contentRefs(gpa: std.mem.Allocator, d: []const u8, body: Range) !std.ArrayList(u32) {
    var refs: std.ArrayList(u32) = .empty;
    const cp = find(d[0..body.e], body.s, "/Contents") orelse return refs;
    const c = skipWs(d, cp + 9);
    if (c < body.e and d[c] == '[') {
        const close = find(d[0..body.e], c, "]") orelse body.e;
        var i = c + 1;
        while (i < close) {
            if (d[i] >= '0' and d[i] <= '9' and (isWs(d[i - 1]) or d[i - 1] == '[')) {
                if (parseRef(d, i)) |pr| {
                    try refs.append(gpa, pr.v);
                    i = pr.next;
                    continue;
                }
            }
            i += 1;
        }
    } else if (parseUint(d, c)) |num| {
        try refs.append(gpa, num.v);
    }
    return refs;
}

pub fn main(init: std.process.Init) !void {
    const gpa = init.gpa;
    const io = init.io;

    var path: []const u8 = "../assets/pdf.pdf";
    var it = init.minimal.args.iterate();
    _ = it.skip();
    if (it.next()) |a| path = a;

    const data = std.Io.Dir.cwd().readFileAlloc(io, path, gpa, .unlimited) catch |e| {
        std.debug.print("failed to read {s}: {s}\n", .{ path, @errorName(e) });
        std.process.exit(1);
    };
    defer gpa.free(data);

    var objs = try parseObjects(gpa, data);
    defer objs.deinit();

    var images = std.AutoHashMap(u32, void).init(gpa);
    defer images.deinit();
    var oit = objs.iterator();
    while (oit.next()) |entry| {
        const r = entry.value_ptr.*;
        if (nameHasValue(data[r.s..r.e], "/Subtype", "/Image")) try images.put(entry.key_ptr.*, {});
    }

    var placements: usize = 0;
    var pit = objs.iterator();
    while (pit.next()) |entry| {
        const body = entry.value_ptr.*;
        if (!nameHasValue(data[body.s..body.e], "/Type", "/Page")) continue;

        var res = body;
        if (find(data[0..body.e], body.s, "/Resources")) |p| {
            const q = skipWs(data, p + 10);
            if (!std.mem.startsWith(u8, data[q..], "<<")) {
                if (parseRef(data, q)) |pr| {
                    if (objs.get(pr.v)) |r| res = r;
                }
            }
        }

        var names = try imageNames(gpa, data, res, &images);
        defer names.deinit(gpa);
        if (names.items.len == 0) continue;

        var content: std.ArrayList(u8) = .empty;
        defer content.deinit(gpa);

        var refs = try contentRefs(gpa, data, body);
        defer refs.deinit(gpa);
        for (refs.items) |r| {
            const cb = objs.get(r) orelse continue;
            const raw = streamBytes(data, cb) orelse continue;
            const body_slice = data[cb.s..cb.e];
            if (find(body_slice, 0, "/FlateDecode") != null) {
                if (inflateZlib(gpa, raw)) |out| {
                    defer gpa.free(out);
                    try content.appendSlice(gpa, out);
                    try content.append(gpa, '\n');
                }
            } else {
                try content.appendSlice(gpa, raw);
                try content.append(gpa, '\n');
            }
        }

        for (names.items) |name| {
            placements += countNameDo(content.items, name);
        }
    }

    std.debug.print(
        "{s}: {d} image placements ({d} unique images)\n",
        .{ path, placements, images.count() },
    );
}
