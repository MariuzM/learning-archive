// 06 — Arrays: fixed, slices, and dynamic.
#import "Basic";

main :: () {
    // Fixed-size array: [N] T. Size is part of the type.
    nums : [5] int;
    for 0..nums.count - 1  nums[it] = it * it;

    print("fixed array, count=%\n", nums.count);
    for nums  print("  nums[%] = %\n", it_index, it);

    // Array literal.
    primes := int.[2, 3, 5, 7, 11];
    print("first prime %, last prime %\n", primes[0], primes[primes.count - 1]);

    // A SLICE ([] T) is a view: a pointer + count. No copy of the data.
    slice : [] int = primes;          // whole array as a slice
    middle := primes[1..3];           // sub-slice: elements 1,2,3
    print("middle slice count=%\n", middle.count);
    for middle  print("  middle %\n", it);

    // DYNAMIC array: [..] T. Grows on demand; allocates from the heap.
    list : [..] int;
    defer array_free(list);           // release when we leave main
    for 0..4  array_add(*list, it * 10);
    print("dynamic count=%\n", list.count);
    for list  print("  list[%]=%\n", it_index, it);

    // Mutating elements during iteration: take `it` by pointer with `*`.
    for * list  it.* += 1;
    print("after +1: %\n", list);
}
