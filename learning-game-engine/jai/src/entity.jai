Color :: struct {
    r, g, b, a: u8;
}

Entity :: struct {
    x, y:   float;
    vx, vy: float;
    size:   float;
    color:  Color;
    solid:  bool;
}
