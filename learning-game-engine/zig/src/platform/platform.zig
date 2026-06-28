const std = @import("std");
const c = @import("sdl.zig").c;

pub const App = struct {
    window: *c.SDL_Window,
    renderer: *c.SDL_Renderer,
    scale: f32,

    pub fn init(title: [*c]const u8, w: f32, h: f32) !App {
        if (!c.SDL_Init(c.SDL_INIT_VIDEO)) {
            std.debug.print("SDL_Init failed: {s}\n", .{c.SDL_GetError()});
            return error.SDLInit;
        }

        const window = c.SDL_CreateWindow(title, @intFromFloat(w), @intFromFloat(h), c.SDL_WINDOW_RESIZABLE | c.SDL_WINDOW_HIGH_PIXEL_DENSITY) orelse {
            std.debug.print("SDL_CreateWindow failed: {s}\n", .{c.SDL_GetError()});
            return error.SDLWindow;
        };

        const renderer = c.SDL_CreateRenderer(window, null) orelse {
            std.debug.print("SDL_CreateRenderer failed: {s}\n", .{c.SDL_GetError()});
            return error.SDLRenderer;
        };

        const scale = c.SDL_GetWindowPixelDensity(window);
        _ = c.SDL_SetRenderScale(renderer, scale, scale);

        return .{ .window = window, .renderer = renderer, .scale = scale };
    }

    pub fn deinit(self: *App) void {
        c.SDL_DestroyRenderer(self.renderer);
        c.SDL_DestroyWindow(self.window);
        c.SDL_Quit();
    }
};
