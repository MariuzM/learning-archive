#import "Basic";

Vector3 :: struct {
	x: float;
	y: float;
	z: float;
}

dot :: (a: Vector3, b: Vector3) -> float {
	return a.x * b.x + a.y * b.y + a.z * b.z;
}

classify :: (n: int) -> string {
	result := "";
	if n == {
		case 0;
			result = "zero";
		case 1;
			result = "one";
		case;
			result = "many";
	}
	return result;
}

main :: () {
	v := Vector3.{1, 2, 3};
	sum := 0.0;
	for 1..10 {
		if it % 2 == 0 {
			sum += dot(v, v);
		} else {
			sum -= 1.0;
		}
	}

	note :: #string END
		This block is a raw string literal.
    	Its braces { } and indentation are preserved exactly.
	END

	print("sum = %\n", sum);
}
