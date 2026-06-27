const std = @import("std");
const c = @import("../sdl.zig").c;

pub const FpsCounter = struct {
    value: f32 = 0,
    accum: f32 = 0,
    frames: u32 = 0,

    pub fn draw(self: *FpsCounter, renderer: *c.SDL_Renderer, dt: f32) void {
        self.accum += dt;
        self.frames += 1;
        if (self.accum >= 0.5) {
            self.value = @as(f32, @floatFromInt(self.frames)) / self.accum;
            self.frames = 0;
            self.accum = 0;
        }

        _ = c.SDL_SetRenderDrawColor(renderer, 230, 230, 230, 255);
        var buf: [32]u8 = undefined;
        const text = std.fmt.bufPrintZ(&buf, "FPS: {d}", .{@as(u32, @intFromFloat(self.value + 0.5))}) catch return;
        _ = c.SDL_RenderDebugText(renderer, 8, 8, text.ptr);
    }
};
