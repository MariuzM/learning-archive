# PDF Image Counter

Five independent implementations of the same tool, one per language. Each scans
`assets/pdf.pdf`, counts the image XObjects, and prints the total.

The PDF (v1.3, no compressed object streams) is scanned byte-for-byte for the
`/Subtype /Image` token, requiring `/Image` to end on a PDF whitespace or
delimiter so names like `/ImageB` are not miscounted. All agree: **82 images**.

Each program defaults to `../assets/pdf.pdf` and accepts an optional path argument.

## Rust

```sh
cd rust
cargo run --release
```

## Zig (0.16)

```sh
cd zig
zig build-exe main.zig -O ReleaseFast
./main
```

## Odin

```sh
cd odin
odin build . -out:pdf-image-counter -o:speed
./pdf-image-counter
```

## C

```sh
cd c
cc -O2 main.c -lz -o pdf-image-counter
./pdf-image-counter
```

## Jai

```sh
cd jai
jai main.jai
./main
```
