// 10 — defer, allocation, and the implicit context.
//
// Jai has manual memory management, but with strong conveniences: `defer`
// for cleanup, and an implicit `context` that carries the current allocator.
#import "Basic";

main :: () {
    // `defer` runs a statement when the enclosing scope exits — in REVERSE
    // order. Great for pairing acquire/release right next to each other.
    print("start\n");
    defer print("end (deferred, runs last)\n");
    defer print("this deferred runs first\n");

    // Heap allocation: New() returns a pointer; free() releases it.
    p := New(int);
    defer free(p);            // cleanup sits next to the allocation
    p.* = 123;
    print("heap int = %\n", p.*);

    // Allocate an array on the heap.
    buf := NewArray(4, int);
    defer array_free(buf);
    for 0..buf.count - 1  buf[it] = it + 1;
    print("heap array = %\n", buf);

    // A temporary allocator exists for scratch work you don't free piecemeal.
    // Everything allocated here is reclaimed at reset_temporary_storage().
    {
        // Redirect allocations in this block to temporary storage.
        push_allocator(temp);
        tmp := NewArray(3, int);
        tmp[0] = 7;
        print("temp array = %\n", tmp);
        // No free() needed for `tmp`.
    }
    reset_temporary_storage();   // wipe all temp allocations at once

    print("done body\n");
    // As we return, the two top `defer`s fire in reverse order.
}
