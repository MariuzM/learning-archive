#include <stddef.h>
#include <stdint.h>

// Pure C, no libc: compiles straight to wasm and runs inside the same module
// as the Zig code. FNV-1a hash of a byte buffer.
uint32_t fnv1a(const unsigned char *data, size_t len) {
    uint32_t hash = 2166136261u;
    for (size_t i = 0; i < len; i++) {
        hash ^= data[i];
        hash *= 16777619u;
    }
    return hash;
}
