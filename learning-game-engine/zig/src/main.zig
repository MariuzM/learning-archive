const std = @import("std");

const c = @cImport({
    @cInclude("SDL3/SDL.h");
});

const WIDTH: f32 = 960;
const HEIGHT: f32 = 540;
const BOX_SIZE: f32 = 80;

const Color = struct { r: u8, g: u8, b: u8, a: u8 };

const Entity = struct {
    pos: c.SDL_FPoint,
    vel: c.SDL_FPoint,
    size: f32,
    color: Color,
};

pub fn main() !void {
    if (!c.SDL_Init(c.SDL_INIT_VIDEO)) {
        std.debug.print("SDL_Init failed: {s}\n", .{c.SDL_GetError()});
        return error.SDLInit;
    }
    defer c.SDL_Quit();

    const window = c.SDL_CreateWindow("Learning Engine - Zig (milestone 1)", WIDTH, HEIGHT, c.SDL_WINDOW_RESIZABLE) orelse {
        std.debug.print("SDL_CreateWindow failed: {s}\n", .{c.SDL_GetError()});
        return error.SDLWindow;
    };
    defer c.SDL_DestroyWindow(window);

    const renderer = c.SDL_CreateRenderer(window, null) orelse {
        std.debug.print("SDL_CreateRenderer failed: {s}\n", .{c.SDL_GetError()});
        return error.SDLRenderer;
    };
    defer c.SDL_DestroyRenderer(renderer);

    var player = Entity{
        .pos = .{ .x = 100, .y = 100 },
        .vel = .{ .x = 220, .y = 170 },
        .size = BOX_SIZE,
        .color = .{ .r = 77, .g = 166, .b = 242, .a = 255 },
    };
    var win_w: f32 = WIDTH;
    var win_h: f32 = HEIGHT;

    var last: u64 = c.SDL_GetTicks();
    var quit = false;
    while (!quit) {
        const now = c.SDL_GetTicks();
        const dt: f32 = @as(f32, @floatFromInt(now - last)) / 1000.0;
        last = now;

        var event: c.SDL_Event = undefined;
        while (c.SDL_PollEvent(&event)) {
            switch (event.type) {
                c.SDL_EVENT_QUIT => quit = true,
                c.SDL_EVENT_KEY_DOWN => {
                    if (event.key.scancode == c.SDL_SCANCODE_ESCAPE) quit = true;
                },
                c.SDL_EVENT_WINDOW_RESIZED => {
                    win_w = @floatFromInt(event.window.data1);
                    win_h = @floatFromInt(event.window.data2);
                },
                else => {},
            }
        }

        simulate(&player, dt, win_w, win_h);
        draw(renderer, player);

        c.SDL_Delay(10);
    }
}

fn simulate(e: *Entity, dt: f32, win_w: f32, win_h: f32) void {
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

fn draw(renderer: *c.SDL_Renderer, e: Entity) void {
    _ = c.SDL_SetRenderDrawColor(renderer, 26, 26, 31, 255);
    _ = c.SDL_RenderClear(renderer);

    _ = c.SDL_SetRenderDrawColor(renderer, e.color.r, e.color.g, e.color.b, e.color.a);
    const box = c.SDL_FRect{ .x = e.pos.x, .y = e.pos.y, .w = e.size, .h = e.size };
    _ = c.SDL_RenderFillRect(renderer, &box);

    _ = c.SDL_RenderPresent(renderer);
}
