const std = @import("std");
const testing = std.testing;
const color = @import("color.zig");
const cube = @import("cube.zig");
const encoding = @import("encoding.zig");
const xmp = @import("xmp.zig");

test "rgb<->hsv round trip" {
    const samples = [_]color.Rgb{
        .{ .r = 0.2, .g = 0.5, .b = 0.8 },
        .{ .r = 1.0, .g = 0.0, .b = 0.0 },
        .{ .r = 0.0, .g = 0.0, .b = 0.0 },
        .{ .r = 0.7, .g = 0.7, .b = 0.7 },
    };
    for (samples) |c| {
        const back = color.hsvToRgb(color.rgbToHsv(c));
        try testing.expectApproxEqAbs(c.r, back.r, 1e-9);
        try testing.expectApproxEqAbs(c.g, back.g, 1e-9);
        try testing.expectApproxEqAbs(c.b, back.b, 1e-9);
    }
}

test "xmp creative profile has valid RGBTable structure" {
    const src =
        \\LUT_3D_SIZE 2
        \\0 0 0
        \\1 0 0
        \\0 1 0
        \\1 1 0
        \\0 0 1
        \\1 0 1
        \\0 1 1
        \\1 1 1
    ;
    var lut = try cube.parse(testing.allocator, src);
    defer lut.deinit();
    const out = try xmp.build(testing.allocator, &lut, "Test", "LUT Profiles", .display);
    defer testing.allocator.free(out);

    // Hashed-table reference and matching Table_<id> attribute must be present.
    try testing.expect(std.mem.indexOf(u8, out, "crs:RGBTable=\"") != null);
    const id_at = std.mem.indexOf(u8, out, "crs:RGBTable=\"").? + "crs:RGBTable=\"".len;
    const id = out[id_at .. id_at + 32];
    var buf: [64]u8 = undefined;
    const tbl = try std.fmt.bufPrint(&buf, "crs:Table_{s}=\"", .{id});
    try testing.expect(std.mem.indexOf(u8, out, tbl) != null);
    try testing.expect(std.mem.indexOf(u8, out, "crs:PresetType=\"Look\"") != null);
}

test "detect LUT input encoding from name" {
    try testing.expectEqual(encoding.Input.flog2, encoding.detect("FLog2_to_CLASSIC-CHROME_33grid"));
    try testing.expectEqual(encoding.Input.flog, encoding.detect("F-Log to Rec709"));
    try testing.expectEqual(encoding.Input.slog3, encoding.detect("Sony S-Log3 SGamut3"));
    try testing.expectEqual(encoding.Input.vlog, encoding.detect("V-Log_to_V709"));
    try testing.expectEqual(encoding.Input.logc3, encoding.detect("ARRI_LogC_to_Rec709"));
    try testing.expectEqual(encoding.Input.display, encoding.detect("Teal and Orange Look"));
}

test "F-Log2 anchors 18% gray near 0.39, black to f, monotonic" {
    // encodeChannel takes a *display* value; feed display whose linear == 0.18.
    const disp_for = struct {
        fn f(lin: f64) f64 {
            return color.linearToSrgb(lin);
        }
    }.f;
    const v18 = encoding.encodeChannel(.flog2, disp_for(0.18));
    try testing.expectApproxEqAbs(@as(f64, 0.39), v18, 0.01);
    // Monotonic increasing.
    var prev: f64 = -1;
    var i: usize = 0;
    while (i <= 20) : (i += 1) {
        const v = encoding.encodeChannel(.flog2, @as(f64, @floatFromInt(i)) / 20.0);
        try testing.expect(v > prev);
        prev = v;
    }
}

test "wrap hue delta" {
    try testing.expectApproxEqAbs(@as(f64, 10), color.wrapHueDelta(370), 1e-9);
    try testing.expectApproxEqAbs(@as(f64, -10), color.wrapHueDelta(350), 1e-9);
}

test "parse identity 3D cube and sample" {
    const src =
        \\TITLE "id"
        \\LUT_3D_SIZE 2
        \\0 0 0
        \\1 0 0
        \\0 1 0
        \\1 1 0
        \\0 0 1
        \\1 0 1
        \\0 1 1
        \\1 1 1
    ;
    var lut = try cube.parse(testing.allocator, src);
    defer lut.deinit();
    try testing.expect(lut.is_3d);
    try testing.expectEqual(@as(usize, 2), lut.size);

    const mid = lut.sample(.{ .r = 0.5, .g = 0.25, .b = 0.75 });
    try testing.expectApproxEqAbs(@as(f64, 0.5), mid.r, 1e-9);
    try testing.expectApproxEqAbs(@as(f64, 0.25), mid.g, 1e-9);
    try testing.expectApproxEqAbs(@as(f64, 0.75), mid.b, 1e-9);
}

test "absolute-path create/write/read via cwd (install path)" {
    var threaded = std.Io.Threaded.init(testing.allocator, .{});
    defer threaded.deinit();
    const io = threaded.io();
    const cwd = std.Io.Dir.cwd();

    const dir = "/tmp/lut2profile_copytest";
    const file = dir ++ "/profile.dcp";
    try cwd.createDirPath(io, dir);
    try cwd.writeFile(io, .{ .sub_path = file, .data = "hello-dcp" });

    const back = try cwd.readFileAlloc(io, file, testing.allocator, .limited(1024));
    defer testing.allocator.free(back);
    try testing.expectEqualStrings("hello-dcp", back);
}
