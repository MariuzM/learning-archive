//! Webview (WKWebView) GUI. The HTML UI calls bound native functions:
//! pickFile, pickFolder, convert, installProfile, revealPath. File dialogs use
//! macOS `osascript` so we don't need an Objective-C bridge.

const std = @import("std");
const engine = @import("engine.zig");
const encoding = @import("encoding.zig");

const c = struct {
    pub const webview_t = ?*anyopaque;
    // Window size hints (webview_hint_t).
    pub const WEBVIEW_HINT_NONE: c_int = 0;
    pub const WEBVIEW_HINT_MIN: c_int = 1;
    pub const WEBVIEW_HINT_MAX: c_int = 2;
    pub const WEBVIEW_HINT_FIXED: c_int = 3;
    // webview 0.12.0: state-changing entry points return webview_error_t (c_int).
    pub extern fn webview_create(debug: c_int, window: ?*anyopaque) webview_t;
    pub extern fn webview_destroy(w: webview_t) c_int;
    pub extern fn webview_run(w: webview_t) c_int;
    pub extern fn webview_terminate(w: webview_t) c_int;
    pub extern fn webview_set_title(w: webview_t, title: [*:0]const u8) c_int;
    pub extern fn webview_set_size(w: webview_t, width: c_int, height: c_int, hints: c_int) c_int;
    pub extern fn webview_set_html(w: webview_t, html: [*:0]const u8) c_int;
    pub extern fn webview_bind(
        w: webview_t,
        name: [*:0]const u8,
        cb: *const fn ([*:0]const u8, [*:0]const u8, ?*anyopaque) callconv(.c) void,
        arg: ?*anyopaque,
    ) c_int;
    pub extern fn webview_return(w: webview_t, id: [*:0]const u8, status: c_int, result: [*:0]const u8) c_int;
};

const Ctx = struct {
    gpa: std.mem.Allocator,
    io: std.Io,
    w: c.webview_t,
    home: []const u8,
};

const html = @embedFile("index.html");

pub fn main(init: std.process.Init) !void {
    const gpa = init.gpa;

    const w = c.webview_create(0, null);
    if (w == null) return error.WebviewInitFailed;
    defer _ = c.webview_destroy(w);

    var ctx = Ctx{
        .gpa = gpa,
        .io = init.io,
        .w = w,
        .home = init.environ_map.get("HOME") orelse "",
    };

    _ = c.webview_set_title(w, "LUT \u{2192} Lightroom Profile");
    _ = c.webview_set_size(w, 700, 620, c.WEBVIEW_HINT_NONE);
    _ = c.webview_set_size(w, 560, 540, c.WEBVIEW_HINT_MIN);
    _ = c.webview_bind(w, "pickFile", cbPickFile, &ctx);
    _ = c.webview_bind(w, "pickFolder", cbPickFolder, &ctx);
    _ = c.webview_bind(w, "convert", cbConvert, &ctx);
    _ = c.webview_bind(w, "installProfile", cbInstall, &ctx);
    _ = c.webview_bind(w, "revealPath", cbReveal, &ctx);
    _ = c.webview_bind(w, "quit", cbQuit, &ctx);

    const html_z = try gpa.dupeZ(u8, html);
    defer gpa.free(html_z);
    _ = c.webview_set_html(w, html_z);

    _ = c.webview_run(w);
}

// ---- app lifecycle ----

fn cbQuit(_: [*:0]const u8, _: [*:0]const u8, arg: ?*anyopaque) callconv(.c) void {
    const ctx: *Ctx = @ptrCast(@alignCast(arg.?));
    _ = c.webview_terminate(ctx.w);
}

// ---- file dialogs ----

fn cbPickFile(seq: [*:0]const u8, _: [*:0]const u8, arg: ?*anyopaque) callconv(.c) void {
    const ctx: *Ctx = @ptrCast(@alignCast(arg.?));
    const path = runOsascript(ctx, "POSIX path of (choose file with prompt \"Select a .cube LUT\" of type {\"cube\",\"CUBE\",\"public.data\"})") catch "";
    defer ctx.gpa.free(path);
    returnJsonString(ctx, seq, path);
}

fn cbPickFolder(seq: [*:0]const u8, _: [*:0]const u8, arg: ?*anyopaque) callconv(.c) void {
    const ctx: *Ctx = @ptrCast(@alignCast(arg.?));
    const path = runOsascript(ctx, "POSIX path of (choose folder with prompt \"Choose output folder\")") catch "";
    defer ctx.gpa.free(path);
    returnJsonString(ctx, seq, path);
}

// ---- convert ----

const Args = struct {
    lut: []const u8 = "",
    outDir: []const u8 = "",
    name: []const u8 = "LUT Profile",
    group: []const u8 = "LUT Profiles",
    input: []const u8 = "auto",
};

