// 09 — Polymorphic (generic) procedures.
#import "Basic";

// `$T` introduces a polymorphic type parameter, deduced from the argument.
// One definition works for int, float, string, ... anything with `>`.
max :: (a: $T, b: T) -> T {
    return ifx a > b then a else b;
}

// $T can be deduced from an array's element type too.
sum :: (items: [] $T) -> T {
    total : T;                  // zero-initialized for whatever T is
    for items  total += it;
    return total;
}

// A polymorphic struct: Stack of any element type.
Stack :: struct (T: Type) {
    items: [..] T;
}

push :: (s: *Stack($T), value: T) {
    array_add(*s.items, value);
}

pop :: (s: *Stack($T)) -> T {
    value := s.items[s.items.count - 1];
    s.items.count -= 1;
    return value;
}

main :: () {
    print("max int   = %\n", max(3, 9));
    print("max float = %\n", max(2.5, 1.5));
    print("max string= %\n", max("apple", "banana"));

    ints   := int.[1, 2, 3, 4];
    floats := float.[1.5, 2.5];
    print("sum ints   = %\n", sum(ints));
    print("sum floats = %\n", sum(floats));

    s : Stack(string);
    defer array_free(s.items);
    push(*s, "a");
    push(*s, "b");
    print("popped %\n", pop(*s));   // b
    print("popped %\n", pop(*s));   // a
}
