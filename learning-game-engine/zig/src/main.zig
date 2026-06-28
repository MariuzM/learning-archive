const std = @import("std");

const c = @import("sdl.zig").c;
const App = @import("platform.zig").App;
const entity = @import("entity.zig");
const Entity = entity.Entity;
const FpsCounter = @import("utils/fps.zig").FpsCounter;

const WIDTH: f32 = 960;
const HEIGHT: f32 = 540;
const BOX_SIZE: f32 = 80;

pub fn main() !void {
    var app = try App.init("Learning Engine - Zig (milestone 1)", WIDTH, HEIGHT);
    defer app.deinit();

    var player = Entity{
        .pos = .{ .x = 100, .y = 100 },
        .vel = .{ .x = 220, .y = 170 },
        .size = BOX_SIZE,
        .color = .{ .r = 77, .g = 166, .b = 242, .a = 255 },
    };
    var player2 = Entity{
        .pos = .{ .x = 500, .y = 300 },
        .vel = .{ .x = -180, .y = 200 },
        .size = BOX_SIZE,
        .color = .{ .r = 242, .g = 140, .b = 64, .a = 255 },
    };
    var win_w: f32 = WIDTH;
    var win_h: f32 = HEIGHT;
    var show_fps = true;

    var fps = FpsCounter{};
    if (!fps.init("../assets/Karla-Regular.ttf", app.scale)) {
        std.debug.print("Font load failed: {s}\n", .{c.SDL_GetError()});
        return error.FontLoad;
    }

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
                    if (event.key.scancode == c.SDL_SCANCODE_GRAVE) show_fps = !show_fps;
                },
                c.SDL_EVENT_WINDOW_RESIZED => {
                    win_w = @floatFromInt(event.window.data1);
                    win_h = @floatFromInt(event.window.data2);
                },
                else => {},
            }
        }

        entity.simulate(&player, dt, win_w, win_h);
        entity.simulate(&player2, dt, win_w, win_h);

        _ = c.SDL_SetRenderDrawColor(app.renderer, 26, 26, 31, 255);
        _ = c.SDL_RenderClear(app.renderer);
        entity.drawEntity(app.renderer, player);
        entity.drawEntity(app.renderer, player2);
        if (show_fps) fps.draw(app.renderer, dt);
        _ = c.SDL_RenderPresent(app.renderer);

        c.SDL_Delay(10);
    }
}
