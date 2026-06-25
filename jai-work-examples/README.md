# Learning Jai — Work Examples

A progressive set of small, runnable programs for learning the Jai programming
language (by Jonathan Blow / Thekla). Work through them in order.

## Running an example

Jai compiles a file straight to a native executable:

```sh
jai 01_hello.jai
./01_hello        # the exe is named after the file by default
```

Or run the build-and-run in one step depending on your setup. Each file has a
`main :: ()` entry point, so it compiles on its own.

## Order

| File | Topic |
|------|-------|
| `01_hello.jai`        | Entry point, imports, printing |
| `02_variables.jai`    | Declarations, constants, types, inference |
| `03_control_flow.jai` | if / ifx, while, for, ranges, break/continue |
| `04_procedures.jai`   | Procedures, multiple returns, default & named args |
| `05_structs.jai`      | Structs, literals, using, embedding |
| `06_arrays.jai`       | Fixed arrays, slices, dynamic arrays |
| `07_pointers.jai`     | Address-of, dereference, pass-by-pointer |
| `08_enums.jai`        | Enums, enum_flags, switch (if/else over enum) |
| `09_polymorph.jai`    | Polymorphic procedures with `$T` |
| `10_memory.jai`       | defer, allocators, the implicit context |

## Notes on syntax that trips people up

- Declaration is `name : type = value`. Drop the type to infer: `name := value`.
- A **constant** uses `::`  — e.g. `PI :: 3.14159`. Procedures and structs are
  just constants too: `main :: () { ... }`.
- Address-of is `*x`. Dereference is `x.*` (postfix).
- `print` uses `%` as the placeholder for every argument: `print("% and %\n", a, b)`.
