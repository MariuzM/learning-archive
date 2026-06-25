// Functions exported here are callable from JavaScript via the WebAssembly
// instance's `exports` object.

const std = @import("std");

export fn add(a: i32, b: i32) i32 {
    return a + b;
}

export fn fibonacci(n: u32) u64 {
    var a: u64 = 0;
    var b: u64 = 1;
    var i: u32 = 0;
    while (i < n) : (i += 1) {
        const next = a + b;
        a = b;
        b = next;
    }
    return a;
}

// A fixed buffer in wasm linear memory that JS can read back. `greet` writes a
// message into it and returns the byte length so JS knows how much to decode.
var greeting_buffer: [256]u8 = undefined;

export fn greetingPtr() [*]u8 {
    return &greeting_buffer;
}

export fn greet(value: i32) usize {
    const prefix = "Hello from Zig + WebAssembly! Your number doubled is ";
    var i: usize = 0;
    for (prefix) |c| {
        greeting_buffer[i] = c;
        i += 1;
    }

    const doubled = value *% 2;
    i += writeInt(greeting_buffer[i..], doubled);
    return i;
}

// Device detection. WebAssembly cannot execute JS, but it can *import* JS
// functions and call them. JS supplies these at instantiation (the import
// object), so here Zig is the driver: it calls out to the browser to fetch each
// signal, classifies them, and writes a multi-line report into `device_buffer`.
//
// The two string getters receive a buffer pointer + capacity; JS encodes the
// value straight into wasm linear memory and returns the byte length.
extern "env" fn jsUserAgent(ptr: [*]u8, max: usize) usize;
extern "env" fn jsGpu(ptr: [*]u8, max: usize) usize;
extern "env" fn jsCores() i32;
extern "env" fn jsDeviceMemory() f64;
extern "env" fn jsMaxTouchPoints() i32;
extern "env" fn jsScreenWidth() i32;
extern "env" fn jsScreenHeight() i32;
extern "env" fn jsDevicePixelRatio() f64;
extern "env" fn jsDeviceId(ptr: [*]u8, max: usize) usize;

// Implemented in src/fingerprint.c, compiled into this same wasm module.
extern fn fnv1a(data: [*]const u8, len: usize) u32;

var ua_buffer: [1024]u8 = undefined;
var gpu_buffer: [256]u8 = undefined;
var id_buffer: [64]u8 = undefined;
var device_buffer: [1024]u8 = undefined;

export fn devicePtr() [*]u8 {
    return &device_buffer;
}

export fn detectDevice() usize {
    const id = id_buffer[0..jsDeviceId(&id_buffer, id_buffer.len)];
    const ua = ua_buffer[0..jsUserAgent(&ua_buffer, ua_buffer.len)];
    const gpu = gpu_buffer[0..jsGpu(&gpu_buffer, gpu_buffer.len)];

    const cores = jsCores();
    const memory_gb = jsDeviceMemory();
    const touch_points = jsMaxTouchPoints();
    const screen_w = jsScreenWidth();
    const screen_h = jsScreenHeight();
    const dpr = jsDevicePixelRatio();

    var i: usize = 0;
    i += append(device_buffer[i..], "Device ID: {s}\n", .{id});
    i += append(device_buffer[i..], "Device: {s}\n", .{classifyDevice(ua)});
    i += append(device_buffer[i..], "Form factor: {s}\n", .{formFactor(ua, touch_points, screen_w, screen_h)});

    if (cores > 0) {
        i += append(device_buffer[i..], "CPU cores: {d}\n", .{cores});
    } else {
        i += append(device_buffer[i..], "CPU cores: unknown\n", .{});
    }

    if (memory_gb > 0) {
        i += append(device_buffer[i..], "Memory: ~{d:.0} GB\n", .{memory_gb});
    } else {
        i += append(device_buffer[i..], "Memory: unknown\n", .{});
    }

    i += append(device_buffer[i..], "Touch points: {d}\n", .{touch_points});

    if (screen_w > 0 and screen_h > 0) {
        i += append(device_buffer[i..], "Screen: {d} x {d} @ {d:.1}x\n", .{ screen_w, screen_h, dpr });
    }

    if (gpu.len > 0) {
        i += append(device_buffer[i..], "GPU: {s}\n", .{gpu});
    }

    // Hash computed by the C function — runs in wasm, no JS involved.
    i += append(device_buffer[i..], "Fingerprint: {x:0>8}\n", .{fnv1a(ua.ptr, ua.len)});

    return i;
}

fn append(buf: []u8, comptime fmt: []const u8, args: anytype) usize {
    const written = std.fmt.bufPrint(buf, fmt, args) catch return 0;
    return written.len;
}

fn classifyDevice(ua: []const u8) []const u8 {
    return if (contains(ua, "iPhone"))
        "iPhone (iOS)"
    else if (contains(ua, "iPad"))
        "iPad (iPadOS)"
    else if (contains(ua, "Android") and contains(ua, "Mobile"))
        "Android phone"
    else if (contains(ua, "Android"))
        "Android tablet"
    else if (contains(ua, "Windows"))
        "Windows PC"
    else if (contains(ua, "Macintosh") or contains(ua, "Mac OS"))
        "Mac"
    else if (contains(ua, "CrOS"))
        "Chromebook"
    else if (contains(ua, "Linux"))
        "Linux desktop"
    else
        "Unknown device";
}

// Infer the physical form factor by combining the UA with touch capability and
// the smaller screen dimension (in CSS pixels).
fn formFactor(ua: []const u8, touch: i32, w: i32, h: i32) []const u8 {
    const min_dim = if (w < h) w else h;

    if (contains(ua, "iPad")) return "Tablet";
    if (contains(ua, "Android") and touch > 0 and min_dim >= 600) return "Tablet";
    if (touch > 0 and min_dim > 0 and min_dim < 600) return "Phone";
    if (contains(ua, "Mobile")) return "Phone";
    if (touch > 0) return "Touch device";
    return "Desktop / laptop";
}

// Case-insensitive substring search.
fn contains(haystack: []const u8, needle: []const u8) bool {
    if (needle.len == 0) return true;
    if (needle.len > haystack.len) return false;

    var i: usize = 0;
    while (i <= haystack.len - needle.len) : (i += 1) {
        var j: usize = 0;
        while (j < needle.len) : (j += 1) {
            if (toLower(haystack[i + j]) != toLower(needle[j])) break;
        }
        if (j == needle.len) return true;
    }
    return false;
}

fn toLower(c: u8) u8 {
    return if (c >= 'A' and c <= 'Z') c + 32 else c;
}

fn writeInt(out: []u8, value: i32) usize {
    if (value == 0) {
        out[0] = '0';
        return 1;
    }

    var n: u32 = @intCast(if (value < 0) -value else value);
    var tmp: [11]u8 = undefined;
    var len: usize = 0;
    while (n > 0) : (n /= 10) {
        tmp[len] = '0' + @as(u8, @intCast(n % 10));
        len += 1;
    }

    var written: usize = 0;
    if (value < 0) {
        out[0] = '-';
        written = 1;
    }

    var j: usize = len;
    while (j > 0) {
        j -= 1;
        out[written] = tmp[j];
        written += 1;
    }
    return written;
}
