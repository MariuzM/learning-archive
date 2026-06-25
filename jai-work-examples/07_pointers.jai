// 07 — Pointers.
#import "Basic";

// Pass by pointer so the procedure can modify the caller's variable.
increment :: (p: *int) {
    p.* += 1;          // p.* dereferences; "the int p points at"
}

swap :: (a: *int, b: *int) {
    tmp := a.*;
    a.* = b.*;
    b.* = tmp;
}

main :: () {
    x := 41;

    // *x is "address of x". Its type is *int.
    p := *x;
    print("x=% *p=%\n", x, p.*);

    increment(*x);
    print("after increment, x=%\n", x);   // 42

    a, b := 1, 2;
    swap(*a, *b);
    print("a=% b=%\n", a, b);             // 2 1

    // A pointer that points at nothing is `null`. Check before dereferencing.
    q : *int = null;
    if q == null  print("q is null\n");

    // Pointers into a struct work the same way.
    point := Pair.{10, 20};
    pp := *point;
    pp.x = 99;                 // modifies `point` through the pointer
    print("point.x=%\n", point.x);
}

Pair :: struct { x: int; y: int; }
