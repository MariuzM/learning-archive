# Learning Game Engine

Building the same tiny game engine three ways — **Jai**, **Zig**, **C++** — one milestone at a time.
The goal is to learn engine fundamentals (the game loop, rendering, input, entities, collision)
while feeling how each language structures the same code.

## Substrate per language

All three drive **SDL3** so the comparison stays apples-to-apples — same window, same renderer
(Metal on macOS), same event model — and the interesting differences are purely in how each language
structures the code and binds to C:

| Language | SDL3 binding                                          | External deps    |
| -------- | ----------------------------------------------------- | ---------------- |
| Jai      | hand-written `#foreign` bindings (`jai/src/sdl3.jai`) | SDL3, SDL3_ttf   |
| Zig      | `@cImport("SDL3/SDL.h")`                              | SDL3, SDL3_ttf   |
| C++      | `#include <SDL3/SDL.h>`                               | SDL3, SDL3_ttf   |

Jai originally used its built-in `Window_Creation` + `Simp` + `Input` modules (no external deps),
but `Simp` only has an OpenGL backend on macOS — deprecated and measurably slower than SDL's Metal
renderer. The `Simp` version lives in git history if you want to compare.

All three render the on-screen FPS counter with **SDL3_ttf** from the shared
`assets/Karla-Regular.ttf` (SIL OFL), so the text looks identical everywhere.

## Milestones

1. **Window + game loop** — open a _resizable_ window, run a delta-timed loop, clear the screen,
   draw a bouncing box (bounds follow the window size), quit cleanly on `Esc`/close. ← _current_

All three share one **logical 960×540 coordinate space** with identical game constants. SDL's 2D
renderer works in logical points and handles the Retina backing scale itself, so all three draw
directly with no per-language DPI math. 2. **Sprites** — load a texture, draw a quad, FPS
counter. 3. **Input + movement** — keyboard/mouse, delta-time movement. 4. **Entities** — a simple
entity store, hundreds of moving sprites. 5. **Collision + a playable thing** — Pong or Breakout.

## Run

From the repo root, build & launch any engine with the `run.sh` helper:

```sh
./run.sh jai    # build & run the Jai engine
./run.sh zig    # build & run the Zig engine
./run.sh cpp    # build & run the C++ engine
```

## Status

| Milestone        | Jai | Zig | C++ |
| ---------------- | --- | --- | --- |
| 1. Window + loop | ✅  | ✅  | ✅  |
| 2. Sprites       | ⬜  | ⬜  | ⬜  |
| 3. Input + move  | ⬜  | ⬜  | ⬜  |
| 4. Entities      | ⬜  | ⬜  | ⬜  |
| 5. Collision     | ⬜  | ⬜  | ⬜  |
