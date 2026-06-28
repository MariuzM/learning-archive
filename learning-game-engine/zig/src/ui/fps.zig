const std = @import("std");
const c = @import("../platform/sdl.zig").c;

pub const FpsCounter = struct {
    value: f32 = 0,
    accum: f32 = 0,
    frames: u32 = 0,
    font: ?*c.TTF_Font = null,
    texture: ?*c.SDL_Texture = null,
    tw: f32 = 0,
    th: f32 = 0,
    scale: f32 = 1,
    last_shown: i32 = -1,

    pub fn init(self: *FpsCounter, font_path: [*c]const u8, render_scale: f32) bool {
        self.scale = render_scale;
        if (!c.TTF_Init()) return false;
        self.font = c.TTF_OpenFont(font_path, 16.0 * render_scale);
        return self.font != null;
    }

    pub fn draw(self: *FpsCounter, renderer: *c.SDL_Renderer, dt: f32) void {
        self.accum += dt;
        self.frames += 1;
        if (self.accum >= 0.5) {
            self.value = @as(f32, @floatFromInt(self.frames)) / self.accum;
            self.frames = 0;
            self.accum = 0;
        }

        const shown: i32 = @intFromFloat(self.value + 0.5);
        if (self.texture == null or shown != self.last_shown) {
            self.last_shown = shown;
            if (self.texture) |t| c.SDL_DestroyTexture(t);

            var buf: [32]u8 = undefined;
            const text = std.fmt.bufPrintZ(&buf, "FPS: {d}", .{shown}) catch return;
            const white = c.SDL_Color{ .r = 230, .g = 230, .b = 230, .a = 255 };
            const surf = c.TTF_RenderText_Blended(self.font, text.ptr, 0, white);
            self.texture = c.SDL_CreateTextureFromSurface(renderer, surf);
            self.tw = @floatFromInt(surf.*.w);
            self.th = @floatFromInt(surf.*.h);
            c.SDL_DestroySurface(surf);
        }

        var dst = c.SDL_FRect{ .x = 8, .y = 8, .w = self.tw / self.scale, .h = self.th / self.scale };
        _ = c.SDL_RenderTexture(renderer, self.texture, null, &dst);
    }
};
