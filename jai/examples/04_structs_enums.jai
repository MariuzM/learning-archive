// Run with:  jai examples/04_structs_enums.jai && ./04_structs_enums
// Structs, struct literals, enums, and methods-by-convention.

#import "Basic";
#import "Math";

Color :: enum {
	RED;
	GREEN;
	BLUE;
}

Vec2 :: struct {
	x : float;
	y : float;
}

Entity :: struct {
	pos   : Vec2;
	color : Color;
	name  : string = "unnamed"; // fields can have default values
}

main :: () {
	// Struct literal: .{...}. Unset fields take their defaults.
	a := Entity.{pos = .{1, 2}, color = .GREEN};
	b := Entity.{pos = .{3, 4}, color = .BLUE, name = "boss"};

	print("a = %\n", a);
	print("b = %\n", b);

	// Enums print by name and have a count.
	print("color of b is %, total colors = %\n", b.color, enum_values_as_s64(Color).count);

	// Jai has no built-in methods; you just pass the struct.
	print("distance = %\n", length(a.pos));
}

length :: (v: Vec2) -> float {
	return sqrt(v.x * v.x + v.y * v.y);
}
