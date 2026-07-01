BOX_SIZE     :: 80.0;
HERO_SPEED   :: 320.0;
LIGHT_RADIUS :: 320.0;

World :: struct {
    movers:     [..] Entity;
    walls:      [..] Entity;
    hero:       Entity;
    dragging:   bool;
    drag_off_x: float;
    drag_off_y: float;
}

make_world :: () -> World {
    world: World;
    array_add(*world.movers, .{100, 100,  220, 170, BOX_SIZE, .{ 77, 166, 242, 255}, true});
    array_add(*world.movers, .{500, 300, -180, 200, BOX_SIZE, .{242, 140,  64, 255}, true});
    array_add(*world.movers, .{200, 400,  150, -90, BOX_SIZE, .{200,  80, 200, 255}, false});
    array_add(*world.walls,  .{240, 130,    0,   0, BOX_SIZE, .{110, 110, 120, 255}, true});
    array_add(*world.walls,  .{620, 330,    0,   0, BOX_SIZE, .{110, 110, 120, 255}, true});
    world.hero = .{440, 230, 0, 0, BOX_SIZE, .{90, 200, 120, 120}, true};
    return world;
}

update_world :: (world: *World, input: *Input, dt: float) {
    if input.mouse_clicked && point_in_entity(world.hero, input.mouse_x, input.mouse_y) {
        world.dragging   = true;
        world.drag_off_x = input.mouse_x - world.hero.x;
        world.drag_off_y = input.mouse_y - world.hero.y;
    }
    if !input.mouse_down  world.dragging = false;

    world.hero.vx = 0;
    world.hero.vy = 0;
    if !world.dragging {
        if input.left   world.hero.vx -= HERO_SPEED;
        if input.right  world.hero.vx += HERO_SPEED;
        if input.up     world.hero.vy -= HERO_SPEED;
        if input.down   world.hero.vy += HERO_SPEED;
    }

    if !input.paused {
        for *m: world.movers  simulate(m, dt, input.win_w, input.win_h);
    }
    if world.dragging {
        drag_hero(*world.hero, input.mouse_x, input.mouse_y, world.drag_off_x, world.drag_off_y, input.win_w, input.win_h);
    } else {
        move_hero(*world.hero, dt, input.win_w, input.win_h);
    }

    for i: 0..world.movers.count - 1 {
        for j: i + 1..world.movers.count - 1 {
            if world.movers[i].solid && world.movers[j].solid {
                resolve_collision(*world.movers[i], *world.movers[j]);
            }
        }
    }
    for *m: world.movers {
        if m.solid  resolve_collision(m, *world.hero);
    }
    for *w: world.walls  resolve_static(*world.hero, w.*);

    for *m: world.movers  clamp_bounds(m, input.win_w, input.win_h);
    clamp_bounds(*world.hero, input.win_w, input.win_h);
}

render_world :: (world: *World, renderer: *SDL_Renderer, hero_sprite: *SDL_Texture) {
    for world.movers  draw_entity(renderer, it);
    for world.walls   draw_entity(renderer, it);

    hero_cx := world.hero.x + world.hero.size * 0.5;
    hero_cy := world.hero.y + world.hero.size * 0.5;
    shadow  := SDL_FColor.{26.0 / 255, 26.0 / 255, 31.0 / 255, 1};
    draw_light(renderer, hero_cx, hero_cy, LIGHT_RADIUS, .{1.0, 0.95, 0.8, 0.65});
    for world.walls  cast_shadow(renderer, hero_cx, hero_cy, it, shadow);
    for world.walls  draw_entity(renderer, it);

    if hero_sprite  draw_sprite(renderer, hero_sprite, world.hero);
    else            draw_entity(renderer, world.hero);
}
