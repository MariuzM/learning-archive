// 04 — Procedures.
#import "Basic";

// Parameters are `name: type`. Return type follows `->`.
add :: (a: int, b: int) -> int {
    return a + b;
}

// Multiple return values — common and idiomatic in Jai.
divmod :: (a: int, b: int) -> (quotient: int, remainder: int) {
    return a / b, a % b;
}

// Default argument values.
greet :: (name: string, greeting := "Hello") {
    print("%, %!\n", greeting, name);
}

// You can name return values; it documents intent.
min_max :: (a: int, b: int) -> (lo: int, hi: int) {
    if a < b return a, b;
    return b, a;
}

main :: () {
    print("add: %\n", add(2, 3));

    // Receive multiple returns into multiple variables.
    q, r := divmod(17, 5);
    print("17 / 5 = % remainder %\n", q, r);

    // Use a default arg, then override it.
    greet("world");
    greet("world", "Hey");

    // Named arguments at the call site (order-independent, self-documenting).
    greet(greeting = "Yo", name = "Jai");

    lo, hi := min_max(9, 4);
    print("lo=% hi=%\n", lo, hi);

    // Ignore a return value you don't need with _ .
    _, only_remainder := divmod(10, 3);
    print("remainder only = %\n", only_remainder);
}
