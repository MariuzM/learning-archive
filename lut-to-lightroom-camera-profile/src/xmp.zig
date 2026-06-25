//! Write a Lightroom "creative" profile (.xmp) carrying a 3D LUT, in Adobe's
//! real RGBTable format (reverse-engineered and validated against shipped Adobe
//! profiles — see docs/XMP_RGBTABLE_FORMAT.md).
//!
//! Pipeline: resample the LUT to <=32^3 on a display-referred grid (applying the
//! input transfer function), build Adobe's binary block (header + uint16 deltas
//! vs the identity "NOP" ramp, B fastest + footer + range), zlib-compress,
//! prefix the uncompressed size, then encode with Adobe's LSB-first base85.

const std = @import("std");
const cube = @import("cube.zig");
const color = @import("color.zig");
const encoding = @import("encoding.zig");
const flate = std.compress.flate;

/// Adobe's base85 alphabet: value = index. XML-unsafe chars are absent.
const kEncodeTable = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?`'|()[]{}@%$#";

/// Adobe Camera Raw caps RGBTable LUTs at 32 per axis.
const max_grid = 32;

pub fn build(
    allocator: std.mem.Allocator,
    lut: *const cube.Lut,
    profile_name: []const u8,
    group_name: []const u8,
    input: encoding.Input,
) ![]u8 {
    if (!lut.is_3d) return error.Needs3dLut;
    const size: usize = @min(lut.size, max_grid);

    const block = try buildBlock(allocator, lut, size, input);
    defer allocator.free(block);

    // crs:RGBTable id = lowercase MD5 of the block; UUID = MD5(id + name + group).
    var digest: [16]u8 = undefined;
    std.crypto.hash.Md5.hash(block, &digest, .{});
    var id_buf: [32]u8 = undefined;
    const id = std.fmt.bufPrint(&id_buf, "{x}", .{digest}) catch unreachable;

    var uuid_digest: [16]u8 = undefined;
    var uuid_hasher = std.crypto.hash.Md5.init(.{});
    uuid_hasher.update(id);
    uuid_hasher.update(profile_name);
    uuid_hasher.update(group_name);
    uuid_hasher.final(&uuid_digest);
    var uuid_buf: [32]u8 = undefined;
    const uuid_lower = std.fmt.bufPrint(&uuid_buf, "{x}", .{uuid_digest}) catch unreachable;
    var uuid_upper: [32]u8 = undefined;
    for (uuid_lower, 0..) |c, i| uuid_upper[i] = std.ascii.toUpper(c);

    // compressed payload = u32 LE(uncompressed size) ++ zlib(block)
    const z = try zlibCompress(allocator, block);
    defer allocator.free(z);
    var payload = std.ArrayList(u8).empty;
    defer payload.deinit(allocator);
    var lenbuf: [4]u8 = undefined;
    std.mem.writeInt(u32, &lenbuf, @intCast(block.len), .little);
    try payload.appendSlice(allocator, &lenbuf);
    try payload.appendSlice(allocator, z);

    const encoded = try base85Encode(allocator, payload.items);
    defer allocator.free(encoded);

    return std.fmt.allocPrint(allocator,
        \\<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 7.0">
        \\ <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
        \\  <rdf:Description rdf:about="" xmlns:crs="http://ns.adobe.com/camera-raw-settings/1.0/"
        \\   crs:PresetType="Look" crs:Cluster="" crs:UUID="{[uuid]s}"
        \\   crs:SupportsAmount="True" crs:SupportsColor="True" crs:SupportsMonochrome="True"
        \\   crs:SupportsHighDynamicRange="True" crs:SupportsNormalDynamicRange="True"
        \\   crs:SupportsSceneReferred="True" crs:SupportsOutputReferred="True"
        \\   crs:RequiresRGBTables="False" crs:Version="14.3" crs:ProcessVersion="11.0" crs:ConvertToGrayscale="False"
        \\   crs:RGBTable="{[id]s}" crs:Table_{[id]s}="{[table]s}" crs:HasSettings="True">
        \\   <crs:Name><rdf:Alt><rdf:li xml:lang="x-default">{[name]s}</rdf:li></rdf:Alt></crs:Name>
        \\   <crs:Group><rdf:Alt><rdf:li xml:lang="x-default">{[group]s}</rdf:li></rdf:Alt></crs:Group>
        \\  </rdf:Description>
        \\ </rdf:RDF>
        \\</x:xmpmeta>
        \\
    , .{ .uuid = uuid_upper, .id = id, .table = encoded, .name = profile_name, .group = group_name });
}

/// Build Adobe's uncompressed RGBTable binary block.
fn buildBlock(allocator: std.mem.Allocator, lut: *const cube.Lut, size: usize, input: encoding.Input) ![]u8 {
    var blk = std.ArrayList(u8).empty;
    errdefer blk.deinit(allocator);

    // header: u32 LE {1, 1, 3 (dims), size}
    try appendU32(allocator, &blk, 1);
    try appendU32(allocator, &blk, 1);
    try appendU32(allocator, &blk, 3);
    try appendU32(allocator, &blk, @intCast(size));

    // Identity ("NOP") ramp; samples are stored as deltas from it.
    const denom: f64 = @floatFromInt(size - 1);
    const nop = try allocator.alloc(u32, size);
    defer allocator.free(nop);
    for (0..size) |i| nop[i] = @intCast((i * 0xFFFF + size / 2) / (size - 1));

    // samples: index = (r*size*size + g*size + b), i.e. B fastest, R slowest.
    const total = size * size * size;
    const samples = try allocator.alloc(u8, total * 6);
    defer allocator.free(samples);

    var b: usize = 0;
    while (b < size) : (b += 1) {
        var g: usize = 0;
        while (g < size) : (g += 1) {
            var r: usize = 0;
            while (r < size) : (r += 1) {
                const disp = color.Rgb{
                    .r = @as(f64, @floatFromInt(r)) / denom,
                    .g = @as(f64, @floatFromInt(g)) / denom,
                    .b = @as(f64, @floatFromInt(b)) / denom,
                };
                const out = lut.sample(encoding.encodeRgb(input, disp));
                const oi = (r * size * size + g * size + b) * 6;
                writeDelta(samples, oi + 0, out.r, nop[r]);
                writeDelta(samples, oi + 2, out.g, nop[g]);
                writeDelta(samples, oi + 4, out.b, nop[b]);
            }
        }
    }
    try blk.appendSlice(allocator, samples);

    // footer: u32 LE {colors=0 (sRGB), gamma=1, gamut=0}
    try appendU32(allocator, &blk, 0);
    try appendU32(allocator, &blk, 1);
    try appendU32(allocator, &blk, 0);
    // range: f64 LE {0.0, 2.0}
    try appendF64(allocator, &blk, 0.0);
    try appendF64(allocator, &blk, 2.0);

    return blk.toOwnedSlice(allocator);
}

fn writeDelta(buf: []u8, off: usize, value: f64, nop: u32) void {
    const q: i64 = @intFromFloat(@round(color.clamp01(value) * 65535.0));
    const delta: u16 = @intCast(@mod(q - @as(i64, nop), 65536));
    std.mem.writeInt(u16, buf[off..][0..2], delta, .little);
}

/// Adobe's base85: 4 bytes -> 5 chars, little-endian uint32, LSB digit first,
/// with the final partial group emitting (bytes+1) chars.
fn base85Encode(allocator: std.mem.Allocator, data: []const u8) ![]u8 {
    var out = std.ArrayList(u8).empty;
    errdefer out.deinit(allocator);
    var remaining = data.len;
    var i: usize = 0;
    while (i < data.len) : (i += 4) {
        var x: u32 = 0;
        var k: usize = 0;
        while (k < 4) : (k += 1) {
            const idx = i + k;
            const byte: u32 = if (idx < data.len) data[idx] else 0;
            x |= byte << @intCast(k * 8);
        }
        var j: usize = 0;
        while (j < 5) : (j += 1) {
            try out.append(allocator, kEncodeTable[x % 85]);
            x /= 85;
            if (j > 0) {
                remaining -= 1;
                if (remaining == 0) break;
            }
        }
    }
    return out.toOwnedSlice(allocator);
}

/// zlib-compress (deflate + zlib header/adler32) so Lightroom can inflate it.
fn zlibCompress(allocator: std.mem.Allocator, data: []const u8) ![]u8 {
    var aw = try std.Io.Writer.Allocating.initCapacity(allocator, 1024);
    errdefer aw.deinit();
    const window = try allocator.alloc(u8, flate.max_window_len);
    defer allocator.free(window);
    var cmp = try flate.Compress.init(&aw.writer, window, .zlib, .default);
    try cmp.writer.writeAll(data);
    try cmp.finish();
    var list = aw.toArrayList();
    return list.toOwnedSlice(allocator);
}

fn appendU32(a: std.mem.Allocator, out: *std.ArrayList(u8), v: u32) !void {
    var buf: [4]u8 = undefined;
    std.mem.writeInt(u32, &buf, v, .little);
    try out.appendSlice(a, &buf);
}
fn appendF64(a: std.mem.Allocator, out: *std.ArrayList(u8), v: f64) !void {
    var buf: [8]u8 = undefined;
    std.mem.writeInt(u64, &buf, @bitCast(v), .little);
    try out.appendSlice(a, &buf);
}
