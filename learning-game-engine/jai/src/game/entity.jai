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

move_hero :: (e: *Entity, dt: float, win_w: float, win_h: float) {
    e.x += e.vx * dt;
    e.y += e.vy * dt;

    max_x := win_w - e.size;
    max_y := win_h - e.size;
    if e.x < 0      e.x = 0;
    if e.y < 0      e.y = 0;
    if e.x > max_x  e.x = max_x;
    if e.y > max_y  e.y = max_y;
}

point_in_entity :: (e: Entity, px: float, py: float) -> bool {
    return px >= e.x && px <= e.x + e.size && py >= e.y && py <= e.y + e.size;
}

drag_hero :: (e: *Entity, px: float, py: float, off_x: float, off_y: float, win_w: float, win_h: float) {
    e.x = px - off_x;
    e.y = py - off_y;

    max_x := win_w - e.size;
    max_y := win_h - e.size;
    if e.x < 0      e.x = 0;
    if e.y < 0      e.y = 0;
    if e.x > max_x  e.x = max_x;
    if e.y > max_y  e.y = max_y;
}

resolve_collision :: (a: *Entity, b: *Entity) {
    ox := min(a.x + a.size, b.x + b.size) - max(a.x, b.x);
    oy := min(a.y + a.size, b.y + b.size) - max(a.y, b.y);
    if ox <= 0 || oy <= 0  return;

    if ox < oy {
        push := ox / 2;
        if a.x < b.x { a.x -= push; b.x += push; }
        else         { a.x += push; b.x -= push; }
        a.vx = -a.vx;
        b.vx = -b.vx;
    } else {
        push := oy / 2;
        if a.y < b.y { a.y -= push; b.y += push; }
        else         { a.y += push; b.y -= push; }
        a.vy = -a.vy;
        b.vy = -b.vy;
    }
}

draw_entity :: (renderer: *SDL_Renderer, e: Entity) {
    SDL_SetRenderDrawColor(renderer, e.color.r, e.color.g, e.color.b, e.color.a);
    rect := SDL_FRect.{e.x, e.y, e.size, e.size};
    SDL_RenderFillRect(renderer, *rect);
}
