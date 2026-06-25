//! Color-space helpers used by the LUT -> profile conversion.
//! All RGB values are normalized floats in [0,1] unless noted.

const std = @import("std");

pub const Rgb = struct { r: f64, g: f64, b: f64 };

/// Hue in degrees [0,360), saturation [0,1], value [0,1].
pub const Hsv = struct { h: f64, s: f64, v: f64 };

pub fn clamp01(x: f64) f64 {
    return std.math.clamp(x, 0.0, 1.0);
}

pub fn rgbToHsv(c: Rgb) Hsv {
    const r = c.r;
    const g = c.g;
    const b = c.b;
    const max = @max(r, @max(g, b));
    const min = @min(r, @min(g, b));
    const delta = max - min;

    var h: f64 = 0.0;
    if (delta > 0.0) {
        if (max == r) {
            h = 60.0 * (@mod((g - b) / delta, 6.0));
        } else if (max == g) {
            h = 60.0 * (((b - r) / delta) + 2.0);
        } else {
            h = 60.0 * (((r - g) / delta) + 4.0);
        }
    }
    if (h < 0.0) h += 360.0;

    const s: f64 = if (max > 0.0) delta / max else 0.0;
    return .{ .h = h, .s = s, .v = max };
}

pub fn hsvToRgb(c: Hsv) Rgb {
    const s = c.s;
    const v = c.v;
    if (s <= 0.0) return .{ .r = v, .g = v, .b = v };

    var h = @mod(c.h, 360.0);
    if (h < 0.0) h += 360.0;
    h /= 60.0;
    const i: i64 = @intFromFloat(@floor(h));
    const f = h - @floor(h);
    const p = v * (1.0 - s);
    const q = v * (1.0 - s * f);
    const t = v * (1.0 - s * (1.0 - f));

    return switch (@mod(i, 6)) {
        0 => .{ .r = v, .g = t, .b = p },
        1 => .{ .r = q, .g = v, .b = p },
        2 => .{ .r = p, .g = v, .b = t },
        3 => .{ .r = p, .g = q, .b = v },
        4 => .{ .r = t, .g = p, .b = v },
        else => .{ .r = v, .g = p, .b = q },
    };
}

/// sRGB electro-optical transfer (encoded -> linear).
pub fn srgbToLinear(x: f64) f64 {
    if (x <= 0.04045) return x / 12.92;
    return std.math.pow(f64, (x + 0.055) / 1.055, 2.4);
}

/// linear -> sRGB encoded.
pub fn linearToSrgb(x: f64) f64 {
    if (x <= 0.0031308) return x * 12.92;
    return 1.055 * std.math.pow(f64, x, 1.0 / 2.4) - 0.055;
}

/// Wrap a hue difference into (-180, 180].
pub fn wrapHueDelta(d: f64) f64 {
    var x = @mod(d, 360.0);
    if (x > 180.0) x -= 360.0;
    if (x <= -180.0) x += 360.0;
    return x;
}