fn parseInput(v: []const u8) ?encoding.Input {
    const eq = std.mem.eql;
    if (eq(u8, v, "display") or eq(u8, v, "srgb")) return .display;
    if (eq(u8, v, "linear")) return .linear;
    if (eq(u8, v, "rec709")) return .rec709;
    if (eq(u8, v, "flog2")) return .flog2;
    if (eq(u8, v, "flog")) return .flog;
    if (eq(u8, v, "slog3")) return .slog3;
    if (eq(u8, v, "vlog")) return .vlog;
    if (eq(u8, v, "logc3") or eq(u8, v, "logc")) return .logc3;
    return null;
}

fn cbConvert(seq: [*:0]const u8, req: [*:0]const u8, arg: ?*anyopaque) callconv(.c) void {
    const ctx: *Ctx = @ptrCast(@alignCast(arg.?));
    runConvert(ctx, seq, std.mem.span(req)) catch |e| {
        const msg = std.fmt.allocPrint(ctx.gpa, "{{\"ok\":false,\"msg\":\"internal error: {s}\"}}", .{@errorName(e)}) catch return;
        defer ctx.gpa.free(msg);
        returnRaw(ctx, seq, msg);
    };
}

fn runConvert(ctx: *Ctx, seq: [*:0]const u8, req: []const u8) !void {
    const parsed = try std.json.parseFromSlice(std.json.Value, ctx.gpa, req, .{});
    defer parsed.deinit();
    if (parsed.value != .array or parsed.value.array.items.len == 0) return error.BadRequest;
    const obj = parsed.value.array.items[0];
    if (obj != .object) return error.BadRequest;

    const a = Args{
        .lut = strField(obj, "lut", ""),
        .outDir = strField(obj, "outDir", ""),
        .name = strField(obj, "name", "LUT Profile"),
        .group = strField(obj, "group", "LUT Profiles"),
        .input = strField(obj, "input", "auto"),
    };

    if (a.lut.len == 0) return reply(ctx, seq, false, "Choose a .cube LUT first.", null);
    if (a.outDir.len == 0) return reply(ctx, seq, false, "Choose an output folder.", null);

    var result = engine.convert(ctx.gpa, ctx.io, .{
        .lut_path = a.lut,
        .out_dir = a.outDir,
        .profile_name = if (a.name.len > 0) a.name else "LUT Profile",
        .group_name = a.group,
        .input = parseInput(a.input),
    }) catch |e| {
        return reply(ctx, seq, false, engineErrorMsg(e), null);
    };
    defer result.deinit(ctx.gpa);

    const msg = std.fmt.allocPrint(ctx.gpa, "Done. LUT input read as {s}.", .{result.input.label()}) catch "Done.";
    defer if (!std.mem.eql(u8, msg, "Done.")) ctx.gpa.free(msg);
    return reply(ctx, seq, true, msg, result.xmp_path);
}

fn engineErrorMsg(e: anyerror) []const u8 {
    return switch (e) {
        error.Needs3dLut => "This needs a 3D LUT (a .cube with LUT_3D_SIZE).",
        error.SizeMismatch => "LUT data count does not match its declared size.",
        error.InvalidFormat => "Could not parse the .cube file.",
        error.FileNotFound => "The selected file could not be found.",
        else => "Conversion failed.",
    };
}

// ---- install to Lightroom ----

const settings_rel = "/Library/Application Support/Adobe/CameraRaw/Settings";

fn cbInstall(seq: [*:0]const u8, req: [*:0]const u8, arg: ?*anyopaque) callconv(.c) void {
    const ctx: *Ctx = @ptrCast(@alignCast(arg.?));
    installProfile(ctx, seq, std.mem.span(req)) catch |e| {
        const msg = std.fmt.allocPrint(ctx.gpa, "{{\"ok\":false,\"msg\":\"install failed: {s}\"}}", .{@errorName(e)}) catch return;
        defer ctx.gpa.free(msg);
        returnRaw(ctx, seq, msg);
    };
}

fn installProfile(ctx: *Ctx, seq: [*:0]const u8, req: []const u8) !void {
    const path = firstStringArg(ctx.gpa, req) orelse return replyInstall(ctx, seq, false, "Nothing to install.", "");
    defer ctx.gpa.free(path);
    if (path.len == 0) return replyInstall(ctx, seq, false, "Nothing to install — convert first.", "");
    if (ctx.home.len == 0) return replyInstall(ctx, seq, false, "Could not locate your home folder.", "");

    const dir = try std.fmt.allocPrint(ctx.gpa, "{s}{s}", .{ ctx.home, settings_rel });
    defer ctx.gpa.free(dir);
    const cwd = std.Io.Dir.cwd();
    try cwd.createDirPath(ctx.io, dir);
    const bytes = try cwd.readFileAlloc(ctx.io, path, ctx.gpa, .limited(16 * 1024 * 1024));
    defer ctx.gpa.free(bytes);
    const dest = try std.fmt.allocPrint(ctx.gpa, "{s}/{s}", .{ dir, std.fs.path.basename(path) });
    defer ctx.gpa.free(dest);
    try cwd.writeFile(ctx.io, .{ .sub_path = dest, .data = bytes });

    return replyInstall(ctx, seq, true, "Installed. Restart Lightroom, then find it in the Profile Browser under your group.", dir);
}

