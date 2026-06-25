// 02 — Variables, constants, and types.
#import "Basic";

main :: () {
    // Full form: name : type = value
    age : int = 30;

    // Type inference: drop the type, keep the value.
    city := "Vilnius";          // inferred as string
    pi   := 3.14159;            // inferred as float64

    // Declaration with no value is zero-initialized.
    counter : int;              // == 0
    ready   : bool;             // == false

    // Explicitly uninitialized (skip zeroing) with ---
    fast : int = ---;           // value is garbage; only do this on purpose

    print("age=% city=% pi=%\n", age, city, pi);
    print("counter=% ready=% fast(garbage)=%\n", counter, ready, fast);

    // Constants use `::`. Known at compile time, cannot change.
    MAX_HEALTH :: 100;
    GREETING   :: "hi";
    print("% %\n", MAX_HEALTH, GREETING);

    // Sized number types are explicit and predictable.
    a : u8  = 255;              // unsigned 8-bit
    b : s32 = -1;              // signed 32-bit
    c : float32 = 1.5;
    d : float64 = 1.5;
    print("% % % %\n", a, b, c, d);

    // Multiple declaration / assignment.
    x, y := 1, 2;
    x, y = y, x;               // swap
    print("x=% y=%\n", x, y);
}
