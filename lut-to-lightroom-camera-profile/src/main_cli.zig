//! CLI front-end: lut2profile --lut FILE.cube --out DIR [options]

const std = @import("std");
const engine = @import("engine.zig");
const encoding = @import("encoding.zig");

const usage =
    \\lut2profile - convert a .cube LUT into a Lightroom creative profile (.xmp)
    \\
    \\Usage:
    \\  lut2profile --lut FILE.cube --out DIR [options]
    \\
    \\Options:
    \\  --lut FILE      Input .cube LUT (3D, required)
    \\  --out DIR       Output directory (required)
    \\  --name NAME     Profile name (default: LUT file stem)
    \\  --group NAME    Profile group shown in Lightroom (default: "LUT Profiles")
    \\  --input ENC     LUT input encoding: auto (default), display, linear,
    \\                  rec709, flog2, flog, slog3, vlog, logc3
    \\  -h, --help      Show this help
    \\
;

pub fn main(init: std.process.Init) !void {
    const a = init.gpa;
    const io = init.io;
    const args = try init.minimal.args.toSlice(init.arena.allocator());

    var lut_path: ?[]const u8 = null;
    var out_dir: ?[]const u8 = null;
    var name: ?[]const u8 = null;
    var group: []const u8 = "LUT Profiles";
    var input: ?encoding.Input = null;

    var i: usize = 1;
    while (i < args.len) : (i += 1) {
        const arg = args[i];
        if (eql(arg, "-h") or eql(arg, "--help")) {
            try printOut(io, usage);
            return;
        } else if (eql(arg, "--lut")) {
            lut_path = next(args, &i) orelse return fail(io, "--lut needs a value");
        } else if (eql(arg, "--out")) {
            out_dir = next(args, &i) orelse return fail(io, "--out needs a value");
        } else if (eql(arg, "--name")) {
            name = next(args, &i) orelse return fail(io, "--name needs a value");
        } else if (eql(arg, "--group")) {
            group = next(args, &i) orelse return fail(io, "--group needs a value");
        } else if (eql(arg, "--input")) {
            const v = next(args, &i) orelse return fail(io, "--input needs a value");
            if (!eql(v, "auto")) input = parseInput(v) orelse return fail(io, "unknown --input value");
        } else {
            try printErr(io, "Unknown argument; use --help.\n");
            std.process.exit(2);
        }
    }

    const lp = lut_path orelse return fail(io, "missing --lut");
    const od = out_dir orelse return fail(io, "missing --out");
    const pname = name orelse stem(lp);

    var result = engine.convert(a, io, .{
        .lut_path = lp,
        .out_dir = od,
        .profile_name = pname,
        .group_name = group,
        .input = input,
    }) catch |e| {
        try reportError(io, e);
        std.process.exit(1);
    };
    defer result.deinit(a);

    var buf: [1024]u8 = undefined;
    try printOut(io, try std.fmt.bufPrint(&buf, "Parsed 3D LUT (size {d}). Input encoding: {s}.\n", .{ result.lut_size, result.input.label() }));
    if (result.xmp_path) |p| try printOut(io, try std.fmt.bufPrint(&buf, "Wrote profile: {s}\n", .{p}));
}

fn reportError(io: std.Io, e: anyerror) !void {
    const msg = switch (e) {
        error.Needs3dLut => "This needs a 3D LUT (.cube with LUT_3D_SIZE).\n",
        error.SizeMismatch => "LUT data count does not match its declared size.\n",
        error.InvalidFormat => "Could not parse the .cube file.\n",
        error.FileNotFound => "A required file was not found.\n",
        else => "Conversion failed.\n",
    };
    try printErr(io, "Error: ");
    try printErr(io, msg);
}

fn eql(a: []const u8, b: []const u8) bool {
    return std.mem.eql(u8, a, b);
}

fn parseInput(v: []const u8) ?encoding.Input {
    if (eql(v, "display") or eql(v, "srgb")) return .display;
    if (eql(v, "linear")) return .linear;
    if (eql(v, "rec709")) return .rec709;
    if (eql(v, "flog2")) return .flog2;
    if (eql(v, "flog")) return .flog;
    if (eql(v, "slog3")) return .slog3;
    if (eql(v, "vlog")) return .vlog;
    if (eql(v, "logc3") or eql(v, "logc")) return .logc3;
    return null;
}

fn next(args: []const [:0]const u8, i: *usize) ?[]const u8 {
    if (i.* + 1 >= args.len) return null;
    i.* += 1;
    return args[i.*];
}

fn stem(path: []const u8) []const u8 {
    const base = std.fs.path.basename(path);
    if (std.mem.lastIndexOfScalar(u8, base, '.')) |dot| return base[0..dot];
    return base;
}

fn fail(io: std.Io, msg: []const u8) !void {
    try printErr(io, "Error: ");
    try printErr(io, msg);
    try printErr(io, "\n");
    std.process.exit(2);
}

fn printOut(io: std.Io, s: []const u8) !void {
    try std.Io.File.stdout().writeStreamingAll(io, s);
}
fn printErr(io: std.Io, s: []const u8) !void {
    try std.Io.File.stderr().writeStreamingAll(io, s);
}
