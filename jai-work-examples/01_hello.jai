// 01 — Hello, Jai.
//
// `#import` pulls in a module. "Basic" gives us print(), among other things.
#import "Basic";

// Every program needs `main`. Note the shape of a declaration:
//   name :: () { ... }
// The `::` means "constant" — main is a compile-time-known procedure value.
// The `()` is the parameter list (empty here).
main :: () {
    // print() formats with `%`. Each `%` is filled by the next argument.
    print("Hello, Jai!\n");

    name := "world";
    print("Hello, %!\n", name);

    // You can print several values; % is positional left-to-right.
    print("% + % = %\n", 2, 3, 2 + 3);
}
