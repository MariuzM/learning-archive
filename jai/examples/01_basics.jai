// Run with:  jai examples/01_basics.jai && ./01_basics
// Variables, constants, and the print function.

#import "Basic";

main :: () {
    // name : type = value;  -- full form
    age : int = 30;

    // Type is inferred when you omit it.
    name := "Mara";          // string
    pi   := 3.14159;         // float64 by default for literals

    // Two colons make a compile-time constant (cannot be reassigned).
    MAX_HP :: 100;

    // `%` is replaced, in order, by the following arguments.
    print("name=%, age=%, pi=%\n", name, age, pi);
    print("MAX_HP=%, type of age is %\n", MAX_HP, type_of(age));

    age += 1;
    print("after birthday: %\n", age);
}
