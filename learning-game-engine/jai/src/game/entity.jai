Color :: struct {
    r, g, b, a: u8;
}

Entity :: struct {
    x, y:   float;
    vx, vy: float;
    size:   float;
    color:  Color;
}

simulate :: (e: *Entity, dt: float, win_w: float, win_h: float) {
    e.x += e.vx * dt;
    e.y += e.vy * dt;

    if e.x < 0 { e.x = 0; e.vx = abs(e.vx); }
    if e.y < 0 { e.y = 0; e.vy = abs(e.vy); }

    max_x := win_w - e.size;
    max_y := win_h - e.size;
    if e.x > max_x { e.x = max_x; e.vx = -abs(e.vx); }
    if e.y > max_y { e.y = max_y; e.vy = -abs(e.vy); }
}

draw_entity :: (renderer: *SDL_Renderer, e: Entity) {
    SDL_SetRenderDrawColor(renderer, e.color.r, e.color.g, e.color.b, e.color.a);
    rect := SDL_FRect.{e.x, e.y, e.size, e.size};
    SDL_RenderFillRect(renderer, *rect);
}
