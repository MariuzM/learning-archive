# Learning Jai

A small starter project for learning the [Jai](https://github.com/Jai-Community/Jai-Community-Library/wiki) programming language.

## Layout

```
build.jai     # build metaprogram (this is your "build system")
src/main.jai  # the program that gets compiled into build/app
examples/     # standalone lessons, each runnable on its own
```

## Building the app

The build metaprogram is `build.jai`. Anything after the lone `-` is passed
to the script (not to the compiler):

```sh
jai build.jai                 # release build  -> build/app
jai build.jai - dev           # debug build (bounds checks, no optimization)
jai build.jai - dev watch     # debug build, then rebuild on every save
jai build.jai - watch         # release build, then rebuild on every save
```

In `watch` mode the script watches `src/` and recompiles whenever a file
changes. Press `Ctrl-C` to stop.

Run the result:

```sh
./build/app
```

## The examples

Each file in `examples/` is self-contained with its own `main`. The build
script can build **and run** all of them for you, in order:

```sh
jai build.jai - examples          # build & run every example once
jai build.jai - examples dev      # same, as debug builds
jai build.jai - examples watch    # rebuild & re-run all when examples/ changes
jai build.jai - examples 2        # build & run only example #2
jai build.jai - examples watch 1  # watch & re-run only example #1
```

The trailing number matches the file's leading digits (`1` -> `01_basics.jai`).

Binaries land in `build/examples/`. You can also compile a single example
directly — the compiler drops an executable named after the file:

```sh
jai examples/01_basics.jai && ./01_basics
```

| File | Covers |
|------|--------|
| `01_basics.jai`        | variables, constants (`::`), type inference, `print` |
| `02_control_flow.jai`  | `if` / `ifx`, `for`, `while`, the `if`-case switch |
| `03_arrays_strings.jai`| fixed arrays, dynamic arrays (`[..]`), slices, strings |
| `04_structs_enums.jai` | structs, struct literals, enums |
| `05_procedures.jai`    | multiple returns, named/default args, polymorphism (`$T`) |

## Where to go next

The compiler ships with a great tour. On this machine it lives at:

- `~/Dev/jai/how_to/`   — numbered, ordered language walkthrough
- `~/Dev/jai/examples/` — larger sample programs
- `~/Dev/jai/modules/`  — the standard library source (very readable)
