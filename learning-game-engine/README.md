# Learning Game Engine

Building the same tiny game engine three ways — **Jai**, **Zig**, **C++** —
one milestone at a time. The goal is to learn engine fundamentals (the game
loop, rendering, input, entities, collision) while feeling how each language
structures the same code.

## Substrate per language

Each language uses its most idiomatic window + render layer, the same way
`learning-servers` uses each language's production HTTP stack where one exists
and hand-rolls otherwise:

| Language | Window / render / input | External deps |
|----------|-------------------------|---------------|
| Jai  | built-in `Window_Creation` + `Simp` + `Input` modules | none (ships with the compiler) |
| Zig  | SDL3 via `@cImport` | SDL3 |
| C++  | SDL3 | SDL3 |

Jai gets the easy ride: its standard modules already provide a cross-platform
window, an immediate-mode renderer (`Simp`, with Metal/GL/D3D backends), input
events, fonts, and even a UI module (`GetRect`). Zig and C++ lean on SDL3 for
the same surface area.

## Milestones

1. **Window + game loop** — open a *resizable* window, run a delta-timed loop,
   clear the screen, draw a bouncing box (bounds follow the window size), quit
   cleanly on `Esc`/close. ← *current*

All three share one **logical 960×540 coordinate space** with identical game
constants. SDL's 2D renderer already works in logical points, so Zig/C++ draw
directly. Jai's `create_window` takes *pixels* and its renderer draws in the
Retina backing, so Jai multiplies by `DPI_SCALE` (2× on this display) at window
creation and draw time — keeping the on-screen size and the box's relative size
identical across all three.
2. **Sprites** — load a texture, draw a quad, FPS counter.
3. **Input + movement** — keyboard/mouse, delta-time movement.
4. **Entities** — a simple entity store, hundreds of moving sprites.
5. **Collision + a playable thing** — Pong or Breakout.

## Run

### Jai
```sh
cd jai && jai build.jai && ./build/main
```
`build.jai` is a compiler metaprogram that builds `jai/src/main.jai` against the
native modules into `build/main` (`Simp` emits its own linker flags, so no
manual link step).

### Zig
```sh
cd zig && zig build run
```
SDL3 is pulled in via `@cImport("SDL3/SDL.h")`; `build.zig` points at the
Homebrew install (`/opt/homebrew/{include,lib}`) and links `SDL3`.

### C++
```sh
cd cpp && make run
```
Uses `pkg-config sdl3` for the compile/link flags (Homebrew SDL3).

## Status

| Milestone | Jai | Zig | C++ |
|-----------|-----|-----|-----|
| 1. Window + loop | ✅ | ✅ | ✅ |
| 2. Sprites       | ⬜ | ⬜ | ⬜ |
| 3. Input + move  | ⬜ | ⬜ | ⬜ |
| 4. Entities      | ⬜ | ⬜ | ⬜ |
| 5. Collision     | ⬜ | ⬜ | ⬜ |
