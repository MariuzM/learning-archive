const c = @import("../platform/sdl.zig").c;

pub const Color = struct { r: u8, g: u8, b: u8, a: u8 };

pub const Entity = struct {
    pos: c.SDL_FPoint,
    vel: c.SDL_FPoint,
    size: f32,
    color: Color,
};

pub fn simulate(e: *Entity, dt: f32, win_w: f32, win_h: f32) void {
    e.pos.x += e.vel.x * dt;
    e.pos.y += e.vel.y * dt;

    if (e.pos.x < 0) {
        e.pos.x = 0;
        e.vel.x = @abs(e.vel.x);
    }
    if (e.pos.y < 0) {
        e.pos.y = 0;
        e.vel.y = @abs(e.vel.y);
    }
    const max_x = win_w - e.size;
    const max_y = win_h - e.size;
    if (e.pos.x > max_x) {
        e.pos.x = max_x;
        e.vel.x = -@abs(e.vel.x);
    }
    if (e.pos.y > max_y) {
        e.pos.y = max_y;
        e.vel.y = -@abs(e.vel.y);
    }
}

pub fn drawEntity(renderer: *c.SDL_Renderer, e: Entity) void {
    _ = c.SDL_SetRenderDrawColor(renderer, e.color.r, e.color.g, e.color.b, e.color.a);
    const box = c.SDL_FRect{ .x = e.pos.x, .y = e.pos.y, .w = e.size, .h = e.size };
    _ = c.SDL_RenderFillRect(renderer, &box);
}
