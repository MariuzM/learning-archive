# Memory Viewer

A small terminal tool that shows **where the data in a Jai program actually lives in
memory** — which region (global / stack / heap), at what address, how many bytes, and
how a struct is laid out field-by-field (including the padding the compiler inserts).

It's a learning tool: you declare some variables, hand pointers to them to the viewer,
and it draws a labeled map of the address space.

## Build & run

Build with the Jai metaprogram (it creates `build/` and emits `build/memory_viewer`):

```sh
jai first.jai
```

Run in the terminal (default):

```sh
./build/memory_viewer
```

Or open the graphical viewer:

```sh
./build/memory_viewer --gui      # ESC or close the window to quit
```

The GUI draws one colored bar per tracked variable — width is proportional to its size
in bytes, color is its region (blue = stack, orange = heap, green = global) — with the
name, type, size, and address on each bar. The font is embedded into the executable at
compile time, so there are no runtime asset paths to worry about.

## What you get

```
ADDRESS SPACE LANDMARKS (this run)
  high addresses
    STACK   0x00016f9c9e40   <- local variables, function frames (grows down)
    HEAP    0x00011de05be0   <- alloc / New / NewArray (manual lifetime)
    GLOBAL  0x00010046f018   <- file-scope vars, string literals (data segment)
  low addresses

TRACKED VARIABLES
ADDRESS           REGION   SIZE       TYPE                    NAME
0x00010046d010    GLOBAL   8 B        s64                     global_counter
    =
0x00016f9ca340    STACK    48 B       Player                  hero
    ||||||
0x00011de059c0    HEAP     256 B      u8                      raw_buffer
    ################################

STRUCT LAYOUT: Player   (48 bytes total)
  +0    4 B   s32       hp
  +4    1 B   u8        level
  +5    3 B   (padding) ----      <- 3 bytes the compiler inserts for alignment
  +8    8 B   Vec2      pos
  +16   16 B  string    name
  +32   16 B  [4]s32    inventory
```

## How it works

- **Regions** — at startup the program records one address it knows lives on the stack,
  one on the heap, and one global. Every tracked address is then classified by which
  landmark it's nearest to (`classify` in [src/viewer.jai](src/viewer.jai)). Stack
  addresses sit very high, heap in the middle, globals in the binary's data segment, so
  nearest-landmark is enough to label them.
- **Size & type** — `track` is polymorphic over the pointed-to type, so it reads
  `size_of(T)` and `type_info(T)` for free. No manual bookkeeping.
- **Struct layout** — `dump_struct_layout` walks `Type_Info_Struct.members`, prints each
  field's `offset_in_bytes` and size, and infers padding from the gaps between fields
  (and any tail padding before the struct's total size).

## Using it on your own data

```jai
view: Memory_View;
capture_landmarks(*view);

x: s64 = 99;
track(*view, "x", *x);                 // any local / global: pass a pointer to it

buf := alloc(1024);
track_block(*view, "buf", buf, 1024);  // raw heap block: pass pointer + byte count

render(*view);
dump_struct_layout(type_info(My_Struct));
```

## Files

- [src/main.jai](src/main.jai) — demo + `--gui` flag parsing: declares globals/locals/heap allocations and tracks them
- [src/viewer.jai](src/viewer.jai) — core model + terminal renderer: regions, tracking, struct layout
- [src/gui.jai](src/gui.jai) — graphical viewer (Simp + Window_Creation), shares the same model
- [src/assets/](src/assets/) — font embedded into the binary at compile time
- [first.jai](first.jai) — Jai build metaprogram (creates `build/`, sets exe name + output path)
