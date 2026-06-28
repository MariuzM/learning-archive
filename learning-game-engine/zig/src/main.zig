const std = @import("std");

const c = @import("platform/sdl.zig").c;
const App = @import("platform/platform.zig").App;
const Input = @import("input/input.zig").Input;
const ui = @import("ui/ui.zig");
const graph_mod = @import("ui/components/graph.zig");
const FrameGraph = graph_mod.FrameGraph;
const entity = @import("game/entity.zig");
const Entity = entity.Entity;
const FpsCounter = @import("ui/fps.zig").FpsCounter;

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

    var fps = FpsCounter{};
    if (!fps.init("../assets/Karla-Regular.ttf", app.scale)) {
        std.debug.print("Font load failed: {s}\n", .{c.SDL_GetError()});
        return error.FontLoad;
    }

    var input = Input{ .win_w = WIDTH, .win_h = HEIGHT };

    var graph = FrameGraph{};

    var last: u64 = c.SDL_GetTicks();
    while (!input.quit) {
        const now = c.SDL_GetTicks();
        const dt: f32 = @as(f32, @floatFromInt(now - last)) / 1000.0;
        last = now;

        graph.push(dt);
        input.processEvents();

        entity.simulate(&player, dt, input.win_w, input.win_h);
        entity.simulate(&player2, dt, input.win_w, input.win_h);

        _ = c.SDL_SetRenderDrawColor(app.renderer, 26, 26, 31, 255);
        _ = c.SDL_RenderClear(app.renderer);
        entity.drawEntity(app.renderer, player);
        entity.drawEntity(app.renderer, player2);
        if (input.show_fps) fps.draw(app.renderer, dt);
        if (input.debug) {
            ui.drawDebug(&input, app.renderer, fps.font, app.scale);
            graph_mod.drawFrameGraph(&graph, app.renderer, fps.font, app.scale);
        }
        _ = c.SDL_RenderPresent(app.renderer);

        if (input.fps_cap > 0) {
            const target_ms: u64 = 1000 / input.fps_cap;
            const elapsed: u64 = c.SDL_GetTicks() - now;
            if (elapsed < target_ms) c.SDL_Delay(@intCast(target_ms - elapsed));
        }
    }
}
