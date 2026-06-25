// 08 — Enums and enum_flags.
#import "Basic";

// A plain enum. Members are namespaced under the type: Direction.NORTH.
Direction :: enum {
    NORTH;
    EAST;
    SOUTH;
    WEST;
}

// You can choose the backing type and set explicit values.
HttpStatus :: enum u16 {
    OK            :: 200;
    NOT_FOUND     :: 404;
    SERVER_ERROR  :: 500;
}

// enum_flags is a bitfield: members are powers of two automatically and you
// can OR them together.
Permissions :: enum_flags {
    READ;
    WRITE;
    EXECUTE;
}

describe :: (d: Direction) -> string {
    // Jai has no `switch` keyword; use if / else if. The `==` over enums is
    // exhaustive-friendly and reads cleanly.
    if d == {
        case .NORTH; return "up";
        case .EAST;  return "right";
        case .SOUTH; return "down";
        case .WEST;  return "left";
    }
    return "?";
}

main :: () {
    d := Direction.EAST;
    print("% means %\n", d, describe(d));   // enums print by name

    print("NOT_FOUND = %\n", cast(u16) HttpStatus.NOT_FOUND);

    // Combine flags with |.
    perms := Permissions.READ | .WRITE;

    // Test a flag with &.
    if perms & .WRITE  print("can write\n");
    if !(perms & .EXECUTE)  print("cannot execute\n");
    print("perms = %\n", perms);
}
