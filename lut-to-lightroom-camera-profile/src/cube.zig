//! Parser + sampler for Adobe/Iridas `.cube` LUTs (1D and 3D).
//! Spec: https://drive.google.com/file/ Resolve `.cube` is the de-facto standard.

const std = @import("std");
const color = @import("color.zig");
const Rgb = color.Rgb;

pub const CubeError = error{
    InvalidFormat,
    UnsupportedSize,
    SizeMismatch,
};

pub const Lut = struct {
    /// true => 3D LUT (size^3 entries), false => 1D LUT (size entries per channel).
    is_3d: bool,
    size: usize,
    /// Domain min/max per channel (default 0..1).
    domain_min: [3]f64 = .{ 0, 0, 0 },
    domain_max: [3]f64 = .{ 1, 1, 1 },
    /// Flat RGB data. 3D layout: index = ((b*size)+g)*size+r, r fastest.
    data: []Rgb,
    title: []u8,
    allocator: std.mem.Allocator,

    pub fn deinit(self: *Lut) void {
        self.allocator.free(self.data);
        self.allocator.free(self.title);
    }

    /// Sample the LUT at normalized rgb in [0,1] with trilinear (3D) or
    /// linear (1D) interpolation. Out-of-range inputs are clamped.
    pub fn sample(self: *const Lut, in: Rgb) Rgb {
        if (self.is_3d) return self.sample3d(in);
        return self.sample1d(in);
    }

    fn normAxis(self: *const Lut, v: f64, ch: usize) f64 {
        const lo = self.domain_min[ch];
        const hi = self.domain_max[ch];
        const span = hi - lo;
        if (span == 0) return 0;
        return color.clamp01((v - lo) / span);
    }

    fn at(self: *const Lut, r: usize, g: usize, b: usize) Rgb {
        return self.data[((b * self.size) + g) * self.size + r];
    }

    fn sample3d(self: *const Lut, in: Rgb) Rgb {
        const n = self.size - 1;
        const fr = self.normAxis(in.r, 0) * @as(f64, @floatFromInt(n));
        const fg = self.normAxis(in.g, 1) * @as(f64, @floatFromInt(n));
        const fb = self.normAxis(in.b, 2) * @as(f64, @floatFromInt(n));

        const r0: usize = @intFromFloat(@floor(fr));
        const g0: usize = @intFromFloat(@floor(fg));
        const b0: usize = @intFromFloat(@floor(fb));
        const r1 = @min(r0 + 1, n);
        const g1 = @min(g0 + 1, n);
        const b1 = @min(b0 + 1, n);
        const dr = fr - @floor(fr);
        const dg = fg - @floor(fg);
        const db = fb - @floor(fb);

        const c000 = self.at(r0, g0, b0);
        const c100 = self.at(r1, g0, b0);
        const c010 = self.at(r0, g1, b0);
        const c110 = self.at(r1, g1, b0);
        const c001 = self.at(r0, g0, b1);
        const c101 = self.at(r1, g0, b1);
        const c011 = self.at(r0, g1, b1);
        const c111 = self.at(r1, g1, b1);

        return .{
            .r = trilerp(c000.r, c100.r, c010.r, c110.r, c001.r, c101.r, c011.r, c111.r, dr, dg, db),
            .g = trilerp(c000.g, c100.g, c010.g, c110.g, c001.g, c101.g, c011.g, c111.g, dr, dg, db),
            .b = trilerp(c000.b, c100.b, c010.b, c110.b, c001.b, c101.b, c011.b, c111.b, dr, dg, db),
        };
    }

    fn sample1d(self: *const Lut, in: Rgb) Rgb {
        return .{
            .r = self.lerp1d(self.normAxis(in.r, 0), 0),
            .g = self.lerp1d(self.normAxis(in.g, 1), 1),
            .b = self.lerp1d(self.normAxis(in.b, 2), 2),
        };
    }

    fn lerp1d(self: *const Lut, x: f64, ch: usize) f64 {
        const n = self.size - 1;
        const f = x * @as(f64, @floatFromInt(n));
        const lo: usize = @intFromFloat(@floor(f));
        const hi = @min(lo + 1, n);
        const d = f - @floor(f);
        const a = channel(self.data[lo], ch);
        const b = channel(self.data[hi], ch);
        return a + (b - a) * d;
    }
};

