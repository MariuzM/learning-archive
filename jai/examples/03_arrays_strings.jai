// Run with:  jai examples/03_arrays_strings.jai && ./03_arrays_strings
// Fixed arrays, dynamic arrays, slices, and strings.

#import "Basic";
#import "String";

main :: () {
	// Fixed-size array.
	primes : [4] int = .[2, 3, 5, 7];
	for primes  print("prime %: %\n", it_index, it); // it_index is the loop index.

	// Dynamic array: grows at runtime. [..] means dynamic.
	names : [..] string;
	print("slice: %\n", *names);

	array_add(*names, "ada");
	array_add(*names, "alan");
	array_add(*names, "grace");
	print("names has % entries: %\n", names.count, names);

	// A slice ([] T) is a view: a pointer + count. No copy is made.
	first_two : [] string = names;
	first_two.count = 2;
	print("slice: %\n", first_two);

	// Strings know their length; no null terminator needed.
	s := "Jai";
	print("'%' has % bytes\n", s, s.count);

	// Build a string from parts using temporary storage.
	joined := join("a", "b", "c", separator = "-");
	print("joined: %\n", joined);

	// Dynamic arrays own heap memory; free it when done.
	array_free(names);
}
