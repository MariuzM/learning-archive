# Adobe Lightroom / Camera Raw creative-profile `RGBTable` format

Reverse-engineered and **validated against shipped Adobe profiles** (decodes real
`Classic Chrome.xmp` exactly; our encoder's output is byte-identical to a
known-working profile). Adobe has never published this format. Implemented in
[`src/xmp.zig`](../src/xmp.zig).

This is the format that makes a 3D LUT show up as a **creative profile** in the
Lightroom Profile Browser (under its group), working on **any** camera. It is
*not* the same as a `.dcp` camera profile (which is camera-matched and, on at
least some installs, does not surface in the browser).

## Why this matters

Lightroom's Profile Browser only reliably surfaces **`.xmp` creative profiles**
for custom looks. A LUT baked into an `.xmp` requires this exact `RGBTable`
encoding — get one byte wrong and Lightroom loads the profile but silently
applies nothing.

## XMP structure

A single `rdf:Description` with these `crs:` attributes (flat — no nested
`Look`/`Parameters`):

```xml
crs:PresetType="Look"
crs:UUID="<32 hex, uppercase>"
crs:RequiresRGBTables="False"
crs:Version="14.3"  crs:ProcessVersion="11.0"
crs:RGBTable="<id>"
crs:Table_<id>="<encoded blob>"
crs:HasSettings="True"
```

plus `crs:Name` and `crs:Group` (lang-alt elements). The look data lives in
**`crs:Table_<id>`**, where `<id>` is referenced by `crs:RGBTable`.

- `<id>` = lowercase MD5 hex of the **uncompressed binary block** (below).
- `crs:RGBTable` and the `Table_` suffix must use the same `<id>`.

## Encoded blob pipeline

```
block (uncompressed)  ->  zlib.compress  ->  u32_LE(len(block)) ++ zlib_bytes  ->  base85
```

### 1. The binary block (little-endian throughout)

| Section | Bytes | Contents |
|---------|-------|----------|
| header  | 16    | 4 × u32: `{1, 1, 3, size}` (version, version, **dims=3**, grid size) |
| samples | size³ × 6 | per node: 3 × u16 delta (R,G,B) — see below |
| footer  | 12    | 3 × u32: `{0, 1, 0}` (colorspace sRGB=0, gamma, gamut) |
| range   | 16    | 2 × f64: `{0.0, 2.0}` |

**Grid size** is capped at **32** (Camera Raw's max). Larger LUTs must be
resampled to 32³.

**Sample order:** `index = (r·size² + g·size + b)` — i.e. **B varies fastest, R
slowest** (the opposite of `.cube`, which is R-fastest).

**Delta encoding (NOP ramp):** samples are stored as deltas from the identity
LUT, so an identity LUT is all zeros (compresses well). For grid index `i`:

```
nop[i]   = (i·0xFFFF + size/2) / (size-1)            // integer, the identity output
stored   = (round(value·65535) - nop[channel_index]) mod 65536   // as u16
```

Reconstruct with `value = ((stored + nop[i]) mod 65536) / 65535`. Note the
mod-65536 wrap — deltas routinely exceed the i16 range, so treat as wrapping u16,
**not** signed.

### 2. zlib

Standard zlib (deflate + `0x78` header + Adler-32 trailer). Any valid zlib
stream works — Lightroom only needs to inflate it; it need not match Adobe's
compressor byte-for-byte. (Zig: `std.compress.flate.Compress` with
`Container.zlib`.)

### 3. Base85 (Adobe variant)

4 bytes → 5 chars, **little-endian uint32 per group, least-significant digit
first**, using this 85-char alphabet (value = index):

```
0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?`'|()[]{}@%$#
```

The final partial group of `n` bytes (1–3) emits `n+1` chars. XML-unsafe
characters (`" & , ; < > \ _`) are deliberately absent from the alphabet.

> The first 5 chars of every blob are `Lir00` — not a magic, just the base85
> encoding of the first u32 (the uncompressed length, e.g. 196652 for a 32³ LUT).

## Gotchas learned the hard way

- **Camera match (`.dcp` only):** a `.dcp`'s look applies only to RAWs whose
  camera equals its `UniqueCameraModel`. Mismatch = looks like Adobe Standard.
  The `.xmp` path sidesteps this entirely.
- **HSV vs RGB:** the `.dcp` `ProfileLookTableData` is HSV-based and cannot tint
  neutrals or reshape tone strongly. The `.xmp` `RGBTable` carries the full cube.
- **Log LUTs:** film LUTs authored for log (F-Log2, S-Log3, …) must have their
  input transfer function composed in during resampling, or they sample the
  wrong region. See [`src/encoding.zig`](../src/encoding.zig).
- **Lightroom only rescans these folders at launch.** Restart after installing.
