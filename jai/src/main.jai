// This is the program that `build.jai` compiles into build/app.
// Edit it while running `jai build.jai - dev watch` to see live rebuilds.

#import "Basic";

main :: () {
    print("Hello from Jai!\n\n");

    greet("world");

    total := sum(1, 2, 3, 4, 5);
    print("sum = %\n", total);

    p := Player.{name = "Mara", level = 7, hp = 100.0};
    print("player = %\n", p);
    print("is alive? %\n", is_alive(p));
}

greet :: (who: string) {
    print("Hello, %!\n", who);
}

// Variadic procedure: ..int collects all trailing args into a slice.
sum :: (values: ..int) -> int {
    acc := 0;
    for values  acc += it;   // `it` is the implicit loop variable.
    return acc;
}

Player :: struct {
    name:  string;
    level: int;
    hp:    float;
}

is_alive :: (using p: Player) -> bool {
    // `using` lets us touch fields (hp) without writing p.hp.
    return hp > 0.0;
}
