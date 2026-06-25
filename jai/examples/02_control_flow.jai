// Run with:  jai examples/02_control_flow.jai && ./02_control_flow
// if / ifx / while / for, and the if-case switch.

#import "Basic";

main :: () {
	score := 82;

	if score >= 90 {
		print("grade A\n");
	} else if score >= 80 {
		print("grade B\n");
	} else {
		print("grade C or below\n");
	}

	// ifx is an expression (like a ternary).
	label := ifx score >= 60 then "pass" else "fail";
	print("result: %\n", label);

	// Counting loop. `0..4` is an inclusive range -> 0,1,2,3,4.
	for i: 0..4 {
		print("i=% ", i);
	}
	print("\n");

	// while loop.
	n := 3;
	while n > 0 {
		print("countdown %\n", n);
		n -= 1;
	}

	// if-case: Jai's switch. No fallthrough by default.
	day := 3;
	if day == {
		case 1;
			print("Monday\n");
		case 3;
			print("Wednesday\n");
		case;
			print("some other day\n"); // default
	}
}
