//! Input transfer functions for LUTs.
//!
//! Creative film LUTs are often authored for *log* footage (F-Log2, S-Log3, …)
//! rather than display-referred RGB. Lightroom feeds a profile display-referred
//! pixels, so to bake such a LUT correctly we must first re-encode each sample
//! into the LUT's expected input space. `encodeChannel` maps a display
//! (sRGB-encoded) value 0..1 into the LUT's input code value.
//!
//! Only F-Log2 is independently verified here (against the Fujifilm data sheet);
//! the other log curves use their standard published formulas.

const std = @import("std");
const color = @import("color.zig");

pub const Input = enum {
    display, // sRGB display-referred — identity (LUT authored for normal images)
    linear, // scene-linear
    rec709, // Rec.709 OETF
    flog2, // Fujifilm F-Log2
    flog, // Fujifilm F-Log
    slog3, // Sony S-Log3
    vlog, // Panasonic V-Log
    logc3, // ARRI LogC3 (EI800)

    pub fn label(self: Input) []const u8 {
        return switch (self) {
            .display => "Display / sRGB",
            .linear => "Linear",
            .rec709 => "Rec.709",
            .flog2 => "Fujifilm F-Log2",
            .flog => "Fujifilm F-Log",
            .slog3 => "Sony S-Log3",
            .vlog => "Panasonic V-Log",
            .logc3 => "ARRI LogC3",
        };
    }
};

/// Guess the LUT input encoding from its title / filename (lowercased).
pub fn detect(text: []const u8) Input {
    var buf: [256]u8 = undefined;
    const n = @min(text.len, buf.len);
    for (text[0..n], 0..) |ch, i| buf[i] = std.ascii.toLower(ch);
    const s = buf[0..n];

    if (has(s, "flog2") or has(s, "f-log2") or has(s, "flog 2")) return .flog2;
    if (has(s, "flog") or has(s, "f-log")) return .flog;
    if (has(s, "slog3") or has(s, "s-log3") or has(s, "slog 3")) return .slog3;
    if (has(s, "vlog") or has(s, "v-log")) return .vlog;
    if (has(s, "logc") or has(s, "log-c") or has(s, "arri")) return .logc3;
    return .display;
}

fn has(haystack: []const u8, needle: []const u8) bool {
    return std.mem.indexOf(u8, haystack, needle) != null;
}

/// Map a display (sRGB-encoded) channel value to the LUT's input code value.
pub fn encodeChannel(inp: Input, v_display: f64) f64 {
    if (inp == .display) return v_display;

    // Treat display-linear as scene-linear reflectance (no scene metadata).
    const lin = color.srgbToLinear(color.clamp01(v_display));
    return switch (inp) {
        .display => v_display,
        .linear => lin,
        .rec709 => rec709Oetf(lin),
        .flog2 => flog2Oetf(lin),
        .flog => flogOetf(lin),
        .slog3 => slog3Oetf(lin),
        .vlog => vlogOetf(lin),
        .logc3 => logc3Oetf(lin),
    };
}

pub fn encodeRgb(inp: Input, c: color.Rgb) color.Rgb {
    return .{
        .r = encodeChannel(inp, c.r),
        .g = encodeChannel(inp, c.g),
        .b = encodeChannel(inp, c.b),
    };
}

fn log10(x: f64) f64 {
    return std.math.log10(x);
}

// Fujifilm F-Log2 (verified against the data sheet; 18% gray -> ~0.391).
fn flog2Oetf(l: f64) f64 {
    const a = 5.555556;
    const b = 0.064829;
    const c = 0.245281;
    const d = 0.384316;
    const e = 8.799461;
    const f = 0.092864;
    const cut1 = 0.000889;
    if (l < cut1) return e * l + f;
    return c * log10(a * l + b) + d;
}

// Fujifilm F-Log (original).
fn flogOetf(l: f64) f64 {
    const a = 0.555556;
    const b = 0.009468;
    const c = 0.344676;
    const d = 0.790453;
    const e = 8.735631;
    const f = 0.092864;
    const cut1 = 0.00004724;
    if (l < cut1) return e * l + f;
    return c * log10(a * l + b) + d;
}

// Sony S-Log3.
fn slog3Oetf(l: f64) f64 {
    if (l >= 0.01125000) {
        return (420.0 + log10((l + 0.01) / (0.18 + 0.01)) * 261.5) / 1023.0;
    }
    return (l * (171.2102946929 - 95.0) / 0.01125000 + 95.0) / 1023.0;
}

// Panasonic V-Log.
fn vlogOetf(l: f64) f64 {
    const cut1 = 0.01;
    const b = 0.00873;
    const c = 0.241514;
    const d = 0.598206;
    if (l < cut1) return 5.6 * l + 0.125;
    return c * log10(l + b) + d;
}

// ARRI LogC3 (EI 800).
fn logc3Oetf(l: f64) f64 {
    const cut = 0.010591;
    const a = 5.555556;
    const b = 0.052272;
    const c = 0.247190;
    const d = 0.385537;
    const e = 5.367655;
    const f = 0.092809;
    if (l > cut) return c * log10(a * l + b) + d;
    return e * l + f;
}

fn rec709Oetf(l: f64) f64 {
    if (l < 0.018) return 4.5 * l;
    return 1.099 * std.math.pow(f64, l, 0.45) - 0.099;
}
