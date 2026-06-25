# LUT → Lightroom Profile

A small macOS app (written in Zig) that turns a `.cube` LUT into a **Lightroom
creative profile** (`.xmp`) — the kind that shows up in the Profile Browser,
carries the full 3D LUT, and works on **any** camera (no camera matching, no
base profile needed).

The GUI is a native window (WKWebView via the [webview](https://github.com/webview/webview)
C library); the engine is pure Zig with no third-party dependencies.

## Build & run

Requires **Zig 0.16** and the Xcode command-line tools.

```sh
zig build              # builds the .app -> zig-out/LutToProfile.app (signed)
zig build run          # build the .app and launch it (alias: gui)
zig build test         # run unit tests
zig build cli          # build just the CLI into zig-out/bin/
zig build run-cli -- --lut FLog2_to_ClassicChrome.cube --out ./out --name "Classic Chrome"
```

`zig build` produces a ready-to-use, signed `zig-out/LutToProfile.app`; add
`-Doptimize=ReleaseFast` for an optimized build.

### CLI

```
lut2profile --lut FILE.cube --out DIR [options]

--lut FILE     input 3D .cube LUT                (required)
--out DIR      output directory                  (required)
--name NAME    profile name (default: LUT stem)
--group NAME   group heading in the Profile Browser (default: "LUT Profiles")
--input ENC    LUT input encoding: auto (default), display, linear,
               rec709, flog2, flog, slog3, vlog, logc3
```

## Using the result in Lightroom

In the app, click **Convert** then **Import to Lightroom** — it copies the
`.xmp` into `~/Library/Application Support/Adobe/CameraRaw/Settings/` and offers
to reveal the folder. **Restart Lightroom Classic** (it only scans at launch),
then the profile appears in the **Profile Browser** under your group name, for
any photo.

## How it works

| Stage | File | Notes |
|-------|------|-------|
| Parse `.cube` + trilinear sampling | `src/cube.zig` | 1D and 3D, `DOMAIN_MIN/MAX` |
| RGB↔HSV, sRGB / log transfer functions | `src/color.zig`, `src/encoding.zig` | |
| Creative `.xmp` writer (Adobe RGBTable) | `src/xmp.zig` | see `docs/` |
| Orchestration | `src/engine.zig` | |
| GUI / CLI | `src/main_gui.zig`, `src/main_cli.zig` | |

### LUT input encoding (log LUTs)

Many film LUTs are authored for *log* footage (F-Log2, S-Log3, …). Lightroom
feeds a profile display-referred pixels, so the app re-encodes each sample into
the LUT's input space before sampling (`src/encoding.zig`), composing the log
curve into the profile. The encoding is **auto-detected from the LUT name** and
can be overridden in the GUI dropdown or with `--input`. Only **F-Log2** is
verified against the Fujifilm data sheet; the other log curves use standard
published formulas. Normal display LUTs: leave it on Display/sRGB.

### The `.xmp` format

Adobe's `crs:RGBTable` format is undocumented; it was reverse-engineered and
**validated against shipped Adobe profiles** (our output is byte-identical to a
known-working profile). Full write-up:
[docs/XMP_RGBTABLE_FORMAT.md](docs/XMP_RGBTABLE_FORMAT.md).

## Notes / limitations

- LUTs larger than 32³ are resampled to 32³ (Camera Raw's max grid).
- The display→scene-linear step assumes a normally-exposed image (no scene
  metadata); this is the standard approximation for log input.
- This targets **Lightroom Classic / Camera Raw / Photoshop**. The cloud
  "Lightroom" (CC) doesn't read the local `Settings` folder.
