const std = @import("std");

const c = @cImport({
    @cInclude("SDL3/SDL.h");
});

const WIDTH: f32 = 960;
const HEIGHT: f32 = 540;
const BOX_SIZE: f32 = 80;

pub fn main() !void {
    if (!c.SDL_Init(c.SDL_INIT_VIDEO)) {
        std.debug.print("SDL_Init failed: {s}\n", .{c.SDL_GetError()});
        return error.SDLInit;
    }
    defer c.SDL_Quit();

    const window = c.SDL_CreateWindow("Learning Engine - Zig (milestone 1)", WIDTH, HEIGHT, 0) orelse {
        std.debug.print("SDL_CreateWindow failed: {s}\n", .{c.SDL_GetError()});
        return error.SDLWindow;
    };
    defer c.SDL_DestroyWindow(window);

    const renderer = c.SDL_CreateRenderer(window, null) orelse {
        std.debug.print("SDL_CreateRenderer failed: {s}\n", .{c.SDL_GetError()});
        return error.SDLRenderer;
    };
    defer c.SDL_DestroyRenderer(renderer);

    var pos = c.SDL_FPoint{ .x = 100, .y = 100 };
    var vel = c.SDL_FPoint{ .x = 220, .y = 170 };

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
                else => {},
            }
        }

        simulate(&pos, &vel, dt);
        draw(renderer, pos);

        c.SDL_Delay(10);
    }
}

fn simulate(pos: *c.SDL_FPoint, vel: *c.SDL_FPoint, dt: f32) void {
    pos.x += vel.x * dt;
    pos.y += vel.y * dt;

    if (pos.x < 0) {
        pos.x = 0;
        vel.x = @abs(vel.x);
    }
    if (pos.y < 0) {
        pos.y = 0;
        vel.y = @abs(vel.y);
    }
    const max_x = WIDTH - BOX_SIZE;
    const max_y = HEIGHT - BOX_SIZE;
    if (pos.x > max_x) {
        pos.x = max_x;
        vel.x = -@abs(vel.x);
    }
    if (pos.y > max_y) {
        pos.y = max_y;
        vel.y = -@abs(vel.y);
    }
}

fn draw(renderer: *c.SDL_Renderer, pos: c.SDL_FPoint) void {
    _ = c.SDL_SetRenderDrawColor(renderer, 26, 26, 31, 255);
    _ = c.SDL_RenderClear(renderer);

    _ = c.SDL_SetRenderDrawColor(renderer, 77, 166, 242, 255);
    const box = c.SDL_FRect{ .x = pos.x, .y = pos.y, .w = BOX_SIZE, .h = BOX_SIZE };
    _ = c.SDL_RenderFillRect(renderer, &box);

    _ = c.SDL_RenderPresent(renderer);
}
