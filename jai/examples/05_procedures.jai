// Run with:  jai examples/05_procedures.jai && ./05_procedures
// Multiple return values, named args, defaults, and polymorphism.

#import "Basic";

main :: () {
	q, r := divmod(17, 5);
	print("17 / 5 = % remainder %\n", q, r);

	// Named + default arguments.
	print("%\n", box("hi"));
	print("%\n", box("hi", width = 10, fill = #char "*"));

	// Polymorphic procedure: $T is resolved per call site at compile time.
	print("max int:   %\n", max_of(3, 9));
	print("max float: %\n", max_of(2.5, 1.5));
}

// `->` introduces the return types; here there are two.
divmod :: (a: int, b: int) -> (quotient: int, remainder: int) {
	return a / b, a % b;
}

box :: (text: string, width: int = 6, fill: u8 = #char " ") -> string {
	builder: String_Builder;
	append(*builder, text);
	for text.count..width-1  append(*builder, fill);
	return builder_to_string(*builder);
}

// $T means "the type is a compile-time parameter, inferred from the argument".
max_of :: (a: $T, b: T) -> T {
	return ifx a > b then a else b;
}
