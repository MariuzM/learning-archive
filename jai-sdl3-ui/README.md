# jai-sdl3-ui

A small GUI written in [Jai](https://jai.community/) using **SDL3** + **SDL3_ttf**:
a text input field, a Submit button, and an output label. Whatever you type and
submit (button click or Enter) is copied into the output box.

The input field has a real, movable text cursor — arrow keys, Home/End, and mouse
click all reposition it, and it stays solid while you type/move and only blinks
when idle.

## Requirements

- The OpenJai compiler at `/Users/marius/Dev/jai` (the `jai` wrapper on your `PATH`).
- SDL3 and SDL3_ttf:

  ```sh
  brew install sdl3 sdl3_ttf
  ```

- A TTF font. The app loads `/System/Library/Fonts/Supplemental/Arial.ttf`
  (present by default on macOS). Change `FONT_PATH` in `main.jai` to use another.

## Build & run

```sh
./build.sh
```

This compiles `main.jai` and launches the window. Output goes to `build/`.

## Controls

| Action            | Key / Input                          |
| ----------------- | ------------------------------------ |
| Type text         | any character                        |
| Move cursor       | ← / → , or click in the input box    |
| Jump to start/end | Home / End                           |
| Delete            | Backspace (before), Delete (after)   |
| Submit            | click **Submit** button, or Enter    |
| Quit              | Esc, or close the window             |

Run `./build.sh --selftest` for a headless smoke test: it fills the input,
submits, prints the result, and exits — useful for verifying the build.

## Why `build.sh` instead of `jai build run`

This OpenJai compiler always links with a fixed command (`-lSystem -lobjc`) and
does not turn `#system_library` declarations into linker flags, so it never
passes `-lSDL3` to the linker. `build.sh` works around this: it lets the compiler
produce the object file, then performs the final link itself with
`-L/opt/homebrew/lib -lSDL3 -lSDL3_ttf` added (and `-Wl,-w` to silence harmless
duplicate-library / macOS-version warnings).

## Files

- `main.jai` — the application (SDL3/SDL3_ttf bindings + UI).
- `build.sh` — compile + link + run.