fn cbReveal(seq: [*:0]const u8, req: [*:0]const u8, arg: ?*anyopaque) callconv(.c) void {
    const ctx: *Ctx = @ptrCast(@alignCast(arg.?));
    if (firstStringArg(ctx.gpa, std.mem.span(req))) |path| {
        defer ctx.gpa.free(path);
        if (path.len > 0) {
            const res = std.process.run(ctx.gpa, ctx.io, .{ .argv = &.{ "open", path } }) catch null;
            if (res) |r| {
                ctx.gpa.free(r.stdout);
                ctx.gpa.free(r.stderr);
            }
        }
    }
    returnRaw(ctx, seq, "null");
}

// ---- helpers ----

fn reply(ctx: *Ctx, seq: [*:0]const u8, ok: bool, msg: []const u8, xmp: ?[]const u8) void {
    var buf = std.ArrayList(u8).empty;
    defer buf.deinit(ctx.gpa);
    buf.appendSlice(ctx.gpa, if (ok) "{\"ok\":true,\"msg\":" else "{\"ok\":false,\"msg\":") catch return;
    appendJsonString(ctx.gpa, &buf, msg) catch return;
    if (xmp) |p| {
        buf.appendSlice(ctx.gpa, ",\"xmp\":") catch return;
        appendJsonString(ctx.gpa, &buf, p) catch return;
    }
    buf.appendSlice(ctx.gpa, "}") catch return;
    buf.append(ctx.gpa, 0) catch return;
    _ = c.webview_return(ctx.w, seq, 0, @ptrCast(buf.items.ptr));
}

fn replyInstall(ctx: *Ctx, seq: [*:0]const u8, ok: bool, msg: []const u8, dir: []const u8) void {
    var buf = std.ArrayList(u8).empty;
    defer buf.deinit(ctx.gpa);
    buf.appendSlice(ctx.gpa, if (ok) "{\"ok\":true,\"msg\":" else "{\"ok\":false,\"msg\":") catch return;
    appendJsonString(ctx.gpa, &buf, msg) catch return;
    if (dir.len > 0) {
        buf.appendSlice(ctx.gpa, ",\"dir\":") catch return;
        appendJsonString(ctx.gpa, &buf, dir) catch return;
    }
    buf.appendSlice(ctx.gpa, "}") catch return;
    buf.append(ctx.gpa, 0) catch return;
    _ = c.webview_return(ctx.w, seq, 0, @ptrCast(buf.items.ptr));
}

fn returnRaw(ctx: *Ctx, seq: [*:0]const u8, json: []const u8) void {
    const z = ctx.gpa.dupeZ(u8, json) catch return;
    defer ctx.gpa.free(z);
    _ = c.webview_return(ctx.w, seq, 0, z);
}

fn returnJsonString(ctx: *Ctx, seq: [*:0]const u8, s: []const u8) void {
    var buf = std.ArrayList(u8).empty;
    defer buf.deinit(ctx.gpa);
    appendJsonString(ctx.gpa, &buf, s) catch return;
    buf.append(ctx.gpa, 0) catch return;
    _ = c.webview_return(ctx.w, seq, 0, @ptrCast(buf.items.ptr));
}

fn appendJsonString(gpa: std.mem.Allocator, buf: *std.ArrayList(u8), s: []const u8) !void {
    try buf.append(gpa, '"');
    for (s) |ch| {
        switch (ch) {
            '"' => try buf.appendSlice(gpa, "\\\""),
            '\\' => try buf.appendSlice(gpa, "\\\\"),
            '\n' => try buf.appendSlice(gpa, "\\n"),
            '\r' => try buf.appendSlice(gpa, "\\r"),
            '\t' => try buf.appendSlice(gpa, "\\t"),
            else => try buf.append(gpa, ch),
        }
    }
    try buf.append(gpa, '"');
}

fn strField(obj: std.json.Value, key: []const u8, default: []const u8) []const u8 {
    const v = obj.object.get(key) orelse return default;
    return if (v == .string) v.string else default;
}

fn firstStringArg(gpa: std.mem.Allocator, req: []const u8) ?[]u8 {
    const parsed = std.json.parseFromSlice(std.json.Value, gpa, req, .{}) catch return null;
    defer parsed.deinit();
    if (parsed.value != .array or parsed.value.array.items.len == 0) return null;
    const first = parsed.value.array.items[0];
    if (first != .string) return null;
    return gpa.dupe(u8, first.string) catch null;
}

fn runOsascript(ctx: *Ctx, script: []const u8) ![]u8 {
    const res = std.process.run(ctx.gpa, ctx.io, .{
        .argv = &.{ "osascript", "-e", script },
    }) catch return ctx.gpa.dupe(u8, "");
    defer ctx.gpa.free(res.stdout);
    defer ctx.gpa.free(res.stderr);
    if (res.term != .exited or res.term.exited != 0) return ctx.gpa.dupe(u8, "");
    const trimmed = std.mem.trim(u8, res.stdout, " \r\n\t");
    return ctx.gpa.dupe(u8, trimmed);
}
