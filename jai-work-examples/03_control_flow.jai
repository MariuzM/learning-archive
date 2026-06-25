// 03 — Control flow: if, while, for, ranges.
#import "Basic";

main :: () {
    // if / else if / else. No parentheses needed around the condition.
    n := 7;
    if n % 2 == 0 {
        print("% is even\n", n);
    } else if n == 7 {
        print("% is lucky\n", n);
    } else {
        print("% is odd\n", n);
    }

    // ifx is the expression form (like a ternary).
    label := ifx n > 5 then "big" else "small";
    print("n is %\n", label);

    // while loop.
    i := 0;
    while i < 3 {
        print("while i=%\n", i);
        i += 1;
    }

    // for over a numeric range. 0..4 is INCLUSIVE on both ends -> 0,1,2,3,4.
    for 0..4 {
        // `it` is the implicit loop variable; `it_index` is the 0-based index.
        print("range it=% it_index=%\n", it, it_index);
    }

    // Name the loop variable yourself instead of `it`:
    for value: 10..12 {
        print("value=%\n", value);
    }

    // Reverse iteration with `for <`.
    for < k: 0..3 {
        print("countdown k=%\n", k);
    }

    // break / continue work as usual.
    for 0..9 {
        if it == 2 continue;   // skip 2
        if it == 5 break;      // stop at 5
        print("loop %\n", it);
    }
}
