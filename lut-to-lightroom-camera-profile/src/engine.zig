//! High-level conversion: a `.cube` LUT -> a Lightroom creative `.xmp` profile.

const std = @import("std");
const cube = @import("cube.zig");
const xmp = @import("xmp.zig");
const encoding = @import("encoding.zig");

pub const Options = struct {
    lut_path: []const u8,
    out_dir: []const u8,
    profile_name: []const u8,
    group_name: []const u8 = "LUT Profiles",
    /// LUT input transfer function. `null` = auto-detect from the LUT name.
    input: ?encoding.Input = null,
};

pub const Result = struct {
    xmp_path: ?[]u8 = null,
    lut_is_3d: bool = false,
    lut_size: usize = 0,
    input: encoding.Input = .display,

    pub fn deinit(self: *Result, a: std.mem.Allocator) void {
        if (self.xmp_path) |p| a.free(p);
    }
};

pub const Error = error{Needs3dLut};

pub fn convert(allocator: std.mem.Allocator, io: std.Io, opts: Options) !Result {
    var lut = try cube.parseFile(allocator, io, opts.lut_path);
    defer lut.deinit();

    const input = opts.input orelse detectInput(&lut, opts.lut_path);
    var result = Result{ .lut_is_3d = lut.is_3d, .lut_size = lut.size, .input = input };
    errdefer result.deinit(allocator);

    if (!lut.is_3d) return Error.Needs3dLut;

    try std.Io.Dir.cwd().createDirPath(io, opts.out_dir);
    const bytes = try xmp.build(allocator, &lut, opts.profile_name, opts.group_name, input);
    defer allocator.free(bytes);
    const path = try std.fmt.allocPrint(allocator, "{s}/{s}.xmp", .{ opts.out_dir, opts.profile_name });
    errdefer allocator.free(path);
    try std.Io.Dir.cwd().writeFile(io, .{ .sub_path = path, .data = bytes });
    result.xmp_path = path;
    return result;
}

/// Auto-detect the input encoding from the LUT title, then its filename.
fn detectInput(lut: *const cube.Lut, lut_path: []const u8) encoding.Input {
    const by_title = encoding.detect(lut.title);
    if (by_title != .display) return by_title;
    return encoding.detect(std.fs.path.basename(lut_path));
}