fn channel(c: Rgb, ch: usize) f64 {
    return switch (ch) {
        0 => c.r,
        1 => c.g,
        else => c.b,
    };
}

fn trilerp(c000: f64, c100: f64, c010: f64, c110: f64, c001: f64, c101: f64, c011: f64, c111: f64, dr: f64, dg: f64, db: f64) f64 {
    const c00 = c000 + (c100 - c000) * dr;
    const c10 = c010 + (c110 - c010) * dr;
    const c01 = c001 + (c101 - c001) * dr;
    const c11 = c011 + (c111 - c011) * dr;
    const c0 = c00 + (c10 - c00) * dg;
    const c1 = c01 + (c11 - c01) * dg;
    return c0 + (c1 - c0) * db;
}

pub fn parse(allocator: std.mem.Allocator, text: []const u8) !Lut {
    var size_3d: ?usize = null;
    var size_1d: ?usize = null;
    var domain_min: [3]f64 = .{ 0, 0, 0 };
    var domain_max: [3]f64 = .{ 1, 1, 1 };
    var title = std.ArrayList(u8).empty;
    defer title.deinit(allocator);

    var data = std.ArrayList(Rgb).empty;
    errdefer data.deinit(allocator);

    var lines = std.mem.splitScalar(u8, text, '\n');
    while (lines.next()) |raw_line| {
        const line = std.mem.trim(u8, raw_line, " \t\r");
        if (line.len == 0 or line[0] == '#') continue;

        if (std.mem.startsWith(u8, line, "TITLE")) {
            const rest = std.mem.trim(u8, line[5..], " \t\"");
            try title.appendSlice(allocator, rest);
            continue;
        }
        if (std.mem.startsWith(u8, line, "LUT_3D_SIZE")) {
            size_3d = try parseUint(line[11..]);
            continue;
        }
        if (std.mem.startsWith(u8, line, "LUT_1D_SIZE")) {
            size_1d = try parseUint(line[11..]);
            continue;
        }
        if (std.mem.startsWith(u8, line, "DOMAIN_MIN")) {
            domain_min = try parseTriplet(line[10..]);
            continue;
        }
        if (std.mem.startsWith(u8, line, "DOMAIN_MAX")) {
            domain_max = try parseTriplet(line[10..]);
            continue;
        }
        // Skip any other keyword lines (LUT_3D_INPUT_RANGE etc. begin with a letter).
        if (std.ascii.isAlphabetic(line[0])) continue;

        const triplet = parseTriplet(line) catch continue;
        try data.append(allocator, .{ .r = triplet[0], .g = triplet[1], .b = triplet[2] });
    }

    const is_3d = size_3d != null;
    const size = size_3d orelse size_1d orelse return CubeError.InvalidFormat;
    if (size < 2) return CubeError.UnsupportedSize;

    const expected: usize = if (is_3d) size * size * size else size;
    if (data.items.len != expected) return CubeError.SizeMismatch;

    return .{
        .is_3d = is_3d,
        .size = size,
        .domain_min = domain_min,
        .domain_max = domain_max,
        .data = try data.toOwnedSlice(allocator),
        .title = try title.toOwnedSlice(allocator),
        .allocator = allocator,
    };
}

pub fn parseFile(allocator: std.mem.Allocator, io: std.Io, path: []const u8) !Lut {
    const text = try std.Io.Dir.cwd().readFileAlloc(io, path, allocator, .limited(256 * 1024 * 1024));
    defer allocator.free(text);
    return parse(allocator, text);
}

fn parseUint(s: []const u8) !usize {
    const t = std.mem.trim(u8, s, " \t\r");
    return std.fmt.parseInt(usize, t, 10) catch CubeError.InvalidFormat;
}

fn parseTriplet(s: []const u8) ![3]f64 {
    var it = std.mem.tokenizeAny(u8, s, " \t\r");
    var out: [3]f64 = undefined;
    var i: usize = 0;
    while (it.next()) |tok| : (i += 1) {
        if (i >= 3) break;
        out[i] = std.fmt.parseFloat(f64, tok) catch return CubeError.InvalidFormat;
    }
    if (i < 3) return CubeError.InvalidFormat;
    return out;
}
