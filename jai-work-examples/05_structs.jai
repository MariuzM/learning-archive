// 05 — Structs.
#import "Basic";

Vector2 :: struct {
    x: float;
    y: float;
}

// Fields can have default values.
Player :: struct {
    name:   string;
    health: int = 100;
    pos:    Vector2;
}

// Struct "embedding" with `using`: Enemy gets Vector2's fields directly.
Enemy :: struct {
    using position: Vector2;   // now enemy.x and enemy.y work
    damage: int;
}

length :: (v: Vector2) -> float {
    return sqrt(v.x * v.x + v.y * v.y);
}

main :: () {
    // Declare then assign fields.
    a: Vector2;
    a.x = 3;
    a.y = 4;
    print("a = (%, %), length %\n", a.x, a.y, length(a));

    // Struct literal: TypeName.{ field values in order }
    b := Vector2.{1, 2};
    print("b = (%, %)\n", b.x, b.y);

    // Named fields in a literal (any order; unmentioned use defaults).
    p := Player.{ name = "Hero" };   // health defaults to 100
    print("% has % hp at (%, %)\n", p.name, p.health, p.pos.x, p.pos.y);

    // `using` lets you reach embedded fields directly.
    e: Enemy;
    e.x = 5;            // really e.position.x
    e.y = 6;
    e.damage = 10;
    print("enemy at (%, %) deals %\n", e.x, e.y, e.damage);

    // `using` on a local also drops the prefix for a whole block.
    using a;
    print("via using: x=% y=%\n", x, y);
}
